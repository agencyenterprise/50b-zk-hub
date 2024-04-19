# 50B ZK HUB

The ZK HUB is responsible for managing the interactions between the worker and the clients. When a proof is requested by a client, the Hub is the one responsible for finding an available worker and then send the necessary information for the worker to generate the proof.

## The ZK Hub offers a view endpoints for the clients:

### To create an account

POST `http://localhost:8080/auth/register`

example payload:
```JSON
{
	"email": "test@gmail.com",
	"password": "123",
	"paymentPublicKey": "0x1"
}
```

### To login

POST `http://localhost:8080/auth/login`

example payload:
```JSON
{
	"email": "test@gmail.com",
	"password": "123"
}
```

### To generate an API KEY

POST `http://localhost:8080/auth/generateApiKey`

### To request a proof generation

POST `http://localhost:8080/jobs`

headers:

```JSON
{
  "API_KEY": "your api key"
}
```

example payload:
```JSON
{
	"clientId": "Your Client ID",
	"r1csScript": "r1cs script encoded in base64"
}
```

* Your Client ID
* r1cs script encoded in base64

### To send the witness

POST `http://localhost:8080/jobs`

On this endpoint you will need to create an AES Key and AES IV to public encrypt the witness file with worker public key.

headers:

```JSON
{
  "API_KEY": "your api key"
}
```

example payload:
```JSON
{
	"jobId": "Your Client ID",
  "witness": ".wtss file encoded in base64",
  "aesKey": "AES Key used to public encrypt the witness",
  "aesIv": "AES IV used to public encrypt the witness"
}
```

