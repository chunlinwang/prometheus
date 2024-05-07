# Start
```sh
docker-compose up
```


# Run test push gateway:
```sh
 docker-compose exec app npx ts-node src/test.ts 
```

```sh
 docker-compose exec app2 npx ts-node src/test.ts 
```

```sh
 docker-compose exec app3 npx ts-node src/test.ts 
```

# Start app 
```sh
docker-compose exec app npm run start:dev
```

```sh
docker-compose exec app2 npm run start:dev
```

```sh
docker-compose exec app3 npm run start:dev
```


# config de prometheus
prometheus.yml


# endpoints

app: http://127.0.0.1:2000/
app2: http://127.0.0.1:2001/
app3: http://127.0.0.1:2002/
prometheus: http://127.0.0.1:9090/
prometheus_push_gateway: http://127.0.0.1:9091/
grafana: http://127.0.0.1:3000/


* Attention: If we want to add data source of grafana, url is http://host.docker.internal:9090
