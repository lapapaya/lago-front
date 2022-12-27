ace.define("ace/mode/fsharp_highlight_rules",["require","exports","module","ace/lib/oop","ace/mode/text_highlight_rules"],(function(require,exports,module){"use strict";var oop=require("../lib/oop"),TextHighlightRules=require("./text_highlight_rules").TextHighlightRules,FSharpHighlightRules=function(){var keywordMapper=this.createKeywordMapper({variable:"this",keyword:"abstract|assert|base|begin|class|default|delegate|done|downcast|downto|elif|else|exception|extern|false|finally|function|global|inherit|inline|interface|internal|lazy|match|member|module|mutable|namespace|open|or|override|private|public|rec|return|return!|select|static|struct|then|to|true|try|typeof|upcast|use|use!|val|void|when|while|with|yield|yield!|__SOURCE_DIRECTORY__|as|asr|land|lor|lsl|lsr|lxor|mod|sig|atomic|break|checked|component|const|constraint|constructor|continue|eager|event|external|fixed|functor|include|method|mixin|object|parallel|process|protected|pure|sealed|tailcall|trait|virtual|volatile|and|do|end|for|fun|if|in|let|let!|new|not|null|of|endif",constant:"true|false"},"identifier"),floatNumber="(?:(?:(?:(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.))|(?:\\d+))(?:[eE][+-]?\\d+))|(?:(?:(?:\\d+)?(?:\\.\\d+))|(?:(?:\\d+)\\.)))";this.$rules={start:[{token:"variable.classes",regex:"\\[\\<[.]*\\>\\]"},{token:"comment",regex:"//.*$"},{token:"comment.start",regex:/\(\*(?!\))/,push:"blockComment"},{token:"string",regex:"'.'"},{token:"string",regex:'"""',next:[{token:"constant.language.escape",regex:/\\./,next:"qqstring"},{token:"string",regex:'"""',next:"start"},{defaultToken:"string"}]},{token:"string",regex:'"',next:[{token:"constant.language.escape",regex:/\\./,next:"qqstring"},{token:"string",regex:'"',next:"start"},{defaultToken:"string"}]},{token:["verbatim.string","string"],regex:'(@?)(")',stateName:"qqstring",next:[{token:"constant.language.escape",regex:'""'},{token:"string",regex:'"',next:"start"},{defaultToken:"string"}]},{token:"constant.float",regex:"(?:"+floatNumber+"|\\d+)[jJ]\\b"},{token:"constant.float",regex:floatNumber},{token:"constant.integer",regex:"(?:(?:(?:[1-9]\\d*)|(?:0))|(?:0[oO]?[0-7]+)|(?:0[xX][\\dA-Fa-f]+)|(?:0[bB][01]+))\\b"},{token:["keyword.type","variable"],regex:"(type\\s)([a-zA-Z0-9_$-]*\\b)"},{token:keywordMapper,regex:"[a-zA-Z_$][a-zA-Z0-9_$]*\\b"},{token:"keyword.operator",regex:"\\+\\.|\\-\\.|\\*\\.|\\/\\.|#|;;|\\+|\\-|\\*|\\*\\*\\/|\\/\\/|%|<<|>>|&|\\||\\^|~|<|>|<=|=>|==|!=|<>|<-|=|\\(\\*\\)"},{token:"paren.lparen",regex:"[[({]"},{token:"paren.rparen",regex:"[\\])}]"}],blockComment:[{regex:/\(\*\)/,token:"comment"},{regex:/\(\*(?!\))/,token:"comment.start",push:"blockComment"},{regex:/\*\)/,token:"comment.end",next:"pop"},{defaultToken:"comment"}]},this.normalizeRules()};oop.inherits(FSharpHighlightRules,TextHighlightRules),exports.FSharpHighlightRules=FSharpHighlightRules})),ace.define("ace/mode/folding/cstyle",["require","exports","module","ace/lib/oop","ace/range","ace/mode/folding/fold_mode"],(function(require,exports,module){"use strict";var oop=require("../../lib/oop"),Range=require("../../range").Range,BaseFoldMode=require("./fold_mode").FoldMode,FoldMode=exports.FoldMode=function(commentRegex){commentRegex&&(this.foldingStartMarker=new RegExp(this.foldingStartMarker.source.replace(/\|[^|]*?$/,"|"+commentRegex.start)),this.foldingStopMarker=new RegExp(this.foldingStopMarker.source.replace(/\|[^|]*?$/,"|"+commentRegex.end)))};oop.inherits(FoldMode,BaseFoldMode),function(){this.foldingStartMarker=/([\{\[\(])[^\}\]\)]*$|^\s*(\/\*)/,this.foldingStopMarker=/^[^\[\{\(]*([\}\]\)])|^[\s\*]*(\*\/)/,this.singleLineBlockCommentRe=/^\s*(\/\*).*\*\/\s*$/,this.tripleStarBlockCommentRe=/^\s*(\/\*\*\*).*\*\/\s*$/,this.startRegionRe=/^\s*(\/\*|\/\/)#?region\b/,this._getFoldWidgetBase=this.getFoldWidget,this.getFoldWidget=function(session,foldStyle,row){var line=session.getLine(row);if(this.singleLineBlockCommentRe.test(line)&&!this.startRegionRe.test(line)&&!this.tripleStarBlockCommentRe.test(line))return"";var fw=this._getFoldWidgetBase(session,foldStyle,row);return!fw&&this.startRegionRe.test(line)?"start":fw},this.getFoldWidgetRange=function(session,foldStyle,row,forceMultiline){var match,line=session.getLine(row);if(this.startRegionRe.test(line))return this.getCommentRegionBlock(session,line,row);if(match=line.match(this.foldingStartMarker)){var i=match.index;if(match[1])return this.openingBracketBlock(session,match[1],row,i);var range=session.getCommentFoldRange(row,i+match[0].length,1);return range&&!range.isMultiLine()&&(forceMultiline?range=this.getSectionRange(session,row):"all"!=foldStyle&&(range=null)),range}if("markbegin"!==foldStyle&&(match=line.match(this.foldingStopMarker))){i=match.index+match[0].length;return match[1]?this.closingBracketBlock(session,match[1],row,i):session.getCommentFoldRange(row,i,-1)}},this.getSectionRange=function(session,row){for(var line=session.getLine(row),startIndent=line.search(/\S/),startRow=row,startColumn=line.length,endRow=row+=1,maxRow=session.getLength();++row<maxRow;){var indent=(line=session.getLine(row)).search(/\S/);if(-1!==indent){if(startIndent>indent)break;var subRange=this.getFoldWidgetRange(session,"all",row);if(subRange){if(subRange.start.row<=startRow)break;if(subRange.isMultiLine())row=subRange.end.row;else if(startIndent==indent)break}endRow=row}}return new Range(startRow,startColumn,endRow,session.getLine(endRow).length)},this.getCommentRegionBlock=function(session,line,row){for(var startColumn=line.search(/\s*$/),maxRow=session.getLength(),startRow=row,re=/^\s*(?:\/\*|\/\/|--)#?(end)?region\b/,depth=1;++row<maxRow;){line=session.getLine(row);var m=re.exec(line);if(m&&(m[1]?depth--:depth++,!depth))break}if(row>startRow)return new Range(startRow,startColumn,row,line.length)}}.call(FoldMode.prototype)})),ace.define("ace/mode/fsharp",["require","exports","module","ace/lib/oop","ace/mode/text","ace/mode/fsharp_highlight_rules","ace/mode/folding/cstyle"],(function(require,exports,module){"use strict";var oop=require("../lib/oop"),TextMode=require("./text").Mode,FSharpHighlightRules=require("./fsharp_highlight_rules").FSharpHighlightRules,CStyleFoldMode=require("./folding/cstyle").FoldMode,Mode=function(){TextMode.call(this),this.HighlightRules=FSharpHighlightRules,this.foldingRules=new CStyleFoldMode};oop.inherits(Mode,TextMode),function(){this.lineCommentStart="//",this.blockComment={start:"(*",end:"*)",nestable:!0},this.$id="ace/mode/fsharp"}.call(Mode.prototype),exports.Mode=Mode})),ace.require(["ace/mode/fsharp"],(function(m){"object"==typeof module&&"object"==typeof exports&&module&&(module.exports=m)}));