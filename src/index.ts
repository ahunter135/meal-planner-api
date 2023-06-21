import { Singleton } from './api/v1/interfaces/module';
import { Environment } from './config/environment';
import { UserRoutes, EntryRoutes, MustHaveRoutes, AuthRoutes } from "./api/v1/routes/module";
import { API_BASE_ENDPOINT } from './config/constants';
import { Express } from 'express';
import { Database } from './config/database';

const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const express = require('express');
const cors = require("cors");

class Index extends Singleton {
    private static instance: Index;

    app: Express = express();
    environment: Environment = Environment.getInstance();
    database: Database = Database.getInstance();

    public static getInstance(): Index {
        if (!Index.instance) Index.instance = new Index();
        return Index.instance;
    }

    private constructor() { super(); }

    /**
     * @description Function responsible for starting the application.
     */
    async start(): Promise<void> {
        try { await this.database.initializeDatabase(); }
        catch(e) { console.error(e, "Error initializing database."); return; }

        this.setRoutes();
        this.setGlobalMiddleware();

        try {
            this.app.listen(this.environment.API_PORT, () => {
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
            console.log("Routes setup successfully");
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
            console.log("Global middlewares setup successfully");
        } catch (e) {
            console.error(e, "Error setting global middleware");
            throw e;
        }
    }
}

Index.getInstance().start();