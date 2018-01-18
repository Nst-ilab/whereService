//node.js組み込みのhttpsクライアント
const https = require('https');

const factory = (https) => {
    return (place,target,callbacks) =>{
        /**
         * デフォルトのcallback関数群
         * onFetch:(text,url) => undefined 記事が見つかった場合のcallback
         * onNotFetch:() => undefined 記事が見つからなかった場合のcallback
         * */
        const defaultCallbacks = {
          onFetch : (text,url) => console.log("Callback:onFetch is not specified."),
          onNotFetch : () => console.log("Callback:onNotFetch is not specified.")
        };
        
        const mergedCallbacks = Object.assign({},defaultCallbacks,callbacks);
        const baseUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(target)}+in+${encodeURIComponent(place)}&key=${process.env.accessKeyId}`;
        const targetUrl = baseUrl;
        console.log(targetUrl);
        /**
         * https.getの使い方は下記参照。正直、res.on('end')以外はおまじないと捉えても構わない
         * @see https://qiita.com/n0bisuke/items/788dc4379fd57e8453a3
         * */
        https.get(targetUrl,(res)=>{
            //response bodyを格納する変数。再代入するのでletで宣言。
            let body = '';
            res.setEncoding('utf8');

            res.on('data', (chunk) => {
                  //chunkを取得するたびにbody変数に追記する
                  body += chunk;
            });
            
            res.on('end', (res) => {
                //responseの取得が終わった時の処理
                
                const result = JSON.parse(body);
                console.log(result);
                
                
                if(result.results.length === 0){
                    //記事が見つからなかった場合
                    console.log("There's not such a place");
                    mergedCallbacks.onNotFetch();//見つからなかったのでonNotFetchにコールバック
                }else{
                    //記事が見つかった場合
                    
                    const address = result.results[0].formatted_address;
                    const lat = result.results[0].geometry.location.lat;
                    const lng = result.results[0].geometry.location.lng;
                    const title = result.results[0].name;
                    
                    //見つかったので、概要とURLを渡してonFetchにコールバックする
                    mergedCallbacks.onFetch(address,lat,lng,title);
                }
            });
        }).on('error',(e)=>{
            //そもそもrequestがエラーになった場合
            console.log(e);//エラーの原因をログに吐いて
            mergedCallbacks.onNotFetch();//onNotFetchにコールバックする
        });
    };
};

//単体テスト用にfactoryもexportしておく
exports.factory = factory;
//本体に結合する用
//httpsを解決した状態で'fetch'関数としてexport
exports.fetch = factory(https);