/**
 * Created by 310199253 on 2017/2/15.
 */

var direction = {
    up: 'up', down: 'down', left: 'left', right: 'right'
};

function Rect() {
    this.rawNode = createRect();
    this.direction = direction.up;
    this.ps = null;

    this.setPosition = function (p) {
        this.rawNode.setAttribute('x', p.x);
        this.rawNode.setAttribute('y', p.y);
        this.updatePS();
    };
    this.getPosition = function () {
        return {x: parseInt(this.rawNode.getAttribute('x')), y: parseInt(this.rawNode.getAttribute('y'))};
    };
    this.getPS = function () {
        return {
            x: parseInt(this.rawNode.getAttribute('x')),
            y: parseInt(this.rawNode.getAttribute('y')),
            w: parseInt(this.rawNode.getAttribute('width')),
            h: parseInt(this.rawNode.getAttribute('height'))
        };
    };


    this.updatePS = function () {
        this.ps = this.getPS();
    };

    this.intoWorld = function () {
        gameWorld.appendChild(this.rawNode);
    };

    this.setDirection = function(d){
        this.direction = d;
    };
    this.getDirection = function () {
        return this.direction;
    };

    this.move = function () {
        // use direction to calculate next position
        calculatePositionByDirection(this.ps);
        this.setDirection(this.ps);
    }

}

function calculatePositionByDirection(/* position and size */ps, d) {
    var lambda = {};
    lambda[direction.up] = function (ps) {
        ps.y = ps.y - ps.h;
    };
    lambda[direction.down] = function (ps) {
        ps.y = ps.y + ps.h;
    };
    lambda[direction.left] = function (ps) {
        ps.x = ps.x - ps.w;
    };
    lambda[direction.right] = function (ps) {
        ps.x = ps.x + ps.w;
    };

    lambda[d](ps);
}

function RectLine() {
    this.rectList = [];

    this.turningPoint = [];

    this.headRect = createRect();
    this.headRect.setPosition({x: rect_startPosition_x, y:rect_startPosition_y});
    this.headRect.intoWorld();

    this.tailRect = null;




    this.addRect = function () {
        this.getNextPosition();
        var rect = new Rect();
        this.rectList.push(rect);
        this.updateTailRect();

        // get position

        // into world

    };

    this.updateTailRect = function () {
        this.tailRect = this.rectList[this.rectList.length -1];
        // check turning point
    };

    this.getNextPosition = function () {
        // we need to calculate the positions of three different directions
        var ps = this.tailRect.getPS();
        calculatePositionByDirection(ps, this.tailRect.getDirection());


    };

}

function createRect(){
    var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('fill', 'gray');
    rect.setAttribute('width', rectSize_w);
    rect.setAttribute('height', rectSize_h);
}

///////////////////////////////////
// move direction
var controlObject={
    direction: 'up'
};


// world init settings
var worldSize_w = 500;
var worldSize_h = 500;

var gameWorld = document.getElementById('game-world');
gameWorld.setAttribute('width', worldSize_w);
gameWorld.setAttribute('height',worldSize_h);


// rect init settings
var rectSize_w = 10;
var rectSize_h = 10;
var rect_step = 5;
var rect_startPosition_x = (worldSize_w - rectSize_w)/2;
var rect_startPosition_y = (worldSize_h - rectSize_h)/2;

var rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
rect.setAttribute('fill', 'gray');
rect.setAttribute('width', rectSize_w);
rect.setAttribute('height', rectSize_h);


function resetRectPosition(rect){
    rect.setAttribute('x', rect_startPosition_x);
    rect.setAttribute('y', rect_startPosition_y);
}


gameWorld.appendChild(rect);

// other settings
var rectDirection = 'right';
var rectSpeedInterval = 100;



function resetRect(position) {
    rect.setAttribute('x', position.x);
    rect.setAttribute('y', position.y);
};

