#!./node_modules/.bin/ts-node

import * as JUnitReportMerger from 'junit-report-merger'
import * as fs from 'fs'

const sourceFiles = [];
const cwd = process.cwd();
let sourceDir = `${cwd}/results/`
const args =  process.argv.slice(2)
let outputFile = `${cwd}/results/test-results.xml`

for(let i = 0; i < args.length; i++){
    switch (args[i]){
        case '-o':
        case '--output':
            if(typeof(args[i + 1]) !== 'undefined'){
                outputFile = args[i + 1];
                i++
            }else{
                console.error("--output flag used but no file given");
                process.exit(1)
            }
            break;
        case '-s':
        case '--sourceDir':
            if(typeof(args[i + 1]) !== 'undefined'){
                sourceDir = args[i + 1];
                i++
            }else{
                console.error("--sourceDir flag used but no dir name given");
                process.exit(1)
            }
            break;
        default:
            console.error(`unhandled argument ${args[i]}`)
            process.exit(1);
    }
}

fs.readdirSync(sourceDir).forEach( file => {
      sourceFiles.push(`${sourceDir}/${file}`);
})
console.log("sourceDir: " + sourceDir )
console.log("outputFile: " + outputFile)

JUnitReportMerger.mergeFiles(outputFile,
       sourceFiles,
       (e) => {
       if(e) {
           console.log('ERROR ' + e)
       }else {
           console.log("DONE")
       }
});





