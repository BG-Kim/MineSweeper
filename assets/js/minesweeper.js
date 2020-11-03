/**************************************************************************************************
    minesweeper.js    
    Mine Sweeper

    Create 		BGKim 		2020.10
**************************************************************************************************/



///////////////////////////////////////////////////////////////////////////////////////////////////
// 									Constants													 //
///////////////////////////////////////////////////////////////////////////////////////////////////
const SPACE_LENGTH = 24;
const INFO_PANEL_HEIGHT = 44;


///////////////////////////////////////////////////////////////////////////////////////////////////
// 									GLOBAL VARIABLE 											 //
///////////////////////////////////////////////////////////////////////////////////////////////////
let FIELD_ROW_COUNT = 20;
let FIELD_COLUMN_COUNT = 20;
let MINE_COUNT = 20;

const gameBoard = document.getElementById("gameBoard");
const mineField = document.getElementById("mineField");
const _imgReset =  document.getElementById("btnReset");
let mineSweeperGame =  null;
let _timeSecond = 0;
let _isStartGame = false;
let _isGameOver = false;
let _pressTimer = null;

///////////////////////////////////////////////////////////////////////////////////////////////////
// 									TYPES 														 //
///////////////////////////////////////////////////////////////////////////////////////////////////
const MineBlockClassName  = {
	closed : "block-closed",
	open0 : "open-0",
	open1 : "open-1",
	open2 : "open-2",
	open3 : "open-3",
	open4 : "open-4",
	open5 : "open-5",
	open6 : "open-6",
	open7 : "open-7",
	open8 : "open-8",
	open9 : "open-9",
	mine : "mine",
	mineRed : "mine-red",
	flag : "flag"
};

const SpaceState = {
	closed : "closed",
	flag : "flag",
	open : "open"
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// 									SPACE Class 												 //
///////////////////////////////////////////////////////////////////////////////////////////////////
class Space {
	_hasMine = false;
	_nearMineCount = 0;	
	_state = SpaceState.closed;
	
	layMine() {
		this._hasMine = true;
	}
	hasMine() {
		return this._hasMine;
	}
	getNearMineCount() {
		return this._nearMineCount;
	}
	setNearMineCount(count) {
		this._nearMineCount = count;
	}
	setFlag(flag) {
		if(flag === true )
			this._state = SpaceState.flag;
		else 
			this._state = SpaceState.closed;
	}
	isSetFlag() {
		return this._state === SpaceState.flag;
	}
	open() {
		this._state = SpaceState.open;
	}
	isOpen() {
		return this._state === SpaceState.open;
	}
}


///////////////////////////////////////////////////////////////////////////////////////////////////
// 							Mine Sweeper Class   												 //
///////////////////////////////////////////////////////////////////////////////////////////////////
class MineSweeper {
	field = [];
	remainMineCount = -1;

	newGame(rowCount, columnCount, mineCount) {
		console.log("new game!!!");
		this.field = [];
		const field = this.field;

		// Generate Mine
		const minePositions = [];
		const maxCandidateIndex = rowCount * columnCount;
		let position = -1;
		while( minePositions.length < mineCount ) {
			position = Math.floor( Math.random() * maxCandidateIndex );
			if( minePositions.indexOf(position) < 0  )
				minePositions.push(position);		
		}
		minePositions.sort( (a,b)=> a-b );


		// lay mines 
		let idxMinePosition = 0;
		let mineSpace = null;
		let fieldRow = null;
		let elementCount = 0;		
		for( let row = 0;	row < rowCount;	++row )  {
			fieldRow = [];
			for( let column = 0;	column < columnCount;	++column ) {
				mineSpace = new Space();				
				if( minePositions[idxMinePosition]  ==  elementCount)  {
					mineSpace.layMine();
					++idxMinePosition;
				}				
				fieldRow.push(mineSpace);
				++elementCount;
			}
			field.push(fieldRow);
		}


		// count near mine
		let space = null;		
		let nearMineCount = -1;
		for( let row = 0;	row < rowCount;	++row )  {
			fieldRow = this.field[row];
			for( let column = 0;	column < columnCount;	++column ) {				
				nearMineCount = 0;
				// top left, top, top right 
				if( 0 < row ) {
					if( 0 < column ) {
						if( ((field[row-1])[column-1]).hasMine() === true ) 
							++nearMineCount;
					}

					if( ((field[row-1])[column]).hasMine() === true ) 
						++nearMineCount;

					if( column < fieldRow.length - 1 ) {
						if( ((field[row-1])[column+1]).hasMine() === true ) 
							++nearMineCount;
					}
				}

				// left, right 
				if( 0 < column ) {
					if( ((field[row])[column-1]).hasMine() === true ) 
						++nearMineCount;
				}

				if( column < fieldRow.length - 1 ) {
					if( ((field[row])[column+1]).hasMine() === true ) 
						++nearMineCount;
				}

				// bottom left, bottom, bottom right
				if( row < rowCount - 1 ) {
					if( 0 < column ) {
						if( ((field[row+1])[column-1]).hasMine() === true ) 
							++nearMineCount;
					}

					if( ((field[row+1])[column]).hasMine() === true ) 
						++nearMineCount;

					if( column < fieldRow.length - 1) {
						if( ((field[row+1])[column+1]).hasMine() === true ) 
							++nearMineCount;
					}
				}				
				fieldRow[column].setNearMineCount(nearMineCount);
			}
		}		

		this.remainMineCount = mineCount;
		updateMineCount();
		// this.debug_displayField();
	}

	increseMineCount() {
		++this.remainMineCount;
	}

	decreseMineCount() {
		--this.remainMineCount;		
	}

	getMineCount() {
		return this.remainMineCount;
	}

	getSpace(row, column) {
		return (this.field[row])[column];
	}

	isWinGame() {
		const _this = this;
		function isAllSpaceOpen() {
			let rowField = null
			let space = null;
			console.info("this.field", _this);
			for( let i = 0 ;	i < _this.field.length;	++i) {
				rowField = _this.field[i];
				for( let j = 0;		j < rowField.length;	++j ) {
					space = rowField[j];
					if( space.isSetFlag() === false && space.isOpen() === false )
						return false;					
				}
			}
			return true;
		}

		function getCloseSpaceCount() {
			let closeCount = 0;
			let rowField = null
			let space = null;
			for( let i = 0 ;	i < _this.field.length;	++i) {
				rowField = _this.field[i];
				for( let j = 0;		j < rowField.length;	++j ) {
					space = rowField[j];
					if( space.isSetFlag() === false && space.isOpen() === false )
						++closeCount;
				}
			}
			return closeCount;
		}


		return ( 
			this.remainMineCount === 0 && isAllSpaceOpen() || 		
			this.remainMineCount === getCloseSpaceCount()
		);
	}


	debug_displayField() {
		let rowField = null;
		let rowDisplayString = "";
		for( let row = 0; 	row < this.field.length;		++row ) {
			rowField = this.field[row];
			rowDisplayString = "";
			for( let column = 0;		column < rowField.length;	++column ) {				
				if( rowField[column].hasMine() === true ) 
					rowDisplayString += "💣"
				else 
					rowDisplayString += `${rowField[column].getNearMineCount()} `;
			}
			console.log(rowDisplayString);			
		}
	}
}





///////////////////////////////////////////////////////////////////////////////////////////////////
// 									Events 		   												 //
///////////////////////////////////////////////////////////////////////////////////////////////////
// prevant right menu
window.oncontextmenu = function (){
    return false;     // cancel default menu
}


function _getPositionById(elementId) {
	const arrId = elementId.split("_");
	const row = parseInt(arrId[0]);
	const column = parseInt(arrId[1]);
	return {row, column};
}

_imgReset.addEventListener("click", ()=>{
	createBoard();
});


// Space Right Click
function onFieldRightClick(e) {	

	if( _isGameOver === true )
		return ;

	if( _isStartGame === false ) {
		_isStartGame = true;
		updateTimer();
	}


	const element = e.target;
	const position = _getPositionById(element.id);
	
	const space = mineSweeperGame.getSpace(position.row, position.column);	
	if( space.isOpen() === true )
		return ;

	space.setFlag( !space.isSetFlag() );
	const isSetFlag = space.isSetFlag();	
	if( isSetFlag === true ) {
		element.classList.remove(MineBlockClassName.closed);
		element.classList.add(MineBlockClassName.flag);
		mineSweeperGame.decreseMineCount();
		updateMineCount();
	} else {
		element.classList.remove(MineBlockClassName.flag);
		element.classList.add(MineBlockClassName.closed);
		mineSweeperGame.increseMineCount();
		updateMineCount();
	}	

	checkWinGame();
}



// Space Left Click
function onFieldClick(e) {
	function _tryOpenNearSpace(row, column) {
		function __tryOpen(__row, __column) {
			const space = mineSweeperGame.getSpace(__row, __column);
			if( space.isOpen() === false && space.isSetFlag() === false ) {				
				_openSpace(__row, __column);
			}
		}
		
		// near flag check and if flag equal mine count then open other space otherwise blink space
		const candidateElement = [];
		let flagCount = 0;		

		// top left, top, top right 
		if( 0 < row ) {
			if( 0 < column )
				__tryOpen(row-1, column-1);			
				
			__tryOpen(row-1, column);			
			
			if( column < FIELD_COLUMN_COUNT - 1 )
				__tryOpen(row-1, column+1);			
		}

		// left, right 
		if( 0 < column )
			__tryOpen(row, column-1);					

		if( column < FIELD_COLUMN_COUNT - 1 )  
			__tryOpen(row, column+1);		

		// bottom left, bottom, bottom right
		if( row < FIELD_ROW_COUNT - 1 ) {
			if( 0 < column ) 
				__tryOpen(row+1, column-1);							
				
			__tryOpen(row+1, column);
			
			if( column < FIELD_COLUMN_COUNT - 1)  
				__tryOpen(row+1, column+1);
		}
	}


	function _tryOpenNearSpaceOrBlink(row, column, mineCount) {		
		function __addCandidateAndCheckFlag(candidateElement, __row, __column) {
			const space = mineSweeperGame.getSpace(__row, __column);
			const isSetFlag = space.isSetFlag();
			if( space.isOpen() === false && isSetFlag === false )
				candidateElement.push(document.getElementById(`${__row}_${__column}`));
			return isSetFlag;
		}
		
		// near flag check and if flag equal mine count then open other space otherwise blink space
		const candidateElement = [];
		let flagCount = 0;
		
		// top left, top, top right 
		if( 0 < row ) {
			if( 0 < column ) {
				if( __addCandidateAndCheckFlag(candidateElement, row-1, column-1) === true ) 
					++flagCount;				
			}
				
			if( __addCandidateAndCheckFlag(candidateElement, row-1, column) === true ) 
				++flagCount;
			
			if( column < FIELD_COLUMN_COUNT - 1 )  {				
				if( __addCandidateAndCheckFlag(candidateElement, row-1, column+1) === true ) 
					++flagCount;
			}
		}

		// left, right 
		if( 0 < column )  {
			if( __addCandidateAndCheckFlag(candidateElement, row, column-1) === true ) 
				++flagCount;			
		}

		if( column < FIELD_COLUMN_COUNT - 1 )  {
			if( __addCandidateAndCheckFlag(candidateElement, row, column+1) === true ) 
				++flagCount;			
		}

		// bottom left, bottom, bottom right
		if( row < FIELD_ROW_COUNT - 1 ) {
			if( 0 < column ) { 
				if( __addCandidateAndCheckFlag(candidateElement, row+1, column-1) === true ) 
					++flagCount;				
			}
				
			if( __addCandidateAndCheckFlag(candidateElement, row+1, column) === true ) 
				++flagCount;

			if( column < FIELD_COLUMN_COUNT - 1)  {
				if( __addCandidateAndCheckFlag(candidateElement, row+1, column+1) === true ) 
					++flagCount;							
			}
		}


		if( mineCount === flagCount )  {
			for(let i = 0;		i < candidateElement.length;	++i )
				candidateElement[i].click();
		} else {
			for(let i = 0;		i < candidateElement.length;	++i ) {
				candidateElement[i].classList.remove(MineBlockClassName.closed);
				candidateElement[i].classList.add(MineBlockClassName.open0);
			}
			setTimeout(()=>{
				for(let i = 0;		i < candidateElement.length;	++i ) {
					candidateElement[i].classList.remove(MineBlockClassName.open0);
					candidateElement[i].classList.add(MineBlockClassName.closed);
				}
			}, 200)
		}

	}

	function _openSpace(row, column) {
		const element = document.getElementById(`${row}_${column}`);
		const space = mineSweeperGame.getSpace(row,column);
		element.classList.remove(MineBlockClassName.closed);
						
		space.open();
		if(  space.hasMine() === true ) {
			element.classList.add(MineBlockClassName.mineRed);
			terminateGame();
		} else {
			const mineCount = space.getNearMineCount();
			if( mineCount === 0 ) {
				element.classList.add(MineBlockClassName.open0);				
				_tryOpenNearSpace(row, column);
			} else {
				switch(mineCount) {
					case 1 : 	element.classList.add(MineBlockClassName.open1);	break;
					case 2 : 	element.classList.add(MineBlockClassName.open2);	break;
					case 3 : 	element.classList.add(MineBlockClassName.open3);	break;
					case 4 : 	element.classList.add(MineBlockClassName.open4);	break;
					case 5 : 	element.classList.add(MineBlockClassName.open5);	break;
					case 6 : 	element.classList.add(MineBlockClassName.open6);	break;
					case 7 : 	element.classList.add(MineBlockClassName.open7);	break;
					case 8 : 	element.classList.add(MineBlockClassName.open8);	break;
					default : break;
				}
			}
		}		
		
	}


	if( _isGameOver === true )
		return ;

	if( _isStartGame === false ) {
		_isStartGame = true;
		updateTimer();
	}


	const element = e.target;	
	const position = _getPositionById(element.id);
	const row = position.row;
	const column = position.column;
	const space = mineSweeperGame.getSpace(row,column);

	if( space.isSetFlag() === true ) 
		return ;

	if( space.isOpen() === false ) {		
		_openSpace(row, column);		
	} else {
		_tryOpenNearSpaceOrBlink(row, column, space.getNearMineCount());
	}

	checkWinGame();
}



///////////////////////////////////////////////////////////////////////////////////////////////////
// 									Functions 											 		 //
///////////////////////////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////////////////////////
// Mine Counter & Timer
function updateNumber(el, numString) {		
	switch(numString) {
		case '0':	el.classList = "num-image num0";	break;
		case '1':	el.classList = "num-image num1"; 	break;
		case '2':	el.classList = "num-image num2";	break;
		case '3':	el.classList = "num-image num3";	break;
		case '4':	el.classList = "num-image num4";	break;
		case '5':	el.classList = "num-image num5";	break;
		case '6':	el.classList = "num-image num6";	break;
		case '7':	el.classList = "num-image num7";	break;
		case '8':	el.classList = "num-image num8";	break;
		case '9':	el.classList = "num-image num9";	break;
		case '-':	el.classList = "num-image num-";	break;
		default : break;
	}
}

function updateThreeDigitNumber(num, n1, n2, n3) {	
	if( 0 <= num ) {		
		let hundredth = Math.floor(num / 100);
		updateNumber(n1, hundredth.toString());

		let remain = num - hundredth * 100;
		let tenth = Math.floor(remain / 10);
		updateNumber(n2, tenth.toString());
		
		remain = remain - tenth * 10;
		updateNumber(n3, remain.toString());
	} else  {
		updateNumber(n1, "-");

		let remain = mineCount * -1;
		let tenth = Math.floor(remain / 10);
		updateNumber(n2, tenth.toString());
		
		remain = remain - tenth * 10;
		updateNumber(n3, remain.toString());
	}
}

function updateMineCount() {		
	const mineCount = mineSweeperGame.getMineCount();	
	updateThreeDigitNumber(
		mineCount, 
		document.getElementById("mineNum1"),
		document.getElementById("mineNum2"),
		document.getElementById("mineNum3")		
	);
}


function updateTimer() {
	if( _isStartGame === false ) {
		updateThreeDigitNumber(_timeSecond, 
			document.getElementById("time1"),
			document.getElementById("time2"),
			document.getElementById("time3")
		);
		return ;
	}

	++_timeSecond;
	updateThreeDigitNumber(_timeSecond, 
		document.getElementById("time1"),
		document.getElementById("time2"),
		document.getElementById("time3")
	);

	setTimeout(()=>{
		updateTimer();
	}, 1000);
}




///////////////////////////////////////////////////////////////////////////////////////////////////
// control game 
function checkWinGame() {	
	if( mineSweeperGame.isWinGame() === true )
		winGame();
}


function terminateGame() {
	_isStartGame = false;	
	_isGameOver = true;
	_imgReset.src = "assets/image/face_lose.svg";
}

function winGame() {
	_isStartGame = false;	
	_isGameOver = true;
	_imgReset.src = "assets/image/face_win.svg";
}


function createBoard() {
	// clear field
	mineField.innerHTML = "";
	_isStartGame = false;
	_isGameOver = false;
	_timeSecond = 0;	
	updateTimer();	

	_imgReset.src="assets/image/face_unpressed.svg";

	// <div class="row">
	// 	<div class="block-closed" id="1_1"></div>
	// 	<div class="block-closed" id="1_2"></div>
	//  ...
	// 	<div class="block-closed" id="1_8"></div>
	// 	<div class="block-closed" id="1_9"></div>
	//</div>
	let rowElement = null;
	let mineElement = null;	
	
	for( let row = 0;	row < FIELD_ROW_COUNT;	++row )  {
		rowElement = document.createElement("div");
		rowElement.classList.add("row");
		for (let column = 0;	column < FIELD_COLUMN_COUNT;	++column) {			
			mineElement = document.createElement("div");
			mineElement.id = `${row}_${column}`;
			mineElement.classList.add(MineBlockClassName.closed);
			mineElement.addEventListener('click', onFieldClick);
			mineElement.addEventListener('contextmenu', onFieldRightClick);
			rowElement.appendChild(mineElement);			
		}
		mineField.appendChild(rowElement);
	}

	mineSweeperGame = new MineSweeper();
	mineSweeperGame.newGame(FIELD_ROW_COUNT, FIELD_COLUMN_COUNT, MINE_COUNT);		
	gameBoard.style.width = `${FIELD_COLUMN_COUNT * SPACE_LENGTH}px`;
	gameBoard.style.height = `${FIELD_ROW_COUNT * SPACE_LENGTH + INFO_PANEL_HEIGHT }px`;
}

function setBinner() {
	FIELD_ROW_COUNT = 9;
	FIELD_COLUMN_COUNT = 9;
	MINE_COUNT = 10;
	createBoard();
}

function setIntermediate() {
	FIELD_ROW_COUNT = 16;
	FIELD_COLUMN_COUNT = 16;
	MINE_COUNT = 40;
	createBoard();
}

function setExpert() {
	FIELD_ROW_COUNT = 16;
	FIELD_COLUMN_COUNT = 30;
	MINE_COUNT = 99;
	createBoard();
}




(function onInit() {
	setBinner();
})();



