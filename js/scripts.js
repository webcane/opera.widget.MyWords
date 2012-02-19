// initialize the widget
var myWords = myWords || {};

myWords.webdb = {};
myWords.webdb.db = null;
myWords.webdb.length = 0;

myWords.Words = new Array();

var fliped = false;

// jQuery 
$(document).ready(function(){
    
    var files = $("#files"),
        state = $("#errors-body");
		//state = $("#errors-body > p");
	
    var message; 
    
    console.warn("======================= document ready =======================");
    
    // check Local storage available
    if (supportLocalStorage()) {
        logSuccessMessage('Local storage available');        
        initLocalStorage();    
        readLocalStorageItems();                
    } else {
        logFailMessage('No native support for HTML5 storage');
    }   
 
       
    myWords.vi = setVariableInterval(function() {
                myWords.start();               
        		return myWords.timeout;                
        }, myWords.timeout); 
    console.info("myWords.vi was setted");  

    //console.info("myWords.firstRun is " + myWords.firstRun);          
    console.info("firstRun is " + myWords.firstRun);
    if (myWords.firstRun == "true") {
            myWords.flip();
    } else {
        myWords.init();        
    }        
    
    // Check the support of File API 
    if (window.File && window.FileReader && window.FileList) {
          logSuccessMessage('File API & FileReader available');
                  
          //$("#files").change(myWords.handleFileSelect);
          //$("#files").change(myWords.openFile);
          //$("#files").bind("change", myWords.openFile, false);
          $("#files").click(myWords.openFile);
		  console.log("action change was binded for #files as handleFileSelect function");      
          
          // add behavior to the 'next word' button
          $('#next').click(function() {
            console.warn("#next pressed and " + $(this).attr('disabled'));
            if (!$(this).attr('disabled') ) {
                console.info("switch off the next button");
                $(this).attr('disabled', 'disabled');
                console.warn("#next pressed and " + $(this).attr('disabled'));        
                myWords.next();
            } else {
                console.info("next button are still disabled");
            }
          });                   
                   
    } else {
        logFailMessage('Sorry, File API not supported.<br />Please try with a different browser');
    }   
    
    if (!window.openDatabase) {
        logFailMessage('Your browser does not appear to support the openDatabase call from the HTML5.<br />Please try with a different browser');
    } else {
        logSuccessMessage('Web SQL database available');    
    }
    
    // add behavior to the flip button
    $('#flip').click(myWords.flip);

    // add behavior to the close button
    /* $('#close').click(window.close); */
    
    $("#show-font-effect").click(function() {
		myWords.runUIEffect("#font-effect-example span");
		return false;
	}); 
    
    $("#font-effect-type").change(function() {
        myWords.setSelectedEffect($(this).val());
        return false; 
	});    
    
    $("#font-effect-speed").change(function() {
        myWords.setEffectSpeed($(this).val());
		return false; 
	});
    
    $("#font-effect-timeout").change(function() {
        myWords.setTimeout($(this).val());
		return false; 
	});           

});


function logSuccessMessage(message) {
    state = $("#errors-body");
    state.html(state.html() + "<p class='success'>" + message + "</p>");
    console.info(message);    
}

function logFailMessage(message) {
    state = $("#errors-body");
    state.html(state.html() + "<p class='fail'>" + message + "</p>");
    console.info(message);    
}

function supportLocalStorage() {
  try {
    return 'localStorage' in window && window['localStorage'] !== null;
  } catch (e) {
    return false;
  }
}




function initLocalStorage() {    
    if ( localStorage.length == 0) {
        console.log("localStorage init()");
        localStorage.setItem('firstRun', true);
        localStorage.setItem('speed', 1000);
        localStorage.setItem('switchTimeout', 2000);
        localStorage.setItem('initTimeout', 1000);
        localStorage.setItem('timeout', 10000);
        localStorage.setItem('fleepSpeed', 1000);
        localStorage.setItem('dbSize', 5242880); // 5 * 1024 * 1024; // 5MB
        localStorage.setItem('dbName', 'MYWORDSDB');
        localStorage.setItem('dbTableName', 'TableWords');
        localStorage.setItem('dbVer', '1.0');
        localStorage.setItem('dbDesc', 'My Dictionary in Web SQL Database');
        localStorage.setItem('backViewHeight', '420px');
        localStorage.setItem('frontViewHeight', '120px');
        localStorage.setItem('fontSize', '22');
        localStorage.setItem('selectedEffect', 'drop');
        console.log("localStorages items was setted");                  
    }
    else {
        console.log("localStorage was already inited before");
    }
};

