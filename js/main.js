(function () {
    
    //矢印キーのコード 
    var LEFT_KEY_CODE = 37; 
    var RIGHT_KEY_CODE = 39; 
    var key_value = 0; 

    var canvas = null; 
    var ctx = null; 
    var img_snow = null; 
    var img_snow_man = null; 
    var requestId;
    
    //雪だるまの Sprite のインスタンスを格納する変数  
    var snow_sprite_man = null; 
    //雪の結晶の Sprite のインスタンスを格納する配列  
    var snow_sprites = []; 
    //表示する雪の結晶の数 
    const SNOWS_COUNT = 6; 
    //隣り合う 雪の結晶画像の x 位置の差分 
    const NEIGHBOR_DISTANCE = 58;

    const SNOW_START_COEFFICIENT = -50;
    
    //スプライト画像のインデックス
    const SNOW_BLUE = 0; 
    const SNOW_WHITE = 1; 
    const SNOW_CLASH = 2;

    //雪の結晶の画像サイズ 
    const SNOW_PIC_HEIGHT = 32; 
    const SNOW_PIC_WIDTH = 32; 
    //雪ダルマの画像サイズ 
    const SNOW_MAN_PIC_HEIGHT = 80; 
    const SNOW_MAN_PIC_WIDTH = 80;
    
    
    //画面の書き換え数をカウントする 
    var loopCounter = 0; 
    //雪の結晶画像を切り替える閾値  
    const SWITCH_PICTURE_COUNT = 24;
    

    //Sprite クラスの定義 
    var Sprite = function(img, width, height){ 
        this.image = img; //image オブジェクト 
        this.height = height; //mg.height; 
        this.width = width; //img.width; 
        this.x = 0;   //表示位置 x 
        this.y = 0;  //表示位置 y 
        this.dx = 0; //移動量 x 
        this.dy = 0; //移動量 y 
        this.audio = null; //Audio オブジェクト 
       this.audioPlayed = false; //音が複数回鳴るのを防ぐ 

        var _offset_x_pos = 0; 
        var that = this; 
        //使用するインデックスを設定するための Setter/Getter 
        var _imageIndex = 0; 
        
        Object.defineProperty(this, "imageIndex", { 
            get: function () { 
                return _imageIndex; 
            }, 
            set: function (val) { 
                _imageIndex = val; 
                _offset_x_pos = width * _imageIndex; 
            } 
        }); 
        //Sprite を描画するメソッド 
        this.draw = function () { 
            ctx.drawImage(img, _offset_x_pos, 0, width, height, that.x, that.y, width, height); 
        }; 
    }

   //DOM のロードが完了したら実行   
   document.addEventListener("DOMContentLoaded", function () { 
        loadAssets(); 
        setHandlers();
    });
    
 
    function loadAssets() { 
        //HTML ファイル上の canvas エレメントのインスタンスを取得   
        canvas = document.getElementById('bg'); 
          //アニメーションの開始 
        canvas.addEventListener("click", loadCheck);
        //2D コンテキストを取得  
        ctx = canvas.getContext('2d');
        //image オブジェクトのインスタンスを生成  
        img_snow = new Image();
        //image オブジェクトに画像をロード 
        img_snow.src = './img/sp_snow.png';
        /*画像読み込み完了のイベントハンドラーに Canvas に 
        画像を表示するメソッドを記述 */
        img_snow.onload = function () { 
            for (var i = 0; i < SNOWS_COUNT; i++) { 
            //画像を引数に Sprite クラスのインスタンスを生成  
            var snow_sprite = new Sprite(img_snow, SNOW_PIC_WIDTH, SNOW_PIC_HEIGHT);
            snow_sprite.dy = 1; 
            snow_sprite.dx = NEIGHBOR_DISTANCE; 
            snow_sprite.x = i * snow_sprite.dx; 
            snow_sprite.y = getRandomPosition(SNOWS_COUNT, SNOW_START_COEFFICIENT); 
             //Audio オブジェクトのインスタンスをセット 
            snow_sprite.audio = new Audio('./audio/kiiiin1.mp3'); 

            snow_sprites.push(snow_sprite); 
            snow_sprite = null; 
         } 
        }; 
        
        //雪だるま画像のロード 
        img_snow_man = new Image(); 
        img_snow_man.src = './img/snow_man.png'; 
        img_snow_man.onload = function () { 
            //画像を引数に Sprite クラスのインスタンスを生成  
            snow_sprite_man = new Sprite(img_snow_man, SNOW_MAN_PIC_WIDTH, 
                                                 SNOW_MAN_PIC_HEIGHT);  
            snow_sprite_man.x = getCenterPostion(canvas.clientWidth, 
　　　　　　　　　　　　　　　　　　          img_snow_man.width); 
            snow_sprite_man.y = canvas.clientHeight - img_snow_man.height; 
            snow_sprite_man.limit_rightPosition =                             
                             getRightLimitPosition(
                             canvas.clientWidth, img_snow_man.width);  
        };

    };
    
    //中央の Left 位置を求める関数 
    function getCenterPostion(containerWidth, itemWidth) { 
        return (containerWidth / 2) - (itemWidth / 2); 
    };

function renderFrame() { 
    //canvas をクリア 
    ctx.clearRect(0, 0, canvas.width, canvas.height); 
    //snow_sprite_man の x 値が動作範囲内かどうか 
    if ((snow_sprite_man.x < snow_sprite_man.limit_rightPosition && key_value > 0) 
     || (snow_sprite_man.x >= 3 && key_value < 0)) { 
        //img_snow_man の x 値を増分 
        snow_sprite_man.x += key_value; 
    } 

    var length = snow_sprites.length; 
    for (var i = 0; i < length; i++) { 
        var snow_sprite = snow_sprites[i]; 
        //snow_sprite の y 値(縦位置) が canvas からはみ出たら先頭に戻す 
        if (snow_sprite.y > canvas.clientHeight) { 
            snow_sprite.y = getRandomPosition(SNOWS_COUNT, SNOW_START_COEFFICIENT);
             snow_sprite.imageIndex = SNOW_BLUE; 
              //オーディオ再生を停止 
                snow_sprite.audio.pause(); 
                //オーディオ再生済フラグのリセット 
                snow_sprite.audioPlayed = false; 

        }else {  
            if (loopCounter == SWITCH_PICTURE_COUNT  
                                      && snow_sprite.imageIndex != SNOW_CLASH) { 
                snow_sprite.imageIndex = (snow_sprite.imageIndex == SNOW_BLUE)  
                                                       ? SNOW_WHITE : SNOW_BLUE; 
            } 
        }; 
        //snow_sprite の y 値を増分 
        snow_sprite.y += snow_sprite.dy; 
        //画像を描画 
        snow_sprite.draw();
      
        //当たり判定 
        if(isHit(snow_sprite, snow_sprite_man)){hitJob(snow_sprite)};
        snow_sprite = null; 
    } 
    //画像を描画 
    
    snow_sprite_man.draw();
    
    //処理数のカウント 
    if (loopCounter == SWITCH_PICTURE_COUNT) { loopCounter = 0; } 
    loopCounter++;
    
    //ループを開始 
   requestId = window.requestAnimationFrame(renderFrame);
}


//雪だるまを動かせる右の限界位置を算出する 
function getRightLimitPosition(containerWidth, itemWidth) { 
        return containerWidth - itemWidth; 
}

function setHandlers(){
     //キーイベントの取得 (キーダウン) 
    document.addEventListener("keydown", function (evnt) { 
        if (evnt.which == LEFT_KEY_CODE) { 
            key_value = -3; 
        } else if (evnt.which == RIGHT_KEY_CODE) {  
            key_value = 3; 
        } 
    });  
    //雪だるまが進みっぱなしにならないように、 キーが上がったら 0 に 
    document.addEventListener("keyup", function () { 
       key_value = 0; 
    });
    
    //Canvas へのタッチイベント設定 
    canvas.addEventListener("touchstart", function (evnt) { 
       if ((canvas.clientWidth / 2) > evnt.touches[0].clientX) { 
            key_value = -3; 
       } else { 
            key_value = 3; 
       } 
    });  

    //雪だるまが進みっぱなしにならないように、 タッチが完了したら 0 に  
    canvas.addEventListener("touchend", function (evnt) { 
       key_value = 0; 
    }); 
};


//あたり判定処理
function isHit(targetA,targetB){
    return (((targetA.x <= targetB.x && targetA.x + targetA.width > targetB.x) 
            ||(targetB.x <= targetA.x && targetB.x + targetB.width  > targetA.x)) 
        &&((targetA.y <= targetB.y && targetA.y + targetA.height  >=  targetB.y) 
            ||(targetB.y <= targetA.y && targetB.y + targetB.height  >=  targetA.y)));
 }
 
//あたり判定の際の処理
function hitJob(snow_sprite) {
    ctx.font = 'bold 20px "メイリオ", sans-serif;'; 
    ctx.fillStyle = 'red'; 
    ctx.fillText('ヒットしました', getCenterPostion(canvas.clientWidth, 140), 160); 
    snow_sprite.imageIndex = SNOW_CLASH; 
     if (!snow_sprite.audioPlayed) { 
                snow_sprite.audio.play(); 
                snow_sprite.audioPlayed = true; 
     } 
}

//雪の結晶の縦位置の初期値をランダムに設定する 
function getRandomPosition(colCount, delayPos) { 
        return Math.floor(Math.random() * colCount) * delayPos; 
};

//ゲームで使用する Splite オブジェクトが準備されたかどうかを判断 
function loadCheck() { 
    if (snow_sprites.length && snow_sprite_man) { 
            //準備ができたらアニメーションを開始 
            window.requestAnimationFrame(renderFrame); 
    } else { 
            //まだの場合はループして待機 
            window.requestAnimationFrame(loadCheck); 
    } 
}



})();