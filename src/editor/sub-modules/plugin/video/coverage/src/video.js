function BranchData() {
    this.position = -1;
    this.nodeLength = -1;
    this.src = null;
    this.evalFalse = 0;
    this.evalTrue = 0;

    this.init = function(position, nodeLength, src) {
        this.position = position;
        this.nodeLength = nodeLength;
        this.src = src;
        return this;
    }

    this.ranCondition = function(result) {
        if (result)
            this.evalTrue++;
        else
            this.evalFalse++;
    };

    this.pathsCovered = function() {
        var paths = 0;
        if (this.evalTrue > 0)
          paths++;
        if (this.evalFalse > 0)
          paths++;
        return paths;
    };

    this.covered = function() {
        return this.evalTrue > 0 && this.evalFalse > 0;
    };

    this.toJSON = function() {
        return '{"position":' + this.position
            + ',"nodeLength":' + this.nodeLength
            + ','src':' + jscoverage_quote(this.src)
            + ',"evalFalse":' + this.evalFalse
            + ',"evalTrue":' + this.evalTrue + '}';
    };

    this.message = function() {
        if (this.evalTrue === 0 && this.evalFalse === 0)
            return 'Condition never evaluated         :\t' + this.src;
        else if (this.evalTrue === 0)
            return 'Condition never evaluated to true :\t' + this.src;
        else if (this.evalFalse === 0)
            return 'Condition never evaluated to false:\t' + this.src;
        else
            return 'Condition covered';
    };
}

BranchData.fromJson = function(jsonString) {
    var json = eval('(' + jsonString + ')');
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

BranchData.fromJsonObject = function(json) {
    var branchData = new BranchData();
    branchData.init(json.position, json.nodeLength, json.src);
    branchData.evalFalse = json.evalFalse;
    branchData.evalTrue = json.evalTrue;
    return branchData;
};

function buildBranchMessage(conditions) {
    var message = 'The following was not covered:';
    for (var i = 0; i < conditions.length; i++) {
        if (conditions[i] !== undefined && conditions[i] !== null && !conditions[i].covered())
          message += '\n- '+ conditions[i].message();
    }
    return message;
};

function convertBranchDataConditionArrayToJSON(branchDataConditionArray) {
    var array = [];
    var length = branchDataConditionArray.length;
    for (var condition = 0; condition < length; condition++) {
        var branchDataObject = branchDataConditionArray[condition];
        if (branchDataObject === undefined || branchDataObject === null) {
            value = 'null';
        } else {
            value = branchDataObject.toJSON();
        }
        array.push(value);
    }
    return '[' + array.join(',') + ']';
}

function convertBranchDataLinesToJSON(branchData) {
    if (branchData === undefined) {
        return '{}'
    }
    var json = '';
    for (var line in branchData) {
        if (json !== '')
            json += ','
        json += '"' + line + '":' + convertBranchDataConditionArrayToJSON(branchData[line]);
    }
    return '{' + json + '}';
}

function convertBranchDataLinesFromJSON(jsonObject) {
    if (jsonObject === undefined) {
        return {};
    }
    for (var line in jsonObject) {
        var branchDataJSON = jsonObject[line];
        if (branchDataJSON !== null) {
            for (var conditionIndex = 0; conditionIndex < branchDataJSON.length; conditionIndex ++) {
                var condition = branchDataJSON[conditionIndex];
                if (condition !== null) {
                    branchDataJSON[conditionIndex] = BranchData.fromJsonObject(condition);
                }
            }
        }
    }
    return jsonObject;
}
function jscoverage_quote(s) {
    return '"' + s.replace(/[\u0000-\u001f"\\\u007f-\uffff]/g, function (c) {
        switch (c) {
            case '\b':
                return '\\b';
            case '\f':
                return '\\f';
            case '\n':
                return '\\n';
            case '\r':
                return '\\r';
            case '\t':
                return '\\t';
            // IE doesn't support this
            /*
             case '\v':
             return '\\v';
             */
            case '"':
                return '\\"';
            case '\\':
                return '\\\\';
            default:
                return '\\u' + jscoverage_pad(c.charCodeAt(0).toString(16));
        }
    }) + '"';
}

function getArrayJSON(coverage) {
    var array = [];
    if (coverage === undefined)
        return array;

    var length = coverage.length;
    for (var line = 0; line < length; line++) {
        var value = coverage[line];
        if (value === undefined || value === null) {
            value = 'null';
        }
        array.push(value);
    }
    return array;
}

function jscoverage_serializeCoverageToJSON() {
    var json = [];
    for (var file in _$jscoverage) {
        var lineArray = getArrayJSON(_$jscoverage[file].lineData);
        var fnArray = getArrayJSON(_$jscoverage[file].functionData);

        json.push(jscoverage_quote(file) + ':{"lineData":[' + lineArray.join(',') + '],"functionData":[' + fnArray.join(',') + '],"branchData":' + convertBranchDataLinesToJSON(_$jscoverage[file].branchData) + '}');
    }
    return '{' + json.join(',') + '}';
}


function jscoverage_pad(s) {
    return '0000'.substr(s.length) + s;
}

function jscoverage_html_escape(s) {
    return s.replace(/[<>\&\"\']/g, function (c) {
        return '&#' + c.charCodeAt(0) + ';';
    });
}
try {
  if (typeof top === 'object' && top !== null && typeof top.opener === 'object' && top.opener !== null) {
    // this is a browser window that was opened from another window

    if (! top.opener._$jscoverage) {
      top.opener._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null) {
    // this is a browser window

    try {
      if (typeof top.opener === 'object' && top.opener !== null && top.opener._$jscoverage) {
        top._$jscoverage = top.opener._$jscoverage;
      }
    }
    catch (e) {}

    if (! top._$jscoverage) {
      top._$jscoverage = {};
    }
  }
}
catch (e) {}

try {
  if (typeof top === 'object' && top !== null && top._$jscoverage) {
    this._$jscoverage = top._$jscoverage;
  }
}
catch (e) {}
if (! this._$jscoverage) {
  this._$jscoverage = {};
}
if (! _$jscoverage['/video.js']) {
  _$jscoverage['/video.js'] = {};
  _$jscoverage['/video.js'].lineData = [];
  _$jscoverage['/video.js'].lineData[6] = 0;
  _$jscoverage['/video.js'].lineData[7] = 0;
  _$jscoverage['/video.js'].lineData[8] = 0;
  _$jscoverage['/video.js'].lineData[9] = 0;
  _$jscoverage['/video.js'].lineData[10] = 0;
  _$jscoverage['/video.js'].lineData[11] = 0;
  _$jscoverage['/video.js'].lineData[12] = 0;
  _$jscoverage['/video.js'].lineData[15] = 0;
  _$jscoverage['/video.js'].lineData[16] = 0;
  _$jscoverage['/video.js'].lineData[19] = 0;
  _$jscoverage['/video.js'].lineData[22] = 0;
  _$jscoverage['/video.js'].lineData[24] = 0;
  _$jscoverage['/video.js'].lineData[27] = 0;
  _$jscoverage['/video.js'].lineData[29] = 0;
  _$jscoverage['/video.js'].lineData[30] = 0;
  _$jscoverage['/video.js'].lineData[33] = 0;
  _$jscoverage['/video.js'].lineData[34] = 0;
  _$jscoverage['/video.js'].lineData[35] = 0;
  _$jscoverage['/video.js'].lineData[38] = 0;
  _$jscoverage['/video.js'].lineData[41] = 0;
  _$jscoverage['/video.js'].lineData[43] = 0;
  _$jscoverage['/video.js'].lineData[44] = 0;
  _$jscoverage['/video.js'].lineData[47] = 0;
  _$jscoverage['/video.js'].lineData[49] = 0;
  _$jscoverage['/video.js'].lineData[52] = 0;
  _$jscoverage['/video.js'].lineData[53] = 0;
  _$jscoverage['/video.js'].lineData[54] = 0;
  _$jscoverage['/video.js'].lineData[57] = 0;
  _$jscoverage['/video.js'].lineData[58] = 0;
  _$jscoverage['/video.js'].lineData[59] = 0;
  _$jscoverage['/video.js'].lineData[60] = 0;
  _$jscoverage['/video.js'].lineData[62] = 0;
  _$jscoverage['/video.js'].lineData[63] = 0;
  _$jscoverage['/video.js'].lineData[68] = 0;
  _$jscoverage['/video.js'].lineData[70] = 0;
  _$jscoverage['/video.js'].lineData[71] = 0;
  _$jscoverage['/video.js'].lineData[72] = 0;
  _$jscoverage['/video.js'].lineData[74] = 0;
  _$jscoverage['/video.js'].lineData[76] = 0;
  _$jscoverage['/video.js'].lineData[85] = 0;
  _$jscoverage['/video.js'].lineData[86] = 0;
  _$jscoverage['/video.js'].lineData[87] = 0;
  _$jscoverage['/video.js'].lineData[88] = 0;
  _$jscoverage['/video.js'].lineData[97] = 0;
  _$jscoverage['/video.js'].lineData[106] = 0;
  _$jscoverage['/video.js'].lineData[107] = 0;
  _$jscoverage['/video.js'].lineData[108] = 0;
  _$jscoverage['/video.js'].lineData[114] = 0;
  _$jscoverage['/video.js'].lineData[118] = 0;
  _$jscoverage['/video.js'].lineData[127] = 0;
}
if (! _$jscoverage['/video.js'].functionData) {
  _$jscoverage['/video.js'].functionData = [];
  _$jscoverage['/video.js'].functionData[0] = 0;
  _$jscoverage['/video.js'].functionData[1] = 0;
  _$jscoverage['/video.js'].functionData[2] = 0;
  _$jscoverage['/video.js'].functionData[3] = 0;
  _$jscoverage['/video.js'].functionData[4] = 0;
  _$jscoverage['/video.js'].functionData[5] = 0;
  _$jscoverage['/video.js'].functionData[6] = 0;
  _$jscoverage['/video.js'].functionData[7] = 0;
}
if (! _$jscoverage['/video.js'].branchData) {
  _$jscoverage['/video.js'].branchData = {};
  _$jscoverage['/video.js'].branchData['25'] = [];
  _$jscoverage['/video.js'].branchData['25'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['31'] = [];
  _$jscoverage['/video.js'].branchData['31'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['34'] = [];
  _$jscoverage['/video.js'].branchData['34'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['43'] = [];
  _$jscoverage['/video.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['49'] = [];
  _$jscoverage['/video.js'].branchData['49'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['54'] = [];
  _$jscoverage['/video.js'].branchData['54'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['57'] = [];
  _$jscoverage['/video.js'].branchData['57'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['58'] = [];
  _$jscoverage['/video.js'].branchData['58'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['59'] = [];
  _$jscoverage['/video.js'].branchData['59'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['62'] = [];
  _$jscoverage['/video.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['70'] = [];
  _$jscoverage['/video.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['72'] = [];
  _$jscoverage['/video.js'].branchData['72'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['72'][2] = new BranchData();
  _$jscoverage['/video.js'].branchData['73'] = [];
  _$jscoverage['/video.js'].branchData['73'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['74'] = [];
  _$jscoverage['/video.js'].branchData['74'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['74'][2] = new BranchData();
  _$jscoverage['/video.js'].branchData['85'] = [];
  _$jscoverage['/video.js'].branchData['85'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['87'] = [];
  _$jscoverage['/video.js'].branchData['87'][1] = new BranchData();
  _$jscoverage['/video.js'].branchData['107'] = [];
  _$jscoverage['/video.js'].branchData['107'][1] = new BranchData();
}
_$jscoverage['/video.js'].branchData['107'][1].init(100, 10, 'selectedEl');
function visit19_107_1(result) {
  _$jscoverage['/video.js'].branchData['107'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['87'][1].init(133, 40, 'getProvider(element.getAttribute('src'))');
function visit18_87_1(result) {
  _$jscoverage['/video.js'].branchData['87'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['85'][1].init(29, 33, '!flashUtils.isFlashEmbed(element)');
function visit17_85_1(result) {
  _$jscoverage['/video.js'].branchData['85'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['74'][2].init(49, 86, 'c.getAttribute('value') || c.getAttribute("VALUE")');
function visit16_74_2(result) {
  _$jscoverage['/video.js'].branchData['74'][2].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['74'][1].init(37, 99, 'getProvider(c.getAttribute('value') || c.getAttribute("VALUE"))');
function visit15_74_1(result) {
  _$jscoverage['/video.js'].branchData['74'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['73'][1].init(56, 47, 'c.getAttribute("name").toLowerCase() == "movie"');
function visit14_73_1(result) {
  _$jscoverage['/video.js'].branchData['73'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['72'][2].init(86, 21, 'c.nodeName == \'param\'');
function visit13_72_2(result) {
  _$jscoverage['/video.js'].branchData['72'][2].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['72'][1].init(86, 104, 'c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie"');
function visit12_72_1(result) {
  _$jscoverage['/video.js'].branchData['72'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['70'][1].init(1021, 21, 'i < childNodes.length');
function visit11_70_1(result) {
  _$jscoverage['/video.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['62'][1].init(217, 48, 'getProvider(childNodes[i].getAttribute('src'))');
function visit10_62_1(result) {
  _$jscoverage['/video.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['59'][1].init(41, 41, '!flashUtils.isFlashEmbed(childNodes[i])');
function visit9_59_1(result) {
  _$jscoverage['/video.js'].branchData['59'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['58'][1].init(37, 35, 'childNodes[i].nodeName == \'embed\'');
function visit8_58_1(result) {
  _$jscoverage['/video.js'].branchData['58'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['57'][1].init(100, 21, 'i < childNodes.length');
function visit7_57_1(result) {
  _$jscoverage['/video.js'].branchData['57'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['54'][1].init(164, 8, '!classId');
function visit6_54_1(result) {
  _$jscoverage['/video.js'].branchData['54'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['49'][1].init(784, 2251, 'dataFilter && dataFilter.addRules({\n  tags: {\n  \'object\': function(element) {\n  var classId = element.getAttribute('classid'), i;\n  var childNodes = element.childNodes;\n  if (!classId) {\n    for (i = 0; i < childNodes.length; i++) {\n      if (childNodes[i].nodeName == \'embed\') {\n        if (!flashUtils.isFlashEmbed(childNodes[i])) {\n          return null;\n        }\n        if (getProvider(childNodes[i].getAttribute('src'))) {\n          return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);\n        }\n      }\n    }\n    return null;\n  }\n  for (i = 0; i < childNodes.length; i++) {\n    var c = childNodes[i];\n    if (c.nodeName == \'param\' && c.getAttribute("name").toLowerCase() == "movie") {\n      if (getProvider(c.getAttribute('value') || c.getAttribute("VALUE"))) {\n        return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);\n      }\n    }\n  }\n}, \n  \'embed\': function(element) {\n  if (!flashUtils.isFlashEmbed(element)) {\n    return null;\n  }\n  if (getProvider(element.getAttribute('src'))) {\n    return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);\n  }\n}}}, 4)');
function visit5_49_1(result) {
  _$jscoverage['/video.js'].branchData['49'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['43'][1].init(613, 21, 'videoCfg[\'providers\']');
function visit4_43_1(result) {
  _$jscoverage['/video.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['34'][1].init(66, 18, 'p[\'reg\'].test(url)');
function visit3_34_1(result) {
  _$jscoverage['/video.js'].branchData['34'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['31'][1].init(36, 19, 'i < provider.length');
function visit2_31_1(result) {
  _$jscoverage['/video.js'].branchData['31'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].branchData['25'][1].init(74, 41, 'dataProcessor && dataProcessor.dataFilter');
function visit1_25_1(result) {
  _$jscoverage['/video.js'].branchData['25'][1].ranCondition(result);
  return result;
}_$jscoverage['/video.js'].lineData[6]++;
KISSY.add(function(S, require) {
  _$jscoverage['/video.js'].functionData[0]++;
  _$jscoverage['/video.js'].lineData[7]++;
  var Editor = require('editor');
  _$jscoverage['/video.js'].lineData[8]++;
  var flashUtils = require('./flash-common/utils');
  _$jscoverage['/video.js'].lineData[9]++;
  var FlashBaseClass = require('./flash-common/base-class');
  _$jscoverage['/video.js'].lineData[10]++;
  var fakeObjects = require('./fake-objects');
  _$jscoverage['/video.js'].lineData[11]++;
  require('./button');
  _$jscoverage['/video.js'].lineData[12]++;
  var CLS_VIDEO = "ke_video", TYPE_VIDEO = "video";
  _$jscoverage['/video.js'].lineData[15]++;
  function video(config) {
    _$jscoverage['/video.js'].functionData[1]++;
    _$jscoverage['/video.js'].lineData[16]++;
    this.config = config;
  }
  _$jscoverage['/video.js'].lineData[19]++;
  S.augment(video, {
  pluginRenderUI: function(editor) {
  _$jscoverage['/video.js'].functionData[2]++;
  _$jscoverage['/video.js'].lineData[22]++;
  fakeObjects.init(editor);
  _$jscoverage['/video.js'].lineData[24]++;
  var dataProcessor = editor.htmlDataProcessor, dataFilter = visit1_25_1(dataProcessor && dataProcessor.dataFilter);
  _$jscoverage['/video.js'].lineData[27]++;
  var provider = [];
  _$jscoverage['/video.js'].lineData[29]++;
  function getProvider(url) {
    _$jscoverage['/video.js'].functionData[3]++;
    _$jscoverage['/video.js'].lineData[30]++;
    for (var i = 0; visit2_31_1(i < provider.length); i++) {
      _$jscoverage['/video.js'].lineData[33]++;
      var p = provider[i];
      _$jscoverage['/video.js'].lineData[34]++;
      if (visit3_34_1(p['reg'].test(url))) {
        _$jscoverage['/video.js'].lineData[35]++;
        return p;
      }
    }
    _$jscoverage['/video.js'].lineData[38]++;
    return undefined;
  }
  _$jscoverage['/video.js'].lineData[41]++;
  var videoCfg = this.config;
  _$jscoverage['/video.js'].lineData[43]++;
  if (visit4_43_1(videoCfg['providers'])) {
    _$jscoverage['/video.js'].lineData[44]++;
    provider.push.apply(provider, videoCfg['providers']);
  }
  _$jscoverage['/video.js'].lineData[47]++;
  videoCfg.getProvider = getProvider;
  _$jscoverage['/video.js'].lineData[49]++;
  visit5_49_1(dataFilter && dataFilter.addRules({
  tags: {
  'object': function(element) {
  _$jscoverage['/video.js'].functionData[4]++;
  _$jscoverage['/video.js'].lineData[52]++;
  var classId = element.getAttribute('classid'), i;
  _$jscoverage['/video.js'].lineData[53]++;
  var childNodes = element.childNodes;
  _$jscoverage['/video.js'].lineData[54]++;
  if (visit6_54_1(!classId)) {
    _$jscoverage['/video.js'].lineData[57]++;
    for (i = 0; visit7_57_1(i < childNodes.length); i++) {
      _$jscoverage['/video.js'].lineData[58]++;
      if (visit8_58_1(childNodes[i].nodeName == 'embed')) {
        _$jscoverage['/video.js'].lineData[59]++;
        if (visit9_59_1(!flashUtils.isFlashEmbed(childNodes[i]))) {
          _$jscoverage['/video.js'].lineData[60]++;
          return null;
        }
        _$jscoverage['/video.js'].lineData[62]++;
        if (visit10_62_1(getProvider(childNodes[i].getAttribute('src')))) {
          _$jscoverage['/video.js'].lineData[63]++;
          return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
        }
      }
    }
    _$jscoverage['/video.js'].lineData[68]++;
    return null;
  }
  _$jscoverage['/video.js'].lineData[70]++;
  for (i = 0; visit11_70_1(i < childNodes.length); i++) {
    _$jscoverage['/video.js'].lineData[71]++;
    var c = childNodes[i];
    _$jscoverage['/video.js'].lineData[72]++;
    if (visit12_72_1(visit13_72_2(c.nodeName == 'param') && visit14_73_1(c.getAttribute("name").toLowerCase() == "movie"))) {
      _$jscoverage['/video.js'].lineData[74]++;
      if (visit15_74_1(getProvider(visit16_74_2(c.getAttribute('value') || c.getAttribute("VALUE"))))) {
        _$jscoverage['/video.js'].lineData[76]++;
        return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
      }
    }
  }
}, 
  'embed': function(element) {
  _$jscoverage['/video.js'].functionData[5]++;
  _$jscoverage['/video.js'].lineData[85]++;
  if (visit17_85_1(!flashUtils.isFlashEmbed(element))) {
    _$jscoverage['/video.js'].lineData[86]++;
    return null;
  }
  _$jscoverage['/video.js'].lineData[87]++;
  if (visit18_87_1(getProvider(element.getAttribute('src')))) {
    _$jscoverage['/video.js'].lineData[88]++;
    return dataProcessor.createFakeParserElement(element, CLS_VIDEO, TYPE_VIDEO, true);
  }
}}}, 4));
  _$jscoverage['/video.js'].lineData[97]++;
  var flashControl = new FlashBaseClass({
  editor: editor, 
  cls: CLS_VIDEO, 
  type: TYPE_VIDEO, 
  pluginConfig: this.config, 
  bubbleId: "video", 
  contextMenuId: "video", 
  contextMenuHandlers: {
  "\u89c6\u9891\u5c5e\u6027": function() {
  _$jscoverage['/video.js'].functionData[6]++;
  _$jscoverage['/video.js'].lineData[106]++;
  var selectedEl = this.get('editorSelectedEl');
  _$jscoverage['/video.js'].lineData[107]++;
  if (visit19_107_1(selectedEl)) {
    _$jscoverage['/video.js'].lineData[108]++;
    flashControl.show(selectedEl);
  }
}}});
  _$jscoverage['/video.js'].lineData[114]++;
  editor.addButton("video", {
  tooltip: "\u63d2\u5165\u89c6\u9891", 
  listeners: {
  click: function() {
  _$jscoverage['/video.js'].functionData[7]++;
  _$jscoverage['/video.js'].lineData[118]++;
  flashControl.show();
}}, 
  mode: Editor.Mode.WYSIWYG_MODE});
}});
  _$jscoverage['/video.js'].lineData[127]++;
  return video;
});
