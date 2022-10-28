# email-receiver

Simple server that receives email strings and stores them in a Notion database.

## Running

`yarn dev`

### Usage

```
curl -d '{"email":"email@email.com"}' -H "Content-Type: application/json" -X POST http://localhost:3000/
```