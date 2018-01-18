
    
     //ユーザーのリクエストから調べるべきワードを分析するモジュール
    const requestAnalyzer = require('./request-analyzer');
    //PlaceAPIで場所を探索するモジュール
    const googleplaceapiFetcher = require('./googlePlaceAPI-fetcher');
    
    const factory = (requestAnalyzer,wikipediaFetcher)=>{
     return (event, context, callback) =>{
         console.log(event);
         //eventから調べるべき文字列を探す
         requestAnalyzer.analyze(event,{
             onDetect:(place,target) => {
                 
                 //調べるべき文字列が見つかった場合
                 console.log(place);
                 //wikipedia APIを叩いて結果を取得する
                 googleplaceapiFetcher.fetch(place,target,{
                    onFetch:(address,lat,lng,title) =>{
                        //結果があった場合
                        console.log(address+lat+lng+title);
                        //callbackの引数は、第１引数がエラーメッセージ、第2引数が戻り値である点注意
                        callback(null,{title:title,latitude:lat,address:address,longitude:lng});
                    },
                    onNotFetch:()=>callback() //結果が無かったので何も返さない
                 });
             }
             ,onNotDetect:()=>callback() //調べるべき文字列が無かったので何も返さない
         });
     };
 };



//将来単体テストを書く場合に備えてfactoryもexportしておく 
exports.factory = factory;
//本体はrequestAnalyzerやwikipediaFetcherを解決した状態でexportする
exports.handler = factory(requestAnalyzer,googleplaceapiFetcher);
