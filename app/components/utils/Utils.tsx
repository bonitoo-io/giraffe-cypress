
function makeInfluxReq(method, url){
    return new Promise(function(resolve, reject) {
        let xhr = new XMLHttpRequest();
        xhr.open(method, url);
        xhr.onload = function(){
            if(this.status >= 200 && this.status <= 300){
                resolve(xhr.response)
            }else{
                reject({
                    status: this.status,
                    statusText: this.statusText
                })
            }
        }
        xhr.onerror = function(){
            reject({
                status: this.status,
                statusText: this.statusText
            })
        }
        xhr.send();
    })
}

export {
    makeInfluxReq
}
