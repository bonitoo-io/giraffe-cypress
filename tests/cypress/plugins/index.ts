import * as path from 'path'
import * as fs from 'fs'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {PNG} from 'pngjs'
import {images} from 'images'

import * as pixelmatch from 'pixelmatch'

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
        },
        fsCheck(dir = '.'){
            const listing = fs.readdirSync(dir)
            console.log('fsCheck listing ' + listing)
            return listing
        },
        async compareImageFiles(args: {file1: string, file2: string, difFile: string}){
            let matchedPixels = 0;
            let pct = 0;
            args.difFile = args.difFile ? args.difFile : './DIFF.png'

            console.log(`DEBUG diffFileName ${args.difFile}`)
            const expectedImg : PNG = await parseImage(args.file1);
            const actualImg : PNG = await parseImage(args.file2);
            const diff : PNG = new PNG({
                width: Math.max(actualImg.width, expectedImg.width),
                height: Math.max(actualImg.height, expectedImg.height),
            });
            const actualImgAdjusted = adjustCanvas(actualImg, diff.width, diff.height)
            const expectedImgAdjusted = adjustCanvas(expectedImg, diff.width, diff.height)
            matchedPixels = pixelmatch(expectedImgAdjusted.data, actualImgAdjusted.data, diff.data, diff.width, diff.height, {threshold: 0.1})

            const diffImage = new PNG({width: diff.width * 3, height: diff.height})
            for(let y = 0; y < diffImage.height; y++){
                for(let x = 0; x < diffImage.width ; x++){
                    const idx = (((diffImage.width) * y) + x) << 2;
                    let sidx = ((expectedImgAdjusted.width * y) + x) << 2;

                    if(x <= expectedImgAdjusted.width){
                        diffImage.data[idx] = expectedImgAdjusted.data[sidx];
                        diffImage.data[idx + 1] = expectedImgAdjusted.data[sidx + 1]
                        diffImage.data[idx + 2] = expectedImgAdjusted.data[sidx + 2];
                        diffImage.data[idx + 3] = expectedImgAdjusted.data[sidx + 3];
                    }else if(x <= (expectedImg.width + diff.width)){
                        sidx = ((expectedImg.width * y) + (x - expectedImg.width)) << 2
                        diffImage.data[idx] = diff.data[sidx];
                        diffImage.data[idx + 1] = diff.data[sidx + 1]
                        diffImage.data[idx + 2] = diff.data[sidx + 2];
                        diffImage.data[idx + 3] = diff.data[sidx + 3];
                    }else if(x <= (diffImage.width)){
                        sidx = ((expectedImg.width * y) + (x - (expectedImg.width + diff.width))) << 2
                        diffImage.data[idx] = actualImgAdjusted.data[sidx];
                        diffImage.data[idx + 1] = actualImgAdjusted.data[sidx + 1]
                        diffImage.data[idx + 2] = actualImgAdjusted.data[sidx + 2];
                        diffImage.data[idx + 3] = actualImgAdjusted.data[sidx + 3];
                    }
                }
            }

            pct = (matchedPixels / diff.width / diff.height) ** 0.5
            fs.writeFileSync(`${args.difFile}`, PNG.sync.write(diffImage));
            return {pixelDif: matchedPixels, pct: pct};
        },
        cleanDir(dir: string){
            if(dir === '.' || dir === '/'){
                console.error(`WARNING attempt to clear dir ${dir}`);
                return null;
            }
            if(dir.startsWith('/') || dir.startsWith('..')){
                console.error(`WARNING attempt to clear dir ${dir} outside of project.\n` +
                `cleanDir() should only be used for dirs relative to the giraffe-cypress project`)
                return null;
            }
            if (fs.existsSync(dir)) {
                let deleteCount = 0;

                fs.readdirSync(dir).forEach((file, index) => {

                    const curPath = path.join(dir, file);
                    if (fs.lstatSync(curPath).isDirectory()) {
                        console.log(`INFO ${curPath} is a directory.` +
                        `cleanDir() does not recurse and deletes only files.`)
                    } else if(fs.lstatSync(curPath).isSymbolicLink()){
                        console.log(`INFO ${curPath} is a symbolic link.` +
                        `cleanDir() does not traverse links and deletes only local files.`)
                    } else if(fs.lstatSync(curPath).isFile()){
                        // delete file
                        fs.unlinkSync(curPath);
                        deleteCount++;
                    }
                    else {
                        console.log(`INFO ${curPath} is of a type not handled by cleanDir()`)
                    }
                })

                console.log(`INFO deleted ${deleteCount} files from ${dir}`)

                return true;
            }else{
                console.error(`WARNING cleanDir() failed to locate ${dir}`)
                return false;
            }
        }
    })
}

const parseImage = async (imageFile: string) => {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(imageFile)) {
            reject(new Error(`Snapshot ${imageFile} does not exist.`));
            return;
        }

        const fd = fs.createReadStream(imageFile);
        /* eslint-disable func-names */
        fd.pipe(new PNG())
            .on('parsed', function() {
                const that = this;
                resolve(that);
            })
            .on('error', (error: any) => reject(error));
        /* eslint-enable func-names */
    });
}

const adjustCanvas = (image: PNG, width: number, height: number) => {
    if(image.width === width && image.heigth === height){
        return image;
    }

    const adjustedCanvas : PNG = new PNG({
        height: height,
        width: width,
        bitDepth: image.bitDepth,
        inputHasAlpha: true
    })

    PNG.bitblt(image, adjustedCanvas, 0, 0, image.width, image.height, 0, 0)

    return adjustedCanvas;
}
