# DSTRX subgraph deploy steps

## Deployment (mainnet - testnet)

* Start TheGraph node

```bash

git clone https://github.com/hieuvubk/graph-node

git checkout mainnet/testnet for mainnet/testnet branch

cd graph-node/docker

docker-compose up -d

```

* Example docker-compose.yml file

```yaml
version: '3'
services:
  graph-node:
    image: graphprotocol/graph-node
    ports:
      - '8000:8000'
      - '8001:8001'
      - '8020:8020'
      - '8030:8030'
      - '8040:8040'
    depends_on:
      - ipfs
      - postgres
    environment:
      postgres_host: postgres
      postgres_user: graph-node
      postgres_pass: let-me-in
      postgres_db: graph-node
      ipfs: 'ipfs:5001'
      ethereum: 'mainnet:https://json-rpc.realio.network'
      GRAPH_LOG: info
  ipfs:
    image: ipfs/go-ipfs:v0.4.23
    ports:
      - '5001:5001'
    volumes:
      - ./data/ipfs:/data/ipfs
  postgres:
    image: postgres
    ports:
      - '5477:5432'
    command: ["postgres", "-cshared_preload_libraries=pg_stat_statements"]
    environment:
      POSTGRES_USER: graph-node
      POSTGRES_PASSWORD: let-me-in
      POSTGRES_DB: graph-node
    volumes:
      - ./data/postgres:/var/lib/postgresql/data
```

* We should run mainnet/testnet node on separate servers

* Create and deploy your graphs, clone project to same host and

```bash
# testnet network
npm install
npm run codegen && npm run build
npm run create-testnet
npm run deploy-testnet

# mainnet
npm run create-mainnet
npm run deploy-mainnet
