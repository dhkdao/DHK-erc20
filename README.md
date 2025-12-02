# DHK-erc20

ERC20 token contract for DHK - dao

Current deplpoyed contract address is `0x759938b0D935f6e3eF60b01E0981F271DEd7078E`

## Development

```shell
npm run format
npm run lint
npm run test
```

For local dev, it's recommend to use anvil (https://getfoundry.sh/anvil/overview/),

send the init eth to deployment wallet for testing:

```
cast send 0x4e073a1751953377f9b350b35847dedc4af742ea \
  --value 100000000000000000000 \
  --private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  \
  --rpc-url http://127.0.0.1:8545
```

## Deploy

```
npx hardhat ignition deploy ./ignition/modules/DHK.ts \
    --strategy create2 \
    --parameters ignition/parameters.json \
    --network anvil 
```
