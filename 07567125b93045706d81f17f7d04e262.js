ace.define("ace/ext/rtl",["require","exports","module","ace/editor","ace/config"],(function(require,exports,module){"use strict";var commands=[{name:"leftToRight",bindKey:{win:"Ctrl-Alt-Shift-L",mac:"Command-Alt-Shift-L"},exec:function(editor){editor.session.$bidiHandler.setRtlDirection(editor,!1)},readOnly:!0},{name:"rightToLeft",bindKey:{win:"Ctrl-Alt-Shift-R",mac:"Command-Alt-Shift-R"},exec:function(editor){editor.session.$bidiHandler.setRtlDirection(editor,!0)},readOnly:!0}],Editor=require("../editor").Editor;function onChangeSelection(e,editor){var lead=editor.getSelection().lead;editor.session.$bidiHandler.isRtlLine(lead.row)&&0===lead.column&&(editor.session.$bidiHandler.isMoveLeftOperation&&lead.row>0?editor.getSelection().moveCursorTo(lead.row-1,editor.session.getLine(lead.row-1).length):editor.getSelection().isEmpty()?lead.column+=1:lead.setPosition(lead.row,lead.column+1))}function onCommandEmitted(commadEvent){commadEvent.editor.session.$bidiHandler.isMoveLeftOperation=/gotoleft|selectleft|backspace|removewordleft/.test(commadEvent.command.name)}function onChange(delta,editor){var session=editor.session;if(session.$bidiHandler.currentRow=null,session.$bidiHandler.isRtlLine(delta.start.row)&&"insert"===delta.action&&delta.lines.length>1)for(var row=delta.start.row;row<delta.end.row;row++)session.getLine(row+1).charAt(0)!==session.$bidiHandler.RLE&&(session.doc.$lines[row+1]=session.$bidiHandler.RLE+session.getLine(row+1))}function updateLineDirection(e,renderer){var $bidiHandler=renderer.session.$bidiHandler,cells=renderer.$textLayer.$lines.cells,width=renderer.layerConfig.width-renderer.layerConfig.padding+"px";cells.forEach((function(cell){var style=cell.element.style;$bidiHandler&&$bidiHandler.isRtlLine(cell.row)?(style.direction="rtl",style.textAlign="right",style.width=width):(style.direction="",style.textAlign="",style.width="")}))}function clearTextLayer(renderer){var lines=renderer.$textLayer.$lines;function clear(cell){var style=cell.element.style;style.direction=style.textAlign=style.width=""}lines.cells.forEach(clear),lines.cellCache.forEach(clear)}require("../config").defineOptions(Editor.prototype,"editor",{rtlText:{set:function(val){val?(this.on("change",onChange),this.on("changeSelection",onChangeSelection),this.renderer.on("afterRender",updateLineDirection),this.commands.on("exec",onCommandEmitted),this.commands.addCommands(commands)):(this.off("change",onChange),this.off("changeSelection",onChangeSelection),this.renderer.off("afterRender",updateLineDirection),this.commands.off("exec",onCommandEmitted),this.commands.removeCommands(commands),clearTextLayer(this.renderer)),this.renderer.updateFull()}},rtl:{set:function(val){this.session.$bidiHandler.$isRtl=val,val?(this.setOption("rtlText",!1),this.renderer.on("afterRender",updateLineDirection),this.session.$bidiHandler.seenBidi=!0):(this.renderer.off("afterRender",updateLineDirection),clearTextLayer(this.renderer)),this.renderer.updateFull()}}})})),ace.require(["ace/ext/rtl"],(function(m){"object"==typeof module&&"object"==typeof exports&&module&&(module.exports=m)}));