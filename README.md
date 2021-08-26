# Hyper Zap
Contracts that bring the utility to enter and exit positions in the HyperJump ecosystem in a zap!

## Currently Supported Features
- Zap your native asset (FTM, BNB, etc) to LP positions, and viceversa
- Zap tokens into LPs and viceversa
- Migrate liquidity from other Uniswap Forks to the native router

## NOTE

The Zapper contract must be approved to use the tokens (both single tokens or token pairs / LP pairs) before they are able to zap in, out, or across. Thus any front end must first prompt the user to approve the Zapper before it can be interacted with (similar to what happens when you first try to trade a token).

## Contract Info
- `factory_contracts` are the set of contracts that can be used to interact with an LP pair in order to approve it
- `contracts` are the contracts for the Zapper for each chain and their respective libraries and interfaces

## Read Only Functions

- `estimateZapInToken` give an estimate for zapping into an LP with a given token
- `isFeeOnTransfer` tells you if a given contract is registered in the zapper as a Fee On Transfer token
- `owner` address of the owner

## Public and External Functions

- `setIsFeeOnTransfer` sets address of a token as fee on transfer in the zapper's mapping
- `setRouter` set the address of the router
- `setTokenBridgeForRouter` for a given Token A, sets a bridge Token B, such that the path of the swap would go as such: A -> B -> DESTINATION, instead of routing through the native asset of the chain.
- `swapToNative` swap a token for native asset
- `swapToken` swap a token for another
- `withdraw` withdraw any dust collected in the contract
- `zapAcross` zap from one LP pair X to another LP pair Y of the native router (SUSHI -> HyperJump For Example)
- `zapIn` zap into an LP pair using the native asset
- `zaoInToken` zap into an LP pair using a token
- `zapOut` zap out of an LP pair and receive the native asset
- `zapOutToken` zap out of an LP pair and receive a desired token

## Scripts
- `deployBSC` used to deploy Zapper to BSC Mainnet
- `deployFTM` used to deploy Zapper to Fantom Opera Mainnet
- `approvePair` used to approve and LP pair to interact with the Zapper

