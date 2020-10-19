import path from 'path'
/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on: any, config: any) => {
    // `on` is used to hook into various events Cypress emits
    // `config` is the resolved Cypress config
    on('task', {
        log (message: string) {
            console.log(message)
            return null
        },
        cwd (){
            return process.cwd();
        },
        getEnvVal(val: string){
            return JSON.stringify(process.env[val]);
        }
    })


}