function readLocalStorageItems() {    
    if ( localStorage.length != 0) {
        console.log("read localStorage items");        
        myWords.firstRun = localStorage.getItem('firstRun');
        myWords.setEffectSpeed(parseInt(localStorage.getItem('speed')), true);      
        myWords.switchTimeout = localStorage.getItem('switchTimeout');
        myWords.initTimeout = parseInt(localStorage.getItem('initTimeout'));
        myWords.setTimeout(parseInt(localStorage.getItem('timeout')), true);
        myWords.fleepSpeed = parseInt(localStorage.getItem('fleepSpeed'));
        myWords.dbSize = parseInt(localStorage.getItem('dbSize'));
        myWords.dbName = localStorage.getItem('dbName');
        myWords.dbTableName = localStorage.getItem('dbTableName');
        myWords.dbVer  = localStorage.getItem('dbVer');
        myWords.dbDesc = localStorage.getItem('dbDesc');        
        myWords.backViewHeight  = localStorage.getItem('backViewHeight');
        myWords.frontViewHeight = localStorage.getItem('frontViewHeight'); 
        myWords.changeFontSize(localStorage.getItem('fontSize'));
        myWords.setSelectedEffect(localStorage.getItem('selectedEffect'), true);
    }
    else {
        console.warn("localStorage does not have any items");
    }
};

myWords.openFile = function(evt) {
        console.log("myWords.openFile()");
        opera.io.filesystem.browseForFile("myWords", "", myWords.openFileCallback);
}

myWords.openFileCallback = function(file) {
        console.log("myWords.openFileCallback()");
        if (file) {
            fstream = file.open(file, opera.io.filemode.READ);
            while (!fstream.eof) {
                var line = fstream.readLine("UTF-8");
				console.log(line);
                //line = fstream.readLine();
                var data = line.split("=");
                var word = { word: data[0], translation: data[1]};
                myWords.Words.push(word);
            }
            
            console.info(myWords.Words.length + " words was readed");
                            
            myWords.webdb.length = myWords.Words.length;
            console.log("myWords.webdb.length=" + myWords.webdb.length);
                            
            // init myWords after words file was readed
            myWords.init(myWords.Words);  
                            
            myWords.firstRun = false;
            localStorage.setItem('firstRun', myWords.firstRun); 
            console.info("firstRun was droped");
                            
            myWords.flip();            
        }
}

myWords.handleFileSelect = function(evt) {
                console.log("myWords.handleFileSelect(). Input file was changed");

                evt.preventDefault();
          
                var files = evt.target.files; // FileList object   
                console.log("next files was selected:", files);
                                
                for (var i = 0, file; file = files[i]; i++) {
                
                        var Words  = new Array();        // or //var Words = [];                    
                        var reader = new FileReader();
                    					
                    	reader.readAsText(file);
                        console.log("read file ", file);
                                    
                        reader.onload = (function(file, data) {
                    				return function(e) {
                                        if (e.target.result) {
                                            var lines = e.target.result.split("\n");
                                            
                                            for (var j=0; j < lines.length; j++) {
                                                var line = lines[j].split("=");
                                                var word = { word: line[0], translation: line[1]};
                                                //console.log(word);
                                                data.push(word);
                                                myWords.Words.push(word); 
                                            }
                                        }       					                            
                    				};
                    	})(file, Words);
                                
                        reader.onerror = function (e) {
                                  switch(e.target.error.code) {
                                    case e.target.error.NOT_FOUND_ERR:
                                      console.error('File Not Found!');
                                      break;
                                    case e.target.error.NOT_READABLE_ERR:
                                      console.error('File is not readable');
                                      
                                      WRONG_THIS_ERR
                                      break;
                                    case e.target.error.WRONG_THIS_ERR:
                                      console.error('WRONG_THIS_ERR');
                                      break;                                      
                                    case e.target.error.ABORT_ERR:
                                      break;
                                    default:
                                      console.error('An error occurred reading this file.');
                                  }
                        };                        
                        // If we use onloadend, we need to check the readyState.
                        reader.onloadend = function (e) {        
                          if(e.target.readyState == FileReader.DONE) {
                            console.info(Words.length + " words was readed");
                            
                            myWords.webdb.length = myWords.Words.length;
                            console.log("myWords.webdb.length=" + myWords.webdb.length);
                            
                            // init myWords after words file was readed
                            myWords.init(myWords.Words);  
                            
                            myWords.firstRun = false;
                            localStorage.setItem('firstRun', myWords.firstRun); 
                            console.info("firstRun was droped");
                            
                            myWords.flip();                         
                          }
                        }                                
                };
};

