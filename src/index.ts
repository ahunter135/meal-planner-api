import { Singleton } from './api/v1/interfaces/module';
import { Environment } from './config/environment';
import { UserRoutes, EntryRoutes, MustHaveRoutes, AuthRoutes } from "./api/v1/routes/module";
import { API_BASE_ENDPOINT } from './config/constants';
import { Express } from 'express';

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require('express');
const cors = require("cors");

class Index extends Singleton {
    private static instance: Index;

    app: Express = express();
    environment: Environment = Environment.getInstance();

    public static getInstance(): Index {
        if (!Index.instance) Index.instance = new Index();
        return Index.instance;
    }

    private constructor() { super(); }

    /**
     * @description Function responsible for starting the application.
     */
    start(): void {
        this.setRoutes();
        this.setGlobalMiddleware();

        try {
            this.app.listen(4141, () => {
                console.log("Server started and listening on port 4141");
            });
        } catch (e) {
            console.error(e, "Error starting the express server.");
            return;
        }
    }

    private setRoutes() {
        try {
            this.app.set('base', API_BASE_ENDPOINT);
            
            this.app.use("/user", UserRoutes);
            this.app.use("/entry", EntryRoutes);
            this.app.use("/mustHave", MustHaveRoutes);
            this.app.use("/auth", AuthRoutes);
        } catch (e) {
            console.error(e, "Error setting routes");
            throw e;
        }
    }

    private setGlobalMiddleware() {
        try {
            this.app.use(cors());
            this.app.use(bodyParser.urlencoded({ extended: true }));
            this.app.use(bodyParser.json());
            this.app.use(cookieParser());
        } catch (e) {
            console.error(e, "Error setting global middleware");
            throw e;
        }
    }
}