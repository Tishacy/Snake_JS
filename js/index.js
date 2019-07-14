var sw = 20,
    sh = 20,
    tr = 30,
    td = 30;

var snake = null,
    food = null;

function Square(x, y, classname) {
    this.x = x*sw;
    this.y = y*sh;
    this.class = classname;
    
    this.viewContent = document.createElement('div');
    this.viewContent.className = this.class;
    this.parent = document.getElementById('snakeWrap');
}

Square.prototype.create = function () {
    this.viewContent.style.position = "absolute";
    this.viewContent.style.width = sw + "px";
    this.viewContent.style.height = sh + "px";
    this.viewContent.style.left = this.x + "px";
    this.viewContent.style.top = this.y + "px";

    this.parent.appendChild(this.viewContent);
};
Square.prototype.remove = function () {
    this.parent.removeChild(this.viewContent);
};

// snake
function Snake() {
    this.head = null;
    this.tail = null;
    this.pos = [];
    this.directionNum = {
        left :  {x:-1, y:0, rotate: 180},
        right:  {x:1, y:0, rotate: 0},
        up   :  {x:0, y:-1, rotate: -90},
        down :  {x:0, y:1, rotate: 90},
    };
    this.last = null;
    this.next = null;
}
Snake.prototype.init = function () {
    // snake head
    var snakeHead = new Square(2, 0, 'snakeHead');
    snakeHead.create();
    this.head = snakeHead;
    this.pos.push([2, 0]);

    // snake body
    var snakeBody1 = new Square(1, 0, 'snakeBody');
    snakeBody1.create();
    this.pos.push([1, 0]);

    // snake tail
    var snakeBody2 = new Square(0, 0, 'snakeBody');
    snakeBody2.create();
    this.pos.push([0, 0]);
    this.tail = snakeBody2;

    // generate linked-list
    snakeHead.last = null;
    snakeHead.next = snakeBody1;
    snakeBody1.last = snakeHead;
    snakeBody1.next = snakeBody2;
    snakeBody2.last = snakeBody1;
    snakeBody2.next = null;

    this.direction = this.directionNum.right;
};

Snake.prototype.getNextPos = function () {
    var nextPos = [
        this.head.x / sw + this.direction.x,
        this.head.y / sh + this.direction.y,
    ];
    this.nextPos = nextPos;

    var selfCollid = false;
    this.pos.forEach(function (posItem) {
        if (posItem[0] == nextPos[0] && posItem[1] == nextPos[1]) {
            console.log(posItem, nextPos);
            selfCollid = true;
        }
    })
    if (selfCollid) {
        console.log('撞倒了自己');
        this.strategies.die.call(this);
        return 400;
    }

    if (nextPos[0] < 0 || nextPos[1] < 0 || nextPos[0] > 29 || nextPos[1] > 29) {
        console.log("撞墙了");
        this.strategies.die.call(this);
        return 401;
    }

    // if (/* 遇到了食物 */) {};
    if (this.nextPos[0]==food.x/sw && this.nextPos[1]==food.y/sh) {
        this.strategies.eat.call(this);
        console.log("吃到啦！加1分！")
        return 200;
    }

    // 其他情况 正常走
    this.strategies.move.call(this);
    return 200;
};

Snake.prototype.strategies = {
     move: function (isEat=false) {
         var newBody = new Square(this.head.x/sw, this.head.y/sh, 'snakeBody');
         newBody.next = this.head.next;
         newBody.last = null;
         newBody.next.last = newBody;

         this.head.remove();
         newBody.create();
         
         var newHead = new Square(this.nextPos[0], this.nextPos[1], "snakeHead"); 
         newHead.create();
         newHead.viewContent.style.transform = 'rotate(' + this.direction.rotate + 'deg)';
         newHead.last = null;
         newHead.next = newBody; 
         this.head = newHead;
         this.pos.splice(0, 0, this.nextPos);
         
         if (!isEat) {
            this.tail = this.tail.last;
            this.tail.next.remove();
            this.pos.pop();
        }
     },
     eat: function () {
         this.strategies.move.call(this, isEat=true);
         food.remove();
         createFood();
         game.score ++;
         scoreBoard.firstElementChild.innerText = game.score;
     },
     die: function () {
         game.over();   
     }
}

function createFood() {
    var x, y;
    var include = true;
    while (include) {
        x = Math.round(Math.random() * (td-1));
        y = Math.round(Math.random() * (tr-1));
        snake.pos.forEach(function (posItem) {
            if (x != posItem[0] || y != posItem[1]) {
                include = false;
            }
        })
    }    
    food = new  Square(x, y, 'food');
    food.create();
}

function Game() {
    this.timer = null;
    this.score = 0;
}
Game.prototype.init = function () {
    snake = new Snake();
    snake.init();
    createFood();

    document.onkeydown = function(key) {
        if (key.which == 37 && snake.direction != snake.directionNum.right) {
            snake.direction = snake.directionNum.left;
        }else if (key.which == 38 && snake.direction != snake.directionNum.down) {
            snake.direction = snake.directionNum.up;
        }else if (key.which == 39 && snake.direction != snake.directionNum.left) {
            snake.direction = snake.directionNum.right;
        }else if (key.which == 40 && snake.direction != snake.directionNum.up) {
            snake.direction = snake.directionNum.down;
        }
    }
}
Game.prototype.start = function () {
    this.timer = setInterval(function (){
        snake.getNextPos();
    }, 200)
}
Game.prototype.over = function () {
    clearInterval(this.timer);
    alert("啊你死啦！分数：" + game.score + '!');

    snakeWrap.innerHTML = "";
    snake = new Snake();
    game = new Game();
    startBtn.style.display = "block";
    scoreBoard.style.display = "none";
}
Game.prototype.pause = function () {
    console.log('暂停');
    clearInterval(this.timer);
    var pauseBtn = document.getElementsByClassName('pauseBtn')[0];
    pauseBtn.style.display = "block";
}

var startBtn = document.getElementsByClassName('startBtn')[0];
var scoreBoard = document.getElementsByClassName('score')[0];
startBtn.firstChild.onclick = function () {
    startBtn.style.display = 'none';
    scoreBoard.firstElementChild.innerText = '0';
    scoreBoard.style.display = "block";
    game = new Game()
    game.init();
    game.start();
}

var snakeWrap = document.getElementById('snakeWrap');
snakeWrap.onclick = function () {
    game.pause();
}

var pauseBtn = document.getElementsByClassName('pauseBtn')[0];
pauseBtn.firstChild.onclick = function () {
    pauseBtn.style.display = "none";
    game.start();
}