myWords.init = function (data) {
    console.log("myWords.init()");
    myWords.initDB(data);
}


myWords.initDB = function(data) {
    console.log("myWords.initDB()");
    myWords.webdb.open();
    myWords.webdb.createTable();
    if (data)
        myWords.webdb.setAllItems(data);
    else 
        myWords.webdb.getLength(); 
}

myWords.start = function () {
    console.log("myWords.start()");
    myWords.webdb.getRandomItem();
}

myWords.next = function () {
    console.log("myWords.next()");       
    myWords.vi.stop();
    console.log("next word");
    myWords.webdb.getRandomItem();		
    myWords.vi.start();
    console.log("vi was restarted");
}

window.setVariableInterval = function(callbackFunc, timing) {
  var variableInterval = {
    interval: timing,
    callback: callbackFunc,
    stopped: false,
    runLoop: function() {
      if (variableInterval.stopped) return;
      var result = variableInterval.callback.call(variableInterval);
      if (typeof result == 'number')
      {
        if (result === 0) return;
        variableInterval.interval = result;
      }
      variableInterval.loop();
    },
    stop: function() {
      this.stopped = true;
      window.clearTimeout(this.timeout);
    },
    start: function() {
      this.stopped = false;
      return this.loop();
    },
    loop: function() {
      this.timeout = window.setTimeout(this.runLoop, this.interval);
      return this;
    }
  };

  return variableInterval.start();
};


// function for flipping between different sides of the widget
myWords.flip = function () {
console.log("#flip was clicked");
       
    if ( fliped == false ) {
	    myWords.vi.stop();
        myWords.showBackView();
        console.log("showBackView()");
    }
    else {
	    myWords.vi.start();
        myWords.showFrontView();
        console.log("showFrontView()");
    }
}


myWords.showBackView = function (e)
{
  $('#front').css({display: 'none'});
  $('#config').css({display: 'block'});
  $('#next').css({visibility: 'hidden'});
  fliped = true;
  if (myWords.firstRun == "true") {
    $('#font-size-body').css({display: 'none'});
    $('#font-effects-body').css({display: 'none'});
    $('#errors-body').css({display: 'none'});
  }
  else {
    $('#font-size-body').css({display: 'block'});
    $('#font-effects-body').css({display: 'block'});
    $('#errors-body').css({display: 'block'});
    $('#content').animate({height: myWords.backViewHeight}, myWords.fleepSpeed);
  }
  //$('#content').animate({height: myWords.backViewHeight}, myWords.fleepSpeed);
}
myWords.showFrontView = function (e) 
{
  $('#front').css({display: 'block'});
  $('#config').css({display: 'none'});
  $('#next').css({visibility: 'visible'});
  fliped = false;
  $('#content').animate({height: myWords.frontViewHeight}, myWords.fleepSpeed);  
}

