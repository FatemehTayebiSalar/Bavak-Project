const { AdminRoleController } = require("../../http/controllers/admin/RBAC/role.controller");
const { stringToArray } = require("../../http/middlewares/stringToArray");

const router = require("express").Router();


router.post("/add" , stringToArray("permissions") ,AdminRoleController.createNewRole)
router.get("/" , AdminRoleController.getListOfRoles)
router.patch("/update/:id" , stringToArray("permissions") , AdminRoleController.updateRoleById)
router.delete("/remove/:field" , AdminRoleController.removeRole)


module.exports = {
    RoleAdminApiRoutes : router
}