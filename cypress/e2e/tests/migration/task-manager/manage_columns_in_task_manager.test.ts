import {
    login,
    openManageColumns,
    restoreColumnsToDefault,
    validateTextPresence,
    validateCheckBoxIsDisabled,
    clickByText,
    selectColumns,
} from "../../../../utils/utils"
import { TaskManager } from "../../../models/migration/task-manager/task-manager";
import { button, cancel, save, trTag } from "../../../types/constants";const taskManagerTableColumns = [
    "ID",
    "Application",
    "Status",
    "Kind",
    "Priority",
    "Preemption",
    "Created By",
];
const columnsToShuffleAndTest = [...taskManagerTableColumns.slice(1)];describe(["@tier3"], "Task Manager managing columns validations", function () {
    //automates polarion MTA537
    before("Login and validate data", function () {
        login();
        TaskManager.open();
        taskManagerTableColumns.forEach((column) =>
            validateTextPresence(trTag, column, true)
        );
    });    it("Validates managing columns", function () {
        TaskManager.open();
        validateManagingColumns();
        openManageColumns();
        validateCheckBoxIsDisabled("Id", true);
        clickByText(button, save, true);
    });    it("Validates restoring columns to default", function () {
        TaskManager.open();
        restoreColumnsToDefault();
        taskManagerTableColumns.forEach((column) =>
            validateTextPresence(trTag, column, true)
        );
    });    const validateManagingColumns = () => {
        // randomly choose two columns and select them
        const shuffledColumns = Cypress._.shuffle(columnsToShuffleAndTest);
        const selectedColumns = shuffledColumns.slice(0, 2);
        selectColumns(selectedColumns);
        selectedColumns.forEach((column) => validateTextPresence(trTag, column, false));
        //validate cancel button
        restoreColumnsToDefault();
        selectColumns(selectedColumns, cancel);
        taskManagerTableColumns.forEach((column) =>
            validateTextPresence(trTag, column, true)
        );
    };
});