function getCurrentPosotion() {
    return {x: rect.getAttribute('x'), y: rect.getAttribute('y')};
}

function updatePosition() {
    var offset = {};
    if(rectDirection === 'up'){
        offset.y = -rect_step;
    }else if(rectDirection === 'down'){
        offset.y = rect_step;
    }else if(rectDirection === 'left'){
        offset.x = -rect_step;
    }else if(rectDirection === 'right'){
        offset.x = rect_step;
    }


    // get current position
    var position = getCurrentPosotion();
    if(offset.x){
        position.x = parseInt(position.x) + offset.x;
        position.x = forceInRange(position.x, 0, worldSize_w-rectSize_w);
    }

    if(offset.y){
        position.y = parseInt(position.y) + offset.y;
        position.y = forceInRange(position.y, 0, worldSize_h -rectSize_h);
    }

    // reset position
    resetRect(position);
}

function updatePositionAndCheckDead() {
    try{
        updatePosition();
    }catch(e){
        stopGame();
        dead();
        console.log(e);

    }
}

function forceInRange(value, min, max) {
    var v = Math.max(value, min);
    v = Math.min(v, max);

    // check dead
    if(v !== value){
        throw 'dead';
    }
    return v;
}

var deadCover,deadText ;

function dead() {
    if(!deadCover){
        deadCover =  document.createElementNS('http://www.w3.org/2000/svg', 'rect');
        deadCover.setAttribute('fill', 'red');
        deadCover.setAttribute('width', worldSize_w);
        deadCover.setAttribute('height', worldSize_h);
        deadCover.setAttribute('x', 0);
        deadCover.setAttribute('y', 0);
        gameWorld.appendChild(deadCover);
    }else{
        gameWorld.appendChild(deadCover);
    }

    if(!deadText){
        deadText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        deadText.setAttribute('font-family', 'Verdana');
        deadText.setAttribute('font-size', 35);
        deadText.setAttribute('x', 90);
        deadText.setAttribute('y', 180);
        deadText.appendChild(document.createTextNode('YOU LOSE'));
        gameWorld.appendChild(deadText);
    }else{
        gameWorld.appendChild(deadText);
    }
}

function replayGame() {
    if(deadCover && deadCover.parentElement === gameWorld){
        gameWorld.removeChild(deadCover);
    }
    if(deadText && deadText.parentElement === gameWorld){
        gameWorld.removeChild(deadText);
    }

    setButtonStatus('ended');
}

document.onkeydown = checkKey;

/**
 * detect user arrow key and change direction
 * @param e
 */
function checkKey(e) {

    e = e || window.event;

    if (e.keyCode == '38') {
        // up arrow
        console.log('up arrow');
        rectDirection = 'up';
        //updatePosition({y: -rect_step});
    }
    else if (e.keyCode == '40') {
        // down arrow
        console.log('down arrow');
        rectDirection = 'down';
//            updatePosition({y: rect_step});
    }
    else if (e.keyCode == '37') {
        // left arrow
        console.log('left arrow');
        rectDirection = 'left';
//            updatePosition({x: -rect_step});
    }
    else if (e.keyCode == '39') {
        // right arrow
        console.log('right arrow');
        rectDirection = 'right';
//            updatePosition({x: rect_step});
    }

}



var gameInterval = null;
var startButton = document.getElementById('startButton');
var stopButton = document.getElementById('stopButton');

function setButtonStatus(s) {
    if(s === 'running'){
        startButton.setAttribute('disabled', 'disabled');
        stopButton.removeAttribute('disabled');
    }else if(s === 'ended'){
        startButton.removeAttribute('disabled');
        stopButton.setAttribute('disabled', 'disabled');
    }
}


function startGame() {
    gameInterval = setInterval(updatePositionAndCheckDead, rectSpeedInterval);
    setButtonStatus('running');
}

function stopGame() {
    clearInterval(gameInterval);
    setButtonStatus('ended');
}
