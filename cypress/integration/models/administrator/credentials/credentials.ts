import {
    click,
    clickByText,
    inputText,
    performRowAction,
    selectUserPerspective,
    selectItemsPerPage,
    notExists,
    exists,
    validateValue,
    selectFromDropList,
    selectFromDropListByText,
    validateTooShortInput,
    validateTooLongInput,
    enumKeys,
    clearAllFilters,
    doesExistText,
} from "../../../../utils/utils";
import {
    administrator,
    button,
    credentials,
    CredentialType,
    deleteAction,
    editAction,
    SEC,
    trTag,
} from "../../../types/constants";
import {
    createBtn,
    credentialNameInput,
    credLabels,
    descriptionInput,
    filterCatType,
    filterCatName,
    filteredBy,
    passwordInput,
    usernameInput,
    filterNameInput,
    filterSelectType,
    filterSubmitButton,
    filterCatCreatedBy,
    filterCreatedByInput,
    modalBoxBody,
} from "../../../views/credentials.view";
import {
    navLink,
    confirmButton,
    cancelButton,
    closeSuccessNotification,
} from "../../../views/common.view";
import { selectType } from "../../../views/credentials.view";
import * as commonView from "../../../views/common.view";
import { CredentialsData } from "../../../types/types";

export class Credentials {
    name = "";
    description = "";
    type = "";
    inUse = false;
    static credUrl = Cypress.env("tackleUrl") + "/identities";

    constructor(name?) {
        if (name) this.name = name;
    }

    static validateFields() {
        Credentials.openList();
        click(createBtn);
        Credentials.fillNameTooShort();
        Credentials.fillNameTooLong();
    }

    protected static fillNameTooShort(): void {
        validateTooShortInput(credentialNameInput, descriptionInput);
    }

    protected static fillNameTooLong(): void {
        validateTooLongInput(credentialNameInput);
    }

    protected static fillUsernameTooShort(): void {
        validateTooShortInput(usernameInput, passwordInput);
    }

    protected static fillUsernameTooLong(): void {
        validateTooLongInput(usernameInput);
    }

    protected static fillPasswordTooShort(): void {
        validateTooShortInput(passwordInput, usernameInput);
    }

    protected static fillPasswordTooLong(): void {
        validateTooLongInput(passwordInput);
    }

    protected fillName(): void {
        inputText(credentialNameInput, this.name);
    }

    protected validateName(name: string) {
        validateValue(credentialNameInput, name);
    }

    protected fillDescription(): void {
        if (this.description != "") {
            inputText(descriptionInput, this.description);
        }
    }

    protected validateDescription(description: string) {
        validateValue(descriptionInput, description);
    }

    protected selectType(type): void {
        click(selectType);
        clickByText(button, type);
    }

    static openList(itemsPerPage = 100) {
        cy.url().then(($url) => {
            if ($url != Credentials.credUrl) {
                selectUserPerspective(administrator);
                clickByText(navLink, credentials);
            }
        });
        cy.contains("h1", "Credentials", { timeout: 120 * SEC });
        selectItemsPerPage(itemsPerPage);
    }

    static getList() {
        return new Promise<Credentials[]>((resolve) => {
            this.openList();
            let list = [];
            cy.get(commonView.appTable, { timeout: 15 * SEC })
                .find(trTag)
                .each(($row) => {
                    let name = $row.find(credLabels.name).text();
                    list.push(new Credentials(name));
                    cy.log(name);
                })
                .then(() => {
                    resolve(list);
                });
        });
    }

    static ApplyFilterByName(value: string) {
        selectFromDropList(filteredBy, filterCatName);
        inputText(filterNameInput, value);
        click(filterSubmitButton);
    }

    static applyFilterByType(type: string) {
        selectFromDropList(filteredBy, filterCatType);
        selectFromDropListByText(filterSelectType, type);
    }

    static applyFilterCreatedBy(value: string) {
        selectFromDropList(filteredBy, filterCatCreatedBy);
        inputText(filterCreatedByInput, value);
        click(filterSubmitButton);
    }

    static filterByType(): void {
        Credentials.openList();
        /*
        CredentialType is enum, here we are getting list of keys from it and iterating this list
        So if more keys and values will be added - there will be no need to put any change here.
        */
        for (const type of enumKeys(CredentialType)) {
            Credentials.applyFilterByType(CredentialType[type]);
            /*
            Applied filter by one of the types and iterate through the whole table comparing
            current filter name with type of each credential in the table
            */
            cy.get(commonView.appTable, { timeout: 15 * SEC })
                .find(trTag)
                .each(($row) => {
                    assert($row.find(credLabels.type), CredentialType[type]);
                });
        }
        clearAllFilters();
    }

    static filterByCreator(name: string): void {
        Credentials.openList();
        Credentials.applyFilterCreatedBy(name);
        cy.get(commonView.appTable, { timeout: 15 * SEC })
            .find(trTag)
            .each(($row) => {
                assert($row.find(credLabels.createdBy), name);
            });
        clearAllFilters();
    }

    create(): void {
        Credentials.openList();
        click(createBtn);
    }

    delete(toBeCanceled = false): void {
        Credentials.openList();
        performRowAction(this.name, deleteAction);
        if (toBeCanceled) {
            click(cancelButton);
            exists(this.name);
        } else {
            cy.get(modalBoxBody).within(() => {
                if (this.inUse) {
                    doesExistText("The credentials are being used by", true);
                }
                doesExistText("This action cannot be undone", true);
            });
            click(confirmButton);
            notExists(this.name);
        }
    }

    edit(cred: CredentialsData): void {
        Credentials.openList();
        performRowAction(this.name, editAction);
    }

    protected closeSuccessNotification(): void {
        click(closeSuccessNotification);
    }
}