// function for changing font size
myWords.changeFontSize = function(val) {
    var textSize = 0;
    if (val)
      textSize = val; 
    else
      textSize = $('#font-size').val();
      

  $('#font-size-example').css({fontSize: textSize + 'px'});        
  $('#font-ex').css({fontSize: textSize + 'px'});
                  
  $('#font-size-value').html(textSize);
}

// function for set using effect
myWords.setSelectedEffect = function(effect, load) {
    if (effect) {
        console.warn(effect + " effect will be using");
        myWords.selectedEffect = effect;
        if (load)
            $("#font-effect-type").val(effect).attr('selected', true);
        else
            localStorage.setItem('selectedEffect', myWords.selectedEffect); 
    }
    else {
        console.warn("Selected Effect is bad");
    }
}

myWords.setEffectSpeed = function(speed, load) {    
    if (speed) {
        console.warn("effect speed = " + speed + "s.");
        if (load) {
            $("#font-effect-speed").val(speed/1000).attr('selected', true);
            myWords.speed = speed;
        }
        else {
            myWords.speed = speed*1000;
            localStorage.setItem('speed', myWords.speed);
        }        
    }
    else {
        console.warn("Selected Effect's speed is bad");
    }
}

myWords.setTimeout = function(timeout, load) {    
    if (timeout) {
        console.warn("Timeout = " + timeout + "s.");
        if (load) {
            $("#font-effect-timeout").val(timeout/1000).attr('selected', true);
            myWords.timeout = timeout;
        }
        else {
            myWords.timeout = timeout*1000;
            localStorage.setItem('Timeout', myWords.timeout);
        }        
    }
    else {
        console.warn("Selected timeout is bad");
    }
}





// open Web SQL Database
myWords.webdb.open = function() {
    console.log("myWords.webdb.open()");
	myWords.webdb.db = openDatabase(myWords.dbName, myWords.dbVer, myWords.dbDesc, myWords.dbSize);
    if (myWords.webdb.db != null)
        console.log("Web SQL Database is opened");
    else
        console.warn("Web SQL Database is not opened");
}

// create Web SQL Database Table
myWords.webdb.createTable = function() {
    console.log("myWords.webdb.createTable()");
	myWords.webdb.db.transaction(function(tx) {
     tx.executeSql("CREATE TABLE IF NOT EXISTS " + myWords.dbTableName + " (id INTEGER PRIMARY KEY, word TEXT, translation TEXT)", 
       [], 
       myWords.webdb.onSuccess, 
       myWords.webdb.onError);
  });
  //alert("Table Words created");
}

myWords.webdb.setAllItems = function(wordsArr) {
  console.log("myWords.webdb.setAllItems()"); 
  myWords.webdb.db.transaction(function(tx) {					  
	tx.executeSql("SELECT * FROM " + myWords.dbTableName, [], function(tx, result) {
			if (result.rows.length == 0) {
			  //alert("setAllItems(): No items in table Words");
				myWords.webdb.db.transaction(function(tx){
				  for (var i=0; i < wordsArr.length; i++) {
                    var item = wordsArr[i];
                    tx.executeSql("INSERT INTO " + myWords.dbTableName + " (id, word, translation) VALUES (?,?,?);",
                      [i, item.word, item.translation],
                      myWords.webdb.onSuccess,
                      myWords.webdb.onError);
                  };			
		    });		    
		  };
		},
		myWords.webdb.onError);
	});
	//alert("setAllItems(): Set All items");
}

// get count of records in DB
myWords.webdb.getLength = function() {
  console.log("myWords.webdb.getLength()");
  console.time("myWords.webdb.getLength() time");
  myWords.webdb.db.transaction(function(tx) {
    tx.executeSql("SELECT COUNT(*) AS c FROM " + myWords.dbTableName, 
      [], 
      function(tx, result) {        
  		//alert("getLength(): " + result.rows[0].c + " records in DB");
        myWords.webdb.length = result.rows[0].c;
        console.log("myWords.webdb.length: " + myWords.webdb.length);
        console.timeEnd("myWords.webdb.getLength() time");
	  	},
	  myWords.webdb.onError
    );
    
  });
}

// get random record from DB	
myWords.webdb.getRandomItem = function() {
  //console.group("myWords.webdb.getRandomItem()");
  console.log("myWords.webdb.getRandomItem()");
  console.log("myWords.webdb.getRandomItem(): count=" + myWords.webdb.length);
  //alert(myWords.webdb.length + " records in DB"); 
  if (myWords.webdb.length > 0) {
    myWords.webdb.db.transaction(function(tx) {
  	var id = Math.round(Math.random() * myWords.webdb.length); // random data		
    //alert("Id=" + id);			  
  	tx.executeSql("SELECT * FROM " + myWords.dbTableName + " WHERE id=?", [id], function(tx, result) {
  			for (var i=0; i < result.rows.length; i++) {         
              var key = result.rows.item(i)['word'];
              var value = result.rows.item(i)['translation'];
              console.log(key + "=" + value);       
              // run animation
              myWords.runEffect(key, value);
            };        			
        },
        myWords.webdb.onError);
  	});
  } 
  else {
    console.error(myWords.webdb.length + " records in DB");
  }	
  //console.timeEnd("vi");
  //console.groupEnd();	
}

myWords.webdb.onError = function(tx, e) {
  //$('#errors').html("Error: " + e.message);
  console.error(e);
  //alert("Error: " + e.message);
}
myWords.webdb.onSuccess = function(tx, result) {
  console.info(result);
}


//run the currently selected effect
myWords.runEffect = function(key, value) {	 
  myWords.runUIEffect("#word", key);
  myWords.runUIEffect("#translation", value, function() { 
      setTimeout(function() {
		console.info("switch on the next button");      
        $('#next').removeAttr('disabled');
	  }, myWords.speed);        
  });  
  /*      $("#word, #translation").stop() 
                  .animate({opacity: 0.0}, myWords.speed)
                  .animate({opacity: 1.0}, myWords.speed);                                 
        $("#word").html(key);                  
        $("#translation").html(value); 
        */	
}

myWords.runUIEffect = function(target, value, callback) {
    console.log("myWords.selectedEffect=" + myWords.selectedEffect);	
    console.log("myWords.speed=" + myWords.speed);
  //var selectedEffect = $('#font-effect-type').val();
  
  //most effect types need no options passed by default
	var options = {};
	
  //check if it's scale, transfer, or size - they need options explicitly set
	if(myWords.selectedEffect == 'scale'){  options = {percent: 0}; }
	else if(myWords.selectedEffect == 'size'){ options = { to: {width: 200,height: 60} }; }
			
	//run the effect
	//$("#font-effect-example").toggle(selectedEffect,options,myWords.speed);
	if (value) {
        console.log("myWords.runUIEffect(value=" + value + ")");    
  	    $(target).toggle(myWords.selectedEffect, options, myWords.speed)
                 .delay(100).html(value)
                 .toggle(myWords.selectedEffect, options, myWords.speed);
    }
    else {
        console.log("myWords.runUIEffect(target=" + target + ")");    
      	$(target).toggle(myWords.selectedEffect, options, myWords.speed)
                 .toggle(myWords.selectedEffect, options, myWords.speed);  
    }
            
    if ( callback ){
        var target = $('#next');
        console.info("#next attribute disable is " + target.attr('disabled'));    
        if ( target.attr('disabled') ) { 
            console.log("myWords.runUIEffect(callback)");
            setTimeout(function() {
        		callback();
        	}, myWords.switchTimeout);             
             
        }
    }
    //console.timeEnd("myWords.runUIEffect()");     
}

myWords.stopEffect = function(callback) {
  /* $("#word").queue("fx", []).stop();
  $("#translation").queue("fx", []).stop(); */
  /* если есть stop на элементе, то анимация останавливается сразу */
  /* $("#word").queue("fx", []);
  $("#translation").queue("fx", []); */
  console.time("myWords.stopEffect()");
  $("#word").queue("fx", []).stop();
  $("#translation").queue("fx", []).stop();
  console.timeEnd("stopEffect");
  if ( callback ){ 
    console.log("myWords.stopEffect(callback)");
    callback(); 
  } 
  
}
