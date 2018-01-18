
/**
 * eventから調べるべき文字列を探す関数
 * @param {object} event lambdaから渡されたeventオブジェクト
 * @param {object} callbacks この関数に引き渡すcallback関数群
 * @return undefined
 * */
const analyze = (event,callbacks) =>{
    /**
     * デフォルトのcallback関数群
     * onDetect:(detectedWord)=>undefined 文字列が見つかった場合のcallback
     * onNotDetect:()=>undefined 文字列が見つからなかった場合のcallback
     * */
    const defaultCallbacks = {
      onDetect:(detectedWord) => console.log("Callback:onDetect is not specified."),
      onNotDetect:() => console.log("Callback:onNotDetect is not specified.")
    };
    
    const mergedCallbacks = Object.assign({},defaultCallbacks,callbacks);
    
    const detectedWord = findDetectedWord(event);
    console.log(detectedWord);
    let place = "";
    let target = "";
    if (detectedWord.indexOf("の")){
        place = detectedWord.substr(0,detectedWord.indexOf("の"))
        target = detectedWord.substr(detectedWord.indexOf("の")+1,detectedWord.length)
    }
    if(detectedWord){
        //文字列が見つかったので、onDetect関数に見つかった文字列を渡してコールバックする
        mergedCallbacks.onDetect(place,target);
        
        
    }else{
        //文字列が見つからなかったので、onNotDetect関数にコールバックする
        mergedCallbacks.onNotDetect();
    }
};

/**
 * eventから調べる文字を探し出すローカル関数
 * @param {object} event lamndaから渡されたeventオブジェクト
 * @return {string} 見つかった文字列。存在しなければnull
 * */
const findDetectedWord = (event)=>{
    if(!event.analysedMessage){
        //analyzedMessageが無いということはmessageがtextでは無い
        return;
    }
    
    if(event.analysedMessage.sentences.length == 0){
        //sentenceが無い
        return;
    }
    
    //形態素解析結果のsentence(文)の配列から、見つかった文字列の配列に変換する
    //@see https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Array/map
    const detectedWords = event.analysedMessage.sentences.map((sentence)=>{
        const content = sentence.text.content;
        const indexOfKeyword = content.indexOf("ってどこ");
        if(indexOfKeyword <= 0){
            //文中に"の意味"が見つからないのでnull
            return null;
        }else{
            //見つかった場合は、その前までの文字列を返す
            return content.substr(0,indexOfKeyword);
        }
    }).filter(val => val !== null);//null(見つからなかった文章)を除外する
    
    if(detectedWords.length === 0){
        //検索すべき言葉が見つからない
        return;
    }else{
        //検索候補が1つ以上ある
        //複数候補があった場合は最初の候補を返す
        return detectedWords[0];
    }
};

//analyze関数をexport。
//findDetectedWord関数はローカル関数扱いなのでexportしない。(将来的に単体テストしたくなったらexportする)
exports.analyze = analyze;