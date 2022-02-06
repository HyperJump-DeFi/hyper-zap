// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./libraries/bsc/TransferHelper.sol";

import "./interfaces/IThugswapRouter02.sol";
import "./interfaces/IUniswapV2Pair.sol";

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./IZap.sol";

contract BscZap is Ownable, IZap {
    using SafeMath for uint;
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    address private WNATIVE;
    mapping(address => mapping(address => address)) private tokenBridgeForRouter;
    mapping(address => bool) public isFeeOnTransfer;

    IThugswapRouter02 internal router_;

    constructor(address _WNATIVE, address _router) Ownable() {
       WNATIVE = _WNATIVE;
       router_ = IThugswapRouter02(_router);
    }

    /* ========== External Functions ========== */

    receive() external payable {}

    function zapInToken(address _from, uint amount, address _to,address _recipient) external override {
        if (isFeeOnTransfer[_from]) {
            IERC20(_from).transferFrom(msg.sender, address(this), amount);
            _swapTokenToLP(_from, IERC20(_from).balanceOf(address(this)), _to, _recipient);
            return;
        } else {
            // From an ERC20 to an LP token, through specified router, going through base asset if necessary
            IERC20(_from).safeTransferFrom(msg.sender, address(this), amount);
            // we'll need this approval to add liquidity
            _swapTokenToLP(_from, amount, _to, _recipient);
            return;
        }
    }

    function estimateZapInToken(address _from, address _to, uint _amt) public view override returns (uint256, uint256) {
        // get pairs for desired lp
        IUniswapV2Pair pair = IUniswapV2Pair(_to);
        if (_from == pair.token0() || _from == pair.token1()) { // check if we already have one of the assets
            // if so, we're going to sell half of _from for the other token we need
            // figure out which token we need, and approve
            address other = _from == pair.token0() ? pair.token1() : pair.token0();
            // calculate amount of _from to sell
            uint sellAmount = _amt.div(2);
            // execute swap
            uint otherAmount = _estimateSwap(_from, sellAmount, other);
            if (_from == pair.token0()) {
                return (sellAmount, otherAmount);
            } else {
                return (otherAmount, sellAmount);
            }
        } else {
            // go through native token for highest liquidity
            uint nativeAmount = _from == WNATIVE ? _amt : _estimateSwap(_from, _amt, WNATIVE);
            if (WNATIVE == pair.token0()) {
                return (nativeAmount.div(2), _estimateSwap(WNATIVE, nativeAmount.div(2), pair.token1()));
            }
            if (WNATIVE == pair.token1()) {
                return (_estimateSwap(WNATIVE, nativeAmount.div(2), pair.token0()), nativeAmount.div(2));
            }
                return (_estimateSwap(WNATIVE, nativeAmount.div(2), pair.token0()), _estimateSwap(WNATIVE, nativeAmount.div(2), pair.token1()));
        }
    }

    function zapIn(address _to, address _recipient) external payable override {
        // from Native to an LP token through the specified router
        _swapNativeToLP(_to, msg.value, _recipient);
    }

    function zapAcross(address _from, uint amount, address _recipient) external override {
        IERC20(_from).safeTransferFrom(msg.sender, address(this), amount);

        IUniswapV2Pair pair = IUniswapV2Pair(_from);

        IERC20(_from).safeTransfer(_from, amount);
        uint amt0;
        uint amt1;
        (amt0, amt1) = pair.burn(address(this));
        router_.addLiquidity(pair.token0(), pair.token1(), amt0, amt1, 0, 0, _recipient, block.timestamp);
    }

    function zapOut(address _from, uint amount, address _recipient) external override {
        // from an LP token to Native through specified router
        // take the LP token
        IERC20(_from).safeTransferFrom(msg.sender, address(this), amount);
        

        // get pairs for LP
        IUniswapV2Pair pair = IUniswapV2Pair(_from);
        address token0 = pair.token0();
        address token1 = pair.token1();
        // check if either is already native token
        if (token0 == WNATIVE || token1 == WNATIVE) {
            // if so, we only need to swap one, figure out which and how much
            address token = token0 != WNATIVE ? token0 : token1;
            uint amtToken;
            uint amtBNB;
            (amtToken, amtBNB) = router_.removeLiquidityBNB(token, amount, 0, 0, address(this), block.timestamp);
            // swap with msg.sender as recipient, so they already get the Native
            _swapTokenForNative(token, amtToken, _recipient);
            // send other half of Native
            TransferHelper.safeTransferBNB(_recipient, amtBNB);
        } else {
            // convert both for Native with msg.sender as recipient
            uint amt0;
            uint amt1;
            (amt0, amt1) = router_.removeLiquidity(token0, token1, amount, 0, 0, address(this), block.timestamp);
            _swapTokenForNative(token0, amt0, _recipient);
            _swapTokenForNative(token1, amt1, _recipient);
        }
    }

    function zapOutToken(address _from, uint amount, address _to, address _recipient) external override {
        // from an LP token to an ERC20 through specified router
        IERC20(_from).safeTransferFrom(msg.sender, address(this), amount);
        

        IUniswapV2Pair pair = IUniswapV2Pair(_from);
        address token0 = pair.token0();
        address token1 = pair.token1();
        uint amt0;
        uint amt1;
        (amt0, amt1) = router_.removeLiquidity(token0, token1, amount, 0, 0, address(this), block.timestamp);
        if (token0 != _to) {
            amt0 = _swap(token0, amt0, _to, address(this));
        }
        if (token1 != _to) {
            amt1 = _swap(token1, amt1, _to, address(this));
        }
        IERC20(_to).safeTransfer(_recipient, amt0.add(amt1));
    }

    function swapToken(address _from, uint amount, address _to, address _recipient) external override {
        IERC20(_from).safeTransferFrom(msg.sender, address(this), amount);
        _swap(_from, amount, _to, _recipient);
    }

    function swapToNative(address _from, uint amount, address _recipient) external override {
        IERC20(_from).safeTransferFrom(msg.sender, address(this), amount);
        _swapTokenForNative(_from, amount, _recipient);
    }


    /* ========== Private Functions ========== */

    function _swapTokenToLP(address _from, uint amount, address _to, address recipient) private returns (uint) {
        // get pairs for desired lp
        IUniswapV2Pair pair = IUniswapV2Pair(_to);
        if (_from == pair.token0() || _from == pair.token1()) { // check if we already have one of the assets
            // if so, we're going to sell half of _from for the other token we need
            // figure out which token we need, and approve
            address other = _from == pair.token0() ? pair.token1() : pair.token0();
            // calculate amount of _from to sell
            uint sellAmount = amount.div(2);
            // execute swap
            uint otherAmount = _swap(_from, sellAmount, other, address(this));
            uint liquidity;
            ( , , liquidity) = router_.addLiquidity(_from, other, amount.sub(sellAmount), otherAmount, 0, 0, recipient, block.timestamp);
            return liquidity;
        } else {
            // go through native token for highest liquidity
            uint nativeAmount = _swapTokenForNative(_from, amount, address(this));
            return _swapNativeToLP(_to, nativeAmount, recipient);
        }
    }

    function _swapNativeToLP(address _LP, uint amount, address recipient) private returns (uint) {
            // LP
            IUniswapV2Pair pair = IUniswapV2Pair(_LP);
            address token0 = pair.token0();
            address token1 = pair.token1();
            uint liquidity;
            if (token0 == WNATIVE || token1 == WNATIVE) {
                address token = token0 == WNATIVE ? token1 : token0;
                ( , , liquidity) = _swapHalfNativeAndProvide(token, amount, recipient);
            } else {
                ( , , liquidity) = _swapNativeToEqualTokensAndProvide(token0, token1, amount, recipient);
            }
            return liquidity;
    }

    function _swapHalfNativeAndProvide(address token, uint amount, address recipient) private returns (uint, uint, uint) {
            uint swapValue = amount.div(2);
            uint tokenAmount = _swapNativeForToken(token, swapValue, address(this));
            return router_.addLiquidityBNB{value : amount.sub(swapValue)}(token, tokenAmount, 0, 0, recipient, block.timestamp);
    }

    function _swapNativeToEqualTokensAndProvide(address token0, address token1, uint amount, address recipient) private returns (uint, uint, uint) {
            uint swapValue = amount.div(2);
            uint token0Amount = _swapNativeForToken(token0, swapValue, address(this));
            uint token1Amount = _swapNativeForToken(token1, amount.sub(swapValue), address(this));
            return router_.addLiquidity(token0, token1, token0Amount, token1Amount, 0, 0, recipient, block.timestamp);
    }

    function _swapNativeForToken(address token, uint value, address recipient) private returns (uint) {
        address[] memory path;

        address routerAddr = address(router_);

        if (tokenBridgeForRouter[token][routerAddr] != address(0)) {
            path = new address[](3);
            path[0] = WNATIVE;
            path[1] = tokenBridgeForRouter[token][routerAddr];
            path[2] = token;
        } else {
            path = new address[](2);
            path[0] = WNATIVE;
            path[1] = token;
        }

        uint[] memory amounts = router_.swapExactBNBForTokens{value : value}(0, path, recipient, block.timestamp);
        return amounts[amounts.length - 1];
    }

    function _swapTokenForNative(address token, uint amount, address recipient) private returns (uint) {
        address[] memory path;

        address routerAddr = address(router_);

        if (tokenBridgeForRouter[token][routerAddr] != address(0)) {
            path = new address[](3);
            path[0] = token;
            path[1] = tokenBridgeForRouter[token][routerAddr];
            path[2] = WNATIVE;
        } else {
            path = new address[](2);
            path[0] = token;
            path[1] = WNATIVE;
        }
        

        if (isFeeOnTransfer[token]) {
            router_.swapExactTokensForBNBSupportingFeeOnTransferTokens(amount, 0, path, recipient, block.timestamp);
            return IERC20(token).balanceOf(address(this));
        } else {
            uint[] memory amounts = router_.swapExactTokensForBNB(amount, 0, path, recipient, block.timestamp);
            return amounts[amounts.length - 1];
        }
    }

    function _swap(address _from, uint amount, address _to, address recipient) private returns (uint) {
        address routerAddr = address(router_);

        address fromBridge = tokenBridgeForRouter[_from][routerAddr];
        address toBridge = tokenBridgeForRouter[_to][routerAddr];

        address[] memory path;

        if (fromBridge != address(0) && toBridge != address(0)) { // both have bridge
            if (fromBridge != toBridge) {
                path = new address[](5);
                path[0] = _from;
                path[1] = fromBridge;
                path[2] = WNATIVE;
                path[3] = toBridge;
                path[4] = _to;
            } else {
                path = new address[](3);
                path[0] = _from;
                path[1] = fromBridge;
                path[2] = _to;
            }
        } else if (fromBridge != address(0)) { // from has bridge
            if (fromBridge == _to) {
                path = new address[](2);
                path[0] = _from;
                path[1] = _to;
            }
            else if (_to == WNATIVE) {
                path = new address[](3);
                path[0] = _from;
                path[1] = fromBridge;
                path[2] = WNATIVE;
            } else {
                path = new address[](4);
                path[0] = _from;
                path[1] = fromBridge;
                path[2] = WNATIVE;
                path[3] = _to;
            }
        } else if (toBridge != address(0)) { // only _to ha a bridge, not _from
            if (_from == toBridge) {
                path = new address[](2);
                path[0] = _from;
                path[1] = _to;
            } else if (_from == WNATIVE) {
                path = new address[](3);
                path[0] = WNATIVE;
                path[1] = toBridge;
                path[2] = _to;
            }
            else {
                path = new address[](4);
                path[0] = _from;
                path[1] = WNATIVE;
                path[2] = toBridge;
                path[3] = _to;
            }
        } else if (_from == WNATIVE || _to == WNATIVE) {
            path = new address[](2);
            path[0] = _from;
            path[1] = _to;
        } else {
            // Go through WNative
            path = new address[](3);
            path[0] = _from;
            path[1] = WNATIVE;
            path[2] = _to;
        }

        uint[] memory amounts;

        if (isFeeOnTransfer[_from]) {
            router_.swapExactTokensForTokensSupportingFeeOnTransferTokens(amount, 0, path, recipient, block.timestamp);
            return IERC20(_to).balanceOf(address(this));
        } else {
            amounts = router_.swapExactTokensForTokens(amount, 0, path, recipient, block.timestamp);
        }

        return amounts[amounts.length - 1];
    }

    function _estimateSwap(address _from, uint amount, address _to) private view returns (uint) {
        address routerAddr = address(router_);

        address fromBridge = tokenBridgeForRouter[_from][routerAddr];
        address toBridge = tokenBridgeForRouter[_to][routerAddr];

        address[] memory path;

        if (fromBridge != address(0) && toBridge != address(0)) {
            if (fromBridge != toBridge) {
                path = new address[](5);
                path[0] = _from;
                path[1] = fromBridge;
                path[2] = WNATIVE;
                path[3] = toBridge;
                path[4] = _to;
            } else {
                path = new address[](3);
                path[0] = _from;
                path[1] = fromBridge;
                path[2] = _to;
            }
        } else if (fromBridge != address(0)) {
            if (fromBridge == _to) {
                path = new address[](2);
                path[0] = _from;
                path[1] = _to;
            }
            else if (_to == WNATIVE) {
                path = new address[](3);
                path[0] = _from;
                path[1] = fromBridge;
                path[2] = WNATIVE;
            } else {
                path = new address[](4);
                path[0] = _from;
                path[1] = fromBridge;
                path[2] = WNATIVE;
                path[3] = _to;
            }
        } else if (toBridge != address(0)) {
            if (_from == toBridge) {
                path = new address[](2);
                path[0] = _from;
                path[1] = _to;
            } else if (_from == WNATIVE) {
                path = new address[](3);
                path[0] = WNATIVE;
                path[1] = toBridge;
                path[2] = _to;
            }
            else {
                path = new address[](4);
                path[0] = _from;
                path[1] = WNATIVE;
                path[2] = toBridge;
                path[3] = _to;
            }
        } else if (_from == WNATIVE || _to == WNATIVE) {
            path = new address[](2);
            path[0] = _from;
            path[1] = _to;
        } else {
            // Go through WNative
            path = new address[](3);
            path[0] = _from;
            path[1] = WNATIVE;
            path[2] = _to;
        }

        uint[] memory amounts = router_.getAmountsOut(amount, path);
        return amounts[amounts.length - 1];
    }


    /* ========== RESTRICTED FUNCTIONS ========== */

    function setTokenBridgeForRouter(address token, address bridgeToken) external onlyOwner {
       tokenBridgeForRouter[token][address(router_)] = bridgeToken;
    }

    function withdraw(address token) external onlyOwner {
        if (token == address(0)) {
            payable(owner()).transfer(address(this).balance);
            return;
        }

        IERC20(token).transfer(owner(), IERC20(token).balanceOf(address(this)));
    }

    function setIsFeeOnTransfer(address token) external onlyOwner {
        isFeeOnTransfer[token] = true;
    }

    function setRouter(address _router) external onlyOwner {
        router_ = IThugswapRouter02(_router);
    }
}