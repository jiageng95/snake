//index.js

//按下时的坐标
var startX = 0;
var startY = 0;

//移动时的坐标
var moveX = 0;
var moveY = 0;

//移动位置与开始位置的差值
var X = 0;
var Y = 0;

//方向
var direction = null; 

//蛇头方向
var snakeDirection = 'rihgt';

//蛇头对象
var snakeHead = {
  x : 150,
  y : 200,
  color : '#ff0000',
  w : 10,
  h : 10 
}

//身体对象(数组)
var snakeBodys = [];

//食物的对象(数组)
var foods = [];

//窗口的宽高
var windowWidth = 0;
var windowHeight = 0;

//用于确定是否删除
var collideBol = true;

//分数
var num = 0;

//速度
var speed = 20;

Page({
  data:{
    scoreNum : 0
  },
  touchStart:function(e){
    startX = e.touches[0].x;
    startY = e.touches[0].y;

  },
  touchMove:function(e){
    moveX = e.touches[0].x;
    moveY = e.touches[0].y;

    X = moveX - startX;
    Y = moveY - startY;
    if(Math.abs(X) > Math.abs(Y) && X > 0){
      direction = 'right';
    } else if (Math.abs(X) > Math.abs(Y) && X < 0){
      direction = 'left';
    } else if (Math.abs(X) < Math.abs(Y) && Y > 0){
      direction = 'bottom';
    } else if (Math.abs(X) < Math.abs(Y) && Y < 0){
      direction = 'top';
    }
  },
  touchEnd:function(e){
    if(snakeDirection == 'left' && direction == 'right'){
      return false;
    } else if (snakeDirection == 'right' && direction == 'left'){
      return false;      
    } else if (snakeDirection == 'top' && direction == 'bottom') {
      return false;
    } else if (snakeDirection == 'bottom' && direction == 'top') {
      return false;
    }
    snakeDirection = direction;
  },
  onReady:function(){
    var self = this;
    //获取画布
    var ctx = wx.createContext();

    //帧数
    var frameNum = 0;

    function draw(obj){
      ctx.setFillStyle(obj.color);
      ctx.beginPath();
      ctx.rect(obj.x, obj.y, obj.w, obj.h);
      ctx.closePath();
      ctx.fill();
    }

    //碰撞函数
    function collide(obj1,obj2){
      var l1 = obj1.x;
      var r1 = l1 + obj1.w;
      var t1 = obj1.y;
      var b1 = t1 + obj1.h;

      var l2 = obj2.x;
      var r2 = l2 + obj2.w;
      var t2 = obj2.y;
      var b2 = t2 + obj2.h;

      if(r1 > l2 && l1 < r2 && b1 > t2 && t1 < b2){
        return true;
      }else{
        return false;
      }
    }

    function animate(){

      frameNum++;
      
      if(frameNum % speed == 0){

        //向蛇身体数组添加一个上一个的位置(身体对象)
        snakeBodys.push({
          x: snakeHead.x,
          y: snakeHead.y,
          w: 10,
          h: 10,
          color: '#000000'
        });

        if (snakeBodys.length > 6) {
          //移除不用的身体位置
          if (collideBol){
            snakeBodys.shift();
          }else{
            collideBol = true;
          }
          
        }
        switch (snakeDirection) {
          case 'left':
            snakeHead.x -= snakeHead.w;
            break;
          case 'right':
            snakeHead.x += snakeHead.w;
            break;
          case 'top':
            snakeHead.y -= snakeHead.h;
            break;
          case 'bottom':
            snakeHead.y += snakeHead.h;
            break;
        }
        
      }
      //绘制蛇头
      draw(snakeHead);
      
      //绘制蛇身
      for(var i = 0 ;i < snakeBodys.length; i++){
        var snakeBody = snakeBodys[i];
        draw(snakeBody);
        if (collide(snakeHead, snakeBody)) {
          // console.log('你输了')
        }
      }

      //绘制食物  
      var foodObj = foods[0];
      
      draw(foodObj);
      if(collide(snakeHead,foodObj)){
        collideBol = false;
        foodObj.reset();
        num++;
        //每五分提高一次速度
        if(num % 5 == 0){
          speed -= 5;
        }
        self.setData({
          scoreNum : num
        })
      }

      //检测是否碰到屏幕
      if(snakeHead.x <= 0 || snakeHead.x >= (windowWidth - snakeHead.w) || snakeHead.y <= 0 || snakeHead.y >= (windowHeight - snakeHead.h)){
        // console.log('你输了'); 
        wx.showModal({

          content: "你输了",

          showCancel: false,

          success:function(res){
              
          }
        });
        snakeHead.x = 1;
        speed = 1.1;
      }
         
      wx.drawCanvas({
        canvasId : 'snakeCanvas',
        actions : ctx.getActions()
      });
      requestAnimationFrame(animate);
    }

    function rand(min,max){
      return parseInt(Math.random() * (max - min)) + min;
    }
    //构造食物对象
    function Food() {
      this.x = rand(0,windowWidth);
      this.y = rand(0,windowHeight);
      this.w = snakeHead.w;
      this.h = snakeHead.h;
      this.color = 'rgb('+rand(0,255)+','+rand(0,255)+','+rand(0,255)+')';
      this.reset = function(){
        this.x = rand(0, windowWidth);
        this.y = rand(0, windowHeight);
        this.color = 'rgb(' + rand(0, 255) + ',' + rand(0, 255) + ',' + rand(0, 255) + ')';
      }
    }

    wx.getSystemInfo({
      success: function(res) {
        windowWidth = res.windowWidth;
        windowHeight = res.windowHeight;
        var foodObj = new Food();
        foods.push(foodObj);
        animate();
        
      },
    })
    
  }
})
