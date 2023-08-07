import dotenv from "dotenv";
import express, { urlencoded, json } from "express";
import cors from "cors";
import helmet from "helmet";
import listEndpoints from "express-list-endpoints"
import compression from "compression";
import cacheRoute from "./middleware/cacheRoute.js";
import rateLimit from 'express-rate-limit'
import { loadEnv } from "./loadEnv.cjs";
/**
 * You will create the routes for institutions and departments later
 */
import basicUser from "./routes/v1/basicUser.js";
import basic from "./routes/v1/basic.js";
import quiz from "./routes/v1/quiz.js";

import auth from "./routes/v1/auth.js";
import authRoute from "./middleware/authRoute.js";

import endPoints from "./routes/v1/endPoints.js";

dotenv.config();
loadEnv();
const app = express();

const BASE_URL = "api";

/**
 * The current version of this API is 1
 */
const CURRENT_VERSION = "v1";

const PORT = process.env.PORT;

const limit = rateLimit({
  windowMs: 60000, //1 minute duration in milliseconds
  max: 50,
  message: 'You have exceeded 50 requests in 1 minute limit!',
  headers: true,
})

app.use(limit)
app.use(urlencoded({ extended: false }));
app.use(json());
app.use(cors());
app.use(helmet());
app.use(compression());
app.use(cacheRoute);



const getAvailableEndpoints = () => {
  const endpoints = listEndpoints(app);
  const data = [];
  endpoints.forEach((endpoint) => {
    //loop through endpoints
    if (endpoint.path.includes("/ ") || endpoint.path.includes(":id")) return;
     data.push(`${endpoint.path}`);
  });
    return data;
};


app.use(`/${BASE_URL}/${CURRENT_VERSION}/basic`, authRoute, basic);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/auth`, auth);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/seed`, authRoute, basicUser);
app.use(`/${BASE_URL}/${CURRENT_VERSION}/quiz`, authRoute, quiz);
app.get(`/${BASE_URL}/${CURRENT_VERSION}`, (req,res) => res.status(200).json(getAvailableEndpoints()));
app.get(`/${BASE_URL}/${CURRENT_VERSION}/optimisation`, (req, res) => {
  const text = "See you later, alligator. Bye bye bye, butterfly";
  res.json({ msg: text.repeat(1000) });
});

app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});