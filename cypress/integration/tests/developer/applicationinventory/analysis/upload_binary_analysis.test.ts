/*
Copyright © 2021 the Konveyor Contributors (https://konveyor.io/)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/
/// <reference types="cypress" />

import {
    login,
    hasToBeSkipped,
    preservecookies,
    deleteApplicationTableRows,
    deleteAllBusinessServices,
    getRandomApplicationData,
    getRandomAnalysisData,
    writeGpgKey,
} from "../../../../../utils/utils";
import { Proxy } from "../../../../models/administrator/proxy/proxy";
import { Analysis } from "../../../../models/developer/applicationinventory/analysis";
import * as data from "../../../../../utils/data_utils";

describe("Upload Binary Analysis", { tags: "@tier1" }, () => {
    before("Login", function () {
        // Prevent hook from running, if the tag is excluded from run
        if (hasToBeSkipped("@tier1")) return;

        // Perform login
        login();
        deleteApplicationTableRows();

        //Disable all proxy settings
        let proxy = new Proxy(data.getRandomProxyData());
        proxy.disableProxy();
    });

    beforeEach("Persist session", function () {
        // Save the session and token cookie for maintaining one login session
        preservecookies();
        cy.fixture("application").then(function (appData) {
            this.appData = appData;
        });
        cy.fixture("analysis").then(function (analysisData) {
            this.analysisData = analysisData;
        });

        // Interceptors
        cy.intercept("POST", "/hub/application*").as("postApplication");
        cy.intercept("GET", "/hub/application*").as("getApplication");
    });

    after("Perform test data clean up", function () {
        // Prevent hook from running, if the tag is excluded from run
        deleteApplicationTableRows();
        deleteAllBusinessServices();
        writeGpgKey("abcde");
    });

    it("Upload Binary Analysis", function () {
        const application = new Analysis(
            getRandomApplicationData("uploadBinary"),
            getRandomAnalysisData(this.analysisData[3])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        // No credentials required for uploaded binary.
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
    });

    it("Custom rules with custom targets", function () {
        // Automated https://issues.redhat.com/browse/TACKLE-561
        const application = new Analysis(
            getRandomApplicationData("customRule_customTarget"),
            getRandomAnalysisData(this.analysisData[4])
        );
        application.create();
        cy.wait("@getApplication");
        cy.wait(2000);
        // No credentials required for uploaded binary.
        application.analyze();
        application.verifyAnalysisStatus("Completed");
        application.openreport();
    });
});
