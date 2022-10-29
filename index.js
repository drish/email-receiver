
const DEFAULT_PORT = 3001;
const port = Number(process.env.PORT) || DEFAULT_PORT;

const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');
const cors = require('cors');
const express = require('express');
const expressPino = require("express-pino-logger");
const logger = require("./logger");
const logRequest = expressPino(logger);

dotenv.config();

const validateEmail = (email) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

async function createServer() {
  const app = express();

  const notion = new Client({
    auth: process.env.NOTION_TOKEN,
  });

  const databaseId = String(process.env.PAGE_ID);

  app.use(express.json());
  app.use(logRequest);
  app.use(cors({
    origin: '*'
  }));

  app.post("/", async (req, res, next) => {

    if (!req.body.email) return next(new Error("invalid email"));

    const email = req.body.email;

    if (!validateEmail(email)) {
      return next(new Error("invalid email"));
    }

    try {
      await notion.pages.create({
        parent: {
          'database_id': databaseId,
        },
        properties: {
          email: {
            type: 'title',
            title: [
              {
                type: 'text',
                text: {
                  content: email,
                },
              },
            ],
          }
        }
      });
    } catch (e) {
      return next(e);
    }

    return res.json({ok: true});
  });

  app.use(async(err, req, res, next) => {
    console.log(err);
    return res.json(500, "failed");
  });

  return app;
}

createServer()
  .then(server => {
    server.listen(port, "0.0.0.0", () => {
      logger.info(`Environment: ${process.env.NODE_ENV}`);
      logger.info(`Server is running at https://0.0.0.0:${port}`);
    });
  });