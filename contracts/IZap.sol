// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

interface IZap {
    function estimateZapInToken(address _from, address _to, uint _amt) external view returns (uint256, uint256);
    function swapToken(address _from, uint amount, address _to, address _recipient) external;
    function swapToNative(address _from, uint amount,  address _recipient) external;
    function zapIn(address _to, address _recipient) external payable;
    function zapInToken(address _from, uint amount, address _to, address _recipient) external;
    function zapAcross(address _from, uint amount, address _recipient) external;
    function zapOut(address _from, uint amount, address _recipient) external;
    function zapOutToken(address _from, uint amount, address _to, address _recipient) external;
}
