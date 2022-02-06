//
//                                           ,╗#═**ª═╗,
//                                        ╓#▀`▄        `ªφ
//       ╓``██`▐``█▄``Γ```"╗Γ````▌```"¥,,█ ╩ Å██,     ,╓  ▀▄█`▐▌`██``█`╙w ▄▌`▀Γ```"%
//       ▌ ▐█▌ ║H █` █  █▌    ███▌ j█  ██  H   `███▀Ñ╗╬╛   ╙█  ▌ ▐█  █  ╙▄█   ▌ ▐█╕ ║
//      ▐  ╙▀  █▌ Γ ██  █▌ ▐  ███▌ ▐█H ██▌  ╥    █▀╬╫▄▌     █  █  █▌ ║   ╙█   █  ██  L
//      ▌ ▄▄∩ ▐██  ██▌    ╓█  ,,█▌    ,████▄▄,▄▄▄█╜╙███     █  █  ██ ▐▌ ║ └ █ ▐▌  ╓▄╜
//     ║  ██  ██▌ ▐██  ██▀▀▌ ▐███L ║▌ ▐██████████     ╙█▄,≈╓█  █  ██  █ ▐█  █  █  ▌
//     █▄███,▐██  ███  █▌  ▌ '▀▀▀H ██  ██████████ ╦     `,╦█▀  █µ "▀  █  ████▌ ║▌,█
//      ``"`╙▀▀ ▀▀▀█▀███▌  █▄▄▄▄██▄███▄██`▀███████   ╦╦Ñ,╩██▄#╨▀██▄▄Φ▀███┘  ▀▀▀▀▀╙`
//                            ``````` ````  ╙▀████████▀╜` ``      `
// HyperJump Credits
// The multichain reward token of the HyperJump protocol
//
// hyperjump.app
//
//
// SPDX-License-Identifier: MIT
//
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract HyperJumpToken is Ownable, ERC20("HyperJump", "JUMP") {
  uint256 public maxSupply = 250 * 1e6 ether; ///@notice 250 Million max supply
  uint256 private _burnTotal; // burn counter

  /// @notice we mint all tokens then send them to the distributor that is deployed after
  constructor() {
    _mint(address(msg.sender), maxSupply);
    renounceOwnership();
  }

  // burn logic
  function burn(uint256 amount) public {
    _burn(_msgSender(), amount);
    _burnTotal = _burnTotal + amount;
  }

  // interactive burn logic
  function burnFrom(address account, uint256 amount) public {
    uint256 decreasedAllowance = allowance(account, _msgSender()) - amount;
    _approve(account, _msgSender(), decreasedAllowance);
    _burn(account, amount);
    _burnTotal = _burnTotal + amount;
  }

  // view total burnt Hyper Jump credits
  function totalBurned() public view returns (uint256) {
    return _burnTotal;
  }
}
