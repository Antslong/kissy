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
            + ',"src":' + jscoverage_quote(this.src)
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
if (! _$jscoverage['/loader/combo-loader.js']) {
  _$jscoverage['/loader/combo-loader.js'] = {};
  _$jscoverage['/loader/combo-loader.js'].lineData = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[29] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[30] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[31] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[33] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[36] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[37] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[41] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[42] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[43] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[44] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[46] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[47] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[48] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[49] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[54] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[58] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[59] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[70] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[79] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[80] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[86] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[87] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[88] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[90] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[92] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[93] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[94] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[95] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[96] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[100] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[101] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[104] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[107] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[109] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[110] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[111] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[112] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[118] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[119] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[120] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[121] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[122] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[124] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[126] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[127] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[128] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[131] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[138] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[139] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[140] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[142] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[144] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[145] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[151] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[152] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[158] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[159] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[160] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[161] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[162] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[165] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[166] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[173] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[174] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[175] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[177] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[180] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[181] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[182] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[183] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[184] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[185] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[188] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[189] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[194] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[195] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[196] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[197] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[198] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[199] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[200] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[203] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[206] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[211] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[217] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[219] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[221] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[224] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[225] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[226] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[227] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[230] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[231] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[232] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[234] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[238] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[239] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[240] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[243] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[244] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[246] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[253] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[254] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[255] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[256] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[259] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[260] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[263] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[264] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[267] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[268] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[271] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[282] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[290] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[293] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[295] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[296] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[297] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[298] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[300] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[301] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[302] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[303] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[304] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[306] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[307] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[308] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[309] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[310] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[313] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[314] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[316] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[318] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[321] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[324] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[331] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[340] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[341] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[342] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[343] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[344] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[345] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[346] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[347] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[348] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[349] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[350] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[351] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[353] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[355] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[358] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[360] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[361] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[362] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[363] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[366] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[367] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[370] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[373] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[376] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[377] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[378] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[379] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[380] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[382] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[383] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[386] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[389] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[396] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[403] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[405] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[407] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[410] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[411] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[412] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[413] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[414] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[415] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[416] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[417] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[419] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[426] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[427] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[428] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[431] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[433] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[440] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[441] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[442] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[443] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[444] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[445] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[450] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[453] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[454] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[455] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[457] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[459] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[460] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[461] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[462] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[463] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[464] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[467] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[468] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[472] = 0;
  _$jscoverage['/loader/combo-loader.js'].lineData[476] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].functionData) {
  _$jscoverage['/loader/combo-loader.js'].functionData = [];
  _$jscoverage['/loader/combo-loader.js'].functionData[0] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[1] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[2] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[3] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[4] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[5] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[6] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[7] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[8] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[9] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[10] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[11] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[12] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[13] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[14] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[15] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[16] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[17] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[18] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[19] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[20] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[21] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[22] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[23] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[24] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[25] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[26] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[27] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[28] = 0;
  _$jscoverage['/loader/combo-loader.js'].functionData[29] = 0;
}
if (! _$jscoverage['/loader/combo-loader.js'].branchData) {
  _$jscoverage['/loader/combo-loader.js'].branchData = {};
  _$jscoverage['/loader/combo-loader.js'].branchData['8'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['11'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['16'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['27'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['41'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['43'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['46'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['46'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['92'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['92'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['92'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['94'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['94'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['95'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['95'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['100'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['109'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['109'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['109'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['118'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['118'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['118'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['118'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['122'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['122'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['138'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['138'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['158'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['158'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['160'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['160'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['165'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['165'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['184'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['184'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['188'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['188'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['198'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['198'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['199'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['199'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['226'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['226'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['255'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['255'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['263'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['263'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['290'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['290'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['293'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['293'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['295'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['295'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['297'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['297'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['303'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['303'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['306'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['306'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['307'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['307'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['308'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['340'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['355'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['355'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['355'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['362'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['362'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['376'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['376'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['377'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['377'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['382'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][3] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][4] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['417'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['417'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['440'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['440'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['444'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['444'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['457'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['457'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['457'][2] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['458'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['458'][1] = new BranchData();
  _$jscoverage['/loader/combo-loader.js'].branchData['467'] = [];
  _$jscoverage['/loader/combo-loader.js'].branchData['467'][1] = new BranchData();
}
_$jscoverage['/loader/combo-loader.js'].branchData['467'][1].init(2583, 23, 'currentComboUrls.length');
function visit357_467_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['467'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['458'][1].init(68, 72, 'l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength');
function visit356_458_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['458'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['457'][2].init(778, 36, 'currentComboUrls.length > maxFileNum');
function visit355_457_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['457'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['457'][1].init(778, 142, 'currentComboUrls.length > maxFileNum || (l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)');
function visit354_457_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['457'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['444'][1].init(195, 25, '!currentMod.canBeCombined');
function visit353_444_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['444'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['440'][1].init(1281, 15, 'i < mods.length');
function visit352_440_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['440'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['417'][1].init(226, 15, 'tags.length > 1');
function visit351_417_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['417'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['382'][4].init(53, 20, 'mods.tags[0] === tag');
function visit350_382_4(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][4].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['382'][3].init(27, 22, 'mods.tags.length === 1');
function visit349_382_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['382'][2].init(27, 46, 'mods.tags.length === 1 && mods.tags[0] === tag');
function visit348_382_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['382'][1].init(25, 49, '!(mods.tags.length === 1 && mods.tags[0] === tag)');
function visit347_382_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['382'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['377'][1].init(1790, 32, '!(mods = typedCombos[comboName])');
function visit346_377_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['377'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['376'][1].init(1747, 21, 'comboMods[type] || {}');
function visit345_376_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['376'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['362'][1].init(29, 41, 'groupPrefixUri.isSameOriginAs(packageUri)');
function visit344_362_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['362'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['355'][2].init(744, 82, 'packageInfo.isCombine() && S.startsWith(fullpath, packagePath)');
function visit343_355_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['355'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['355'][1].init(724, 112, '(mod.canBeCombined = packageInfo.isCombine() && S.startsWith(fullpath, packagePath)) && group');
function visit342_355_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['355'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['340'][1].init(338, 5, 'i < l');
function visit341_340_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['340'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['308'][1].init(29, 21, 'modStatus !== LOADING');
function visit340_308_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['307'][1].init(25, 27, '!waitingModules.contains(m)');
function visit339_307_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['307'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['306'][1].init(362, 20, 'modStatus !== LOADED');
function visit338_306_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['306'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['303'][1].init(262, 28, 'modStatus >= READY_TO_ATTACH');
function visit337_303_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['303'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['297'][1].init(54, 8, 'cache[m]');
function visit336_297_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['297'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['295'][1].init(369, 19, 'i < modNames.length');
function visit335_295_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['295'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['293'][1].init(331, 11, 'cache || {}');
function visit334_293_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['293'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['290'][1].init(229, 9, 'ret || {}');
function visit333_290_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['290'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['263'][1].init(150, 12, '!mod.factory');
function visit332_263_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['263'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['255'][1].init(25, 9, '\'@DEBUG@\'');
function visit331_255_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['255'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['226'][1].init(25, 9, '\'@DEBUG@\'');
function visit330_226_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['226'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['199'][1].init(17, 19, 'str1[i] !== str2[i]');
function visit329_199_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['199'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['198'][1].init(143, 5, 'i < l');
function visit328_198_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['198'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['188'][1].init(199, 9, 'ms.length');
function visit327_188_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['188'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['184'][1].init(21, 19, 'm.status === LOADED');
function visit326_184_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['184'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['165'][1].init(373, 2, 're');
function visit325_165_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['165'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['160'][1].init(50, 35, 'script.readyState === \'interactive\'');
function visit324_160_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['160'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['158'][1].init(182, 6, 'i >= 0');
function visit323_158_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['158'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['138'][1].init(74, 5, 'oldIE');
function visit322_138_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['138'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['122'][1].init(132, 5, 'oldIE');
function visit321_122_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['122'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['118'][3].init(391, 13, 'argsLen === 1');
function visit320_118_3(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['118'][3].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['118'][2].init(361, 26, 'typeof name === \'function\'');
function visit319_118_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['118'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['118'][1].init(361, 43, 'typeof name === \'function\' || argsLen === 1');
function visit318_118_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['118'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['109'][2].init(57, 13, 'argsLen === 3');
function visit317_109_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['109'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['109'][1].init(57, 35, 'argsLen === 3 && S.isArray(factory)');
function visit316_109_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['109'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['100'][2].init(80, 30, 'config.requires && !config.cjs');
function visit315_100_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['100'][1].init(70, 40, 'config && config.requires && !config.cjs');
function visit314_100_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['95'][1].init(26, 12, 'config || {}');
function visit313_95_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['95'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['94'][1].init(78, 15, 'requires.length');
function visit312_94_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['94'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['92'][2].init(67, 29, 'typeof factory === \'function\'');
function visit311_92_2(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['92'][2].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['92'][1].init(56, 40, '!config && typeof factory === \'function\'');
function visit310_92_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['92'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['46'][1].init(163, 5, 'oldIE');
function visit309_46_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['46'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['43'][1].init(55, 23, 'mod.getType() === \'css\'');
function visit308_43_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['43'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['41'][1].init(816, 11, '!rs.combine');
function visit307_41_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['41'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['27'][1].init(67, 17, 'mod && currentMod');
function visit306_27_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['27'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['16'][1].init(17, 10, '!(--count)');
function visit305_16_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['16'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['11'][1].init(21, 17, 'rss && rss.length');
function visit304_11_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['11'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].branchData['8'][1].init(43, 16, 'S.UA.ieMode < 10');
function visit303_8_1(result) {
  _$jscoverage['/loader/combo-loader.js'].branchData['8'][1].ranCondition(result);
  return result;
}_$jscoverage['/loader/combo-loader.js'].lineData[6]++;
(function(S, undefined) {
  _$jscoverage['/loader/combo-loader.js'].functionData[0]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[8]++;
  var oldIE = visit303_8_1(S.UA.ieMode < 10);
  _$jscoverage['/loader/combo-loader.js'].lineData[10]++;
  function loadScripts(runtime, rss, callback, charset, timeout) {
    _$jscoverage['/loader/combo-loader.js'].functionData[1]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[11]++;
    var count = visit304_11_1(rss && rss.length), errorList = [], successList = [];
    _$jscoverage['/loader/combo-loader.js'].lineData[15]++;
    function complete() {
      _$jscoverage['/loader/combo-loader.js'].functionData[2]++;
      _$jscoverage['/loader/combo-loader.js'].lineData[16]++;
      if (visit305_16_1(!(--count))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[17]++;
        callback(successList, errorList);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[21]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[3]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[22]++;
  var mod;
  _$jscoverage['/loader/combo-loader.js'].lineData[23]++;
  var config = {
  timeout: timeout, 
  success: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[4]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[26]++;
  successList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[27]++;
  if (visit306_27_1(mod && currentMod)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[29]++;
    logger.debug('standard browser get mod name after load : ' + mod.name);
    _$jscoverage['/loader/combo-loader.js'].lineData[30]++;
    Utils.registerModule(runtime, mod.name, currentMod.factory, currentMod.config);
    _$jscoverage['/loader/combo-loader.js'].lineData[31]++;
    currentMod = undefined;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[33]++;
  complete();
}, 
  error: function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[5]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[36]++;
  errorList.push(rs);
  _$jscoverage['/loader/combo-loader.js'].lineData[37]++;
  complete();
}, 
  charset: charset};
  _$jscoverage['/loader/combo-loader.js'].lineData[41]++;
  if (visit307_41_1(!rs.combine)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[42]++;
    mod = rs.mods[0];
    _$jscoverage['/loader/combo-loader.js'].lineData[43]++;
    if (visit308_43_1(mod.getType() === 'css')) {
      _$jscoverage['/loader/combo-loader.js'].lineData[44]++;
      mod = undefined;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[46]++;
      if (visit309_46_1(oldIE)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[47]++;
        startLoadModName = mod.name;
        _$jscoverage['/loader/combo-loader.js'].lineData[48]++;
        startLoadModTime = S.now();
        _$jscoverage['/loader/combo-loader.js'].lineData[49]++;
        config.attrs = {
  'data-mod-name': mod.name};
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[54]++;
  S.Config.loadModsFn(rs, config);
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[58]++;
  var logger = S.getLogger('s/loader');
  _$jscoverage['/loader/combo-loader.js'].lineData[59]++;
  var Loader = S.Loader, Status = Loader.Status, Utils = Loader.Utils, getHash = Utils.getHash, LOADING = Status.LOADING, LOADED = Status.LOADED, READY_TO_ATTACH = Status.READY_TO_ATTACH, ERROR = Status.ERROR, groupTag = S.now();
  _$jscoverage['/loader/combo-loader.js'].lineData[70]++;
  ComboLoader.groupTag = groupTag;
  _$jscoverage['/loader/combo-loader.js'].lineData[79]++;
  function ComboLoader(runtime, waitingModules) {
    _$jscoverage['/loader/combo-loader.js'].functionData[6]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[80]++;
    S.mix(this, {
  runtime: runtime, 
  waitingModules: waitingModules});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[86]++;
  var currentMod;
  _$jscoverage['/loader/combo-loader.js'].lineData[87]++;
  var startLoadModName;
  _$jscoverage['/loader/combo-loader.js'].lineData[88]++;
  var startLoadModTime;
  _$jscoverage['/loader/combo-loader.js'].lineData[90]++;
  function checkKISSYRequire(config, factory) {
    _$jscoverage['/loader/combo-loader.js'].functionData[7]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[92]++;
    if (visit310_92_1(!config && visit311_92_2(typeof factory === 'function'))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[93]++;
      var requires = Utils.getRequiresFromFn(factory);
      _$jscoverage['/loader/combo-loader.js'].lineData[94]++;
      if (visit312_94_1(requires.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[95]++;
        config = visit313_95_1(config || {});
        _$jscoverage['/loader/combo-loader.js'].lineData[96]++;
        config.requires = requires;
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[100]++;
      if (visit314_100_1(config && visit315_100_2(config.requires && !config.cjs))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[101]++;
        config.cjs = 0;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[104]++;
    return config;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[107]++;
  ComboLoader.add = function(name, factory, config, runtime, argsLen) {
  _$jscoverage['/loader/combo-loader.js'].functionData[8]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[109]++;
  if (visit316_109_1(visit317_109_2(argsLen === 3) && S.isArray(factory))) {
    _$jscoverage['/loader/combo-loader.js'].lineData[110]++;
    var tmp = factory;
    _$jscoverage['/loader/combo-loader.js'].lineData[111]++;
    factory = config;
    _$jscoverage['/loader/combo-loader.js'].lineData[112]++;
    config = {
  requires: tmp, 
  cjs: 1};
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[118]++;
  if (visit318_118_1(visit319_118_2(typeof name === 'function') || visit320_118_3(argsLen === 1))) {
    _$jscoverage['/loader/combo-loader.js'].lineData[119]++;
    config = factory;
    _$jscoverage['/loader/combo-loader.js'].lineData[120]++;
    factory = name;
    _$jscoverage['/loader/combo-loader.js'].lineData[121]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/loader/combo-loader.js'].lineData[122]++;
    if (visit321_122_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[124]++;
      name = findModuleNameByInteractive();
      _$jscoverage['/loader/combo-loader.js'].lineData[126]++;
      Utils.registerModule(runtime, name, factory, config);
      _$jscoverage['/loader/combo-loader.js'].lineData[127]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[128]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[131]++;
      currentMod = {
  factory: factory, 
  config: config};
    }
  } else {
    _$jscoverage['/loader/combo-loader.js'].lineData[138]++;
    if (visit322_138_1(oldIE)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[139]++;
      startLoadModName = null;
      _$jscoverage['/loader/combo-loader.js'].lineData[140]++;
      startLoadModTime = 0;
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[142]++;
      currentMod = undefined;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[144]++;
    config = checkKISSYRequire(config, factory);
    _$jscoverage['/loader/combo-loader.js'].lineData[145]++;
    Utils.registerModule(runtime, name, factory, config);
  }
};
  _$jscoverage['/loader/combo-loader.js'].lineData[151]++;
  function findModuleNameByInteractive() {
    _$jscoverage['/loader/combo-loader.js'].functionData[9]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[152]++;
    var scripts = S.Env.host.document.getElementsByTagName('script'), re, i, name, script;
    _$jscoverage['/loader/combo-loader.js'].lineData[158]++;
    for (i = scripts.length - 1; visit323_158_1(i >= 0); i--) {
      _$jscoverage['/loader/combo-loader.js'].lineData[159]++;
      script = scripts[i];
      _$jscoverage['/loader/combo-loader.js'].lineData[160]++;
      if (visit324_160_1(script.readyState === 'interactive')) {
        _$jscoverage['/loader/combo-loader.js'].lineData[161]++;
        re = script;
        _$jscoverage['/loader/combo-loader.js'].lineData[162]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[165]++;
    if (visit325_165_1(re)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[166]++;
      name = re.getAttribute('data-mod-name');
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[173]++;
      logger.debug('can not find interactive script,time diff : ' + (S.now() - startLoadModTime));
      _$jscoverage['/loader/combo-loader.js'].lineData[174]++;
      logger.debug('old_ie get mod name from cache : ' + startLoadModName);
      _$jscoverage['/loader/combo-loader.js'].lineData[175]++;
      name = startLoadModName;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[177]++;
    return name;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[180]++;
  function debugRemoteModules(rss) {
    _$jscoverage['/loader/combo-loader.js'].functionData[10]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[181]++;
    S.each(rss, function(rs) {
  _$jscoverage['/loader/combo-loader.js'].functionData[11]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[182]++;
  var ms = [];
  _$jscoverage['/loader/combo-loader.js'].lineData[183]++;
  S.each(rs.mods, function(m) {
  _$jscoverage['/loader/combo-loader.js'].functionData[12]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[184]++;
  if (visit326_184_1(m.status === LOADED)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[185]++;
    ms.push(m.name);
  }
});
  _$jscoverage['/loader/combo-loader.js'].lineData[188]++;
  if (visit327_188_1(ms.length)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[189]++;
    logger.info('load remote modules: "' + ms.join(', ') + '" from: "' + rs.fullpath + '"');
  }
});
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[194]++;
  function getCommonPrefix(str1, str2) {
    _$jscoverage['/loader/combo-loader.js'].functionData[13]++;
    _$jscoverage['/loader/combo-loader.js'].lineData[195]++;
    str1 = str1.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[196]++;
    str2 = str2.split(/\//);
    _$jscoverage['/loader/combo-loader.js'].lineData[197]++;
    var l = Math.min(str1.length, str2.length);
    _$jscoverage['/loader/combo-loader.js'].lineData[198]++;
    for (var i = 0; visit328_198_1(i < l); i++) {
      _$jscoverage['/loader/combo-loader.js'].lineData[199]++;
      if (visit329_199_1(str1[i] !== str2[i])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[200]++;
        break;
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[203]++;
    return str1.slice(0, i).join('/') + '/';
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[206]++;
  S.augment(ComboLoader, {
  use: function(normalizedModNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[14]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[211]++;
  var self = this, allModNames, comboUrls, timeout = S.Config.timeout, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[217]++;
  allModNames = S.keys(self.calculate(normalizedModNames));
  _$jscoverage['/loader/combo-loader.js'].lineData[219]++;
  Utils.createModulesInfo(runtime, allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[221]++;
  comboUrls = self.getComboUrls(allModNames);
  _$jscoverage['/loader/combo-loader.js'].lineData[224]++;
  S.each(comboUrls.css, function(cssOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[15]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[225]++;
  loadScripts(runtime, cssOne, function(success, error) {
  _$jscoverage['/loader/combo-loader.js'].functionData[16]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[226]++;
  if (visit330_226_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[227]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[230]++;
  S.each(success, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[17]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[231]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[18]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[232]++;
  Utils.registerModule(runtime, mod.name, S.noop);
  _$jscoverage['/loader/combo-loader.js'].lineData[234]++;
  mod.notifyAll();
});
});
  _$jscoverage['/loader/combo-loader.js'].lineData[238]++;
  S.each(error, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[19]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[239]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[20]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[240]++;
  var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[243]++;
  S.log(msg, 'error');
  _$jscoverage['/loader/combo-loader.js'].lineData[244]++;
  mod.status = ERROR;
  _$jscoverage['/loader/combo-loader.js'].lineData[246]++;
  mod.notifyAll();
});
});
}, cssOne.charset, timeout);
});
  _$jscoverage['/loader/combo-loader.js'].lineData[253]++;
  S.each(comboUrls.js, function(jsOne) {
  _$jscoverage['/loader/combo-loader.js'].functionData[21]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[254]++;
  loadScripts(runtime, jsOne, function(success) {
  _$jscoverage['/loader/combo-loader.js'].functionData[22]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[255]++;
  if (visit331_255_1('@DEBUG@')) {
    _$jscoverage['/loader/combo-loader.js'].lineData[256]++;
    debugRemoteModules(success);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[259]++;
  S.each(jsOne, function(one) {
  _$jscoverage['/loader/combo-loader.js'].functionData[23]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[260]++;
  S.each(one.mods, function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[24]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[263]++;
  if (visit332_263_1(!mod.factory)) {
    _$jscoverage['/loader/combo-loader.js'].lineData[264]++;
    var msg = mod.name + ' is not loaded! can not find module in path : ' + one.fullpath;
    _$jscoverage['/loader/combo-loader.js'].lineData[267]++;
    S.log(msg, 'error');
    _$jscoverage['/loader/combo-loader.js'].lineData[268]++;
    mod.status = ERROR;
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[271]++;
  mod.notifyAll();
});
});
}, jsOne.charset, timeout);
});
}, 
  calculate: function(modNames, cache, ret) {
  _$jscoverage['/loader/combo-loader.js'].functionData[25]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[282]++;
  var i, m, mod, modStatus, self = this, waitingModules = self.waitingModules, runtime = self.runtime;
  _$jscoverage['/loader/combo-loader.js'].lineData[290]++;
  ret = visit333_290_1(ret || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[293]++;
  cache = visit334_293_1(cache || {});
  _$jscoverage['/loader/combo-loader.js'].lineData[295]++;
  for (i = 0; visit335_295_1(i < modNames.length); i++) {
    _$jscoverage['/loader/combo-loader.js'].lineData[296]++;
    m = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[297]++;
    if (visit336_297_1(cache[m])) {
      _$jscoverage['/loader/combo-loader.js'].lineData[298]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[300]++;
    cache[m] = 1;
    _$jscoverage['/loader/combo-loader.js'].lineData[301]++;
    mod = Utils.createModuleInfo(runtime, m);
    _$jscoverage['/loader/combo-loader.js'].lineData[302]++;
    modStatus = mod.status;
    _$jscoverage['/loader/combo-loader.js'].lineData[303]++;
    if (visit337_303_1(modStatus >= READY_TO_ATTACH)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[304]++;
      continue;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[306]++;
    if (visit338_306_1(modStatus !== LOADED)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[307]++;
      if (visit339_307_1(!waitingModules.contains(m))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[308]++;
        if (visit340_308_1(modStatus !== LOADING)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[309]++;
          mod.status = LOADING;
          _$jscoverage['/loader/combo-loader.js'].lineData[310]++;
          ret[m] = 1;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[313]++;
        mod.wait(function(mod) {
  _$jscoverage['/loader/combo-loader.js'].functionData[26]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[314]++;
  waitingModules.remove(mod.name);
  _$jscoverage['/loader/combo-loader.js'].lineData[316]++;
  waitingModules.notifyAll();
});
        _$jscoverage['/loader/combo-loader.js'].lineData[318]++;
        waitingModules.add(m);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[321]++;
    self.calculate(mod.getNormalizedRequires(), cache, ret);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[324]++;
  return ret;
}, 
  getComboMods: function(modNames, comboPrefixes) {
  _$jscoverage['/loader/combo-loader.js'].functionData[27]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[331]++;
  var comboMods = {}, packageUri, runtime = this.runtime, i = 0, l = modNames.length, modName, mod, packageInfo, type, typedCombos, mods, tag, charset, packagePath, packageName, group, fullpath;
  _$jscoverage['/loader/combo-loader.js'].lineData[340]++;
  for (; visit341_340_1(i < l); ++i) {
    _$jscoverage['/loader/combo-loader.js'].lineData[341]++;
    modName = modNames[i];
    _$jscoverage['/loader/combo-loader.js'].lineData[342]++;
    mod = Utils.createModuleInfo(runtime, modName);
    _$jscoverage['/loader/combo-loader.js'].lineData[343]++;
    type = mod.getType();
    _$jscoverage['/loader/combo-loader.js'].lineData[344]++;
    fullpath = mod.getFullPath();
    _$jscoverage['/loader/combo-loader.js'].lineData[345]++;
    packageInfo = mod.getPackage();
    _$jscoverage['/loader/combo-loader.js'].lineData[346]++;
    packageName = packageInfo.name;
    _$jscoverage['/loader/combo-loader.js'].lineData[347]++;
    charset = packageInfo.getCharset();
    _$jscoverage['/loader/combo-loader.js'].lineData[348]++;
    tag = packageInfo.getTag();
    _$jscoverage['/loader/combo-loader.js'].lineData[349]++;
    group = packageInfo.getGroup();
    _$jscoverage['/loader/combo-loader.js'].lineData[350]++;
    packagePath = packageInfo.getPrefixUriForCombo();
    _$jscoverage['/loader/combo-loader.js'].lineData[351]++;
    packageUri = packageInfo.getPackageUri();
    _$jscoverage['/loader/combo-loader.js'].lineData[353]++;
    var comboName = packageName;
    _$jscoverage['/loader/combo-loader.js'].lineData[355]++;
    if (visit342_355_1((mod.canBeCombined = visit343_355_2(packageInfo.isCombine() && S.startsWith(fullpath, packagePath))) && group)) {
      _$jscoverage['/loader/combo-loader.js'].lineData[358]++;
      comboName = group + '_' + charset + '_' + groupTag;
      _$jscoverage['/loader/combo-loader.js'].lineData[360]++;
      var groupPrefixUri;
      _$jscoverage['/loader/combo-loader.js'].lineData[361]++;
      if ((groupPrefixUri = comboPrefixes[comboName])) {
        _$jscoverage['/loader/combo-loader.js'].lineData[362]++;
        if (visit344_362_1(groupPrefixUri.isSameOriginAs(packageUri))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[363]++;
          groupPrefixUri.setPath(getCommonPrefix(groupPrefixUri.getPath(), packageUri.getPath()));
        } else {
          _$jscoverage['/loader/combo-loader.js'].lineData[366]++;
          comboName = packageName;
          _$jscoverage['/loader/combo-loader.js'].lineData[367]++;
          comboPrefixes[packageName] = packageUri;
        }
      } else {
        _$jscoverage['/loader/combo-loader.js'].lineData[370]++;
        comboPrefixes[comboName] = packageUri.clone();
      }
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[373]++;
      comboPrefixes[packageName] = packageUri;
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[376]++;
    typedCombos = comboMods[type] = visit345_376_1(comboMods[type] || {});
    _$jscoverage['/loader/combo-loader.js'].lineData[377]++;
    if (visit346_377_1(!(mods = typedCombos[comboName]))) {
      _$jscoverage['/loader/combo-loader.js'].lineData[378]++;
      mods = typedCombos[comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[379]++;
      mods.charset = charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[380]++;
      mods.tags = [tag];
    } else {
      _$jscoverage['/loader/combo-loader.js'].lineData[382]++;
      if (visit347_382_1(!(visit348_382_2(visit349_382_3(mods.tags.length === 1) && visit350_382_4(mods.tags[0] === tag))))) {
        _$jscoverage['/loader/combo-loader.js'].lineData[383]++;
        mods.tags.push(tag);
      }
    }
    _$jscoverage['/loader/combo-loader.js'].lineData[386]++;
    mods.push(mod);
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[389]++;
  return comboMods;
}, 
  getComboUrls: function(modNames) {
  _$jscoverage['/loader/combo-loader.js'].functionData[28]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[396]++;
  var runtime = this.runtime, Config = runtime.Config, comboPrefix = Config.comboPrefix, comboSep = Config.comboSep, maxFileNum = Config.comboMaxFileNum, maxUrlLength = Config.comboMaxUrlLength;
  _$jscoverage['/loader/combo-loader.js'].lineData[403]++;
  var comboPrefixes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[405]++;
  var comboMods = this.getComboMods(modNames, comboPrefixes);
  _$jscoverage['/loader/combo-loader.js'].lineData[407]++;
  var comboRes = {};
  _$jscoverage['/loader/combo-loader.js'].lineData[410]++;
  for (var type in comboMods) {
    _$jscoverage['/loader/combo-loader.js'].lineData[411]++;
    comboRes[type] = {};
    _$jscoverage['/loader/combo-loader.js'].lineData[412]++;
    for (var comboName in comboMods[type]) {
      _$jscoverage['/loader/combo-loader.js'].lineData[413]++;
      var currentComboUrls = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[414]++;
      var currentComboMods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[415]++;
      var mods = comboMods[type][comboName];
      _$jscoverage['/loader/combo-loader.js'].lineData[416]++;
      var tags = mods.tags;
      _$jscoverage['/loader/combo-loader.js'].lineData[417]++;
      var tag = visit351_417_1(tags.length > 1) ? getHash(tags.join('')) : tags[0];
      _$jscoverage['/loader/combo-loader.js'].lineData[419]++;
      var suffix = (tag ? '?t=' + encodeURIComponent(tag) + '.' + type : ''), suffixLength = suffix.length, basePrefix = comboPrefixes[comboName].toString(), baseLen = basePrefix.length, prefix = basePrefix + comboPrefix, res = comboRes[type][comboName] = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[426]++;
      var l = prefix.length;
      _$jscoverage['/loader/combo-loader.js'].lineData[427]++;
      res.charset = mods.charset;
      _$jscoverage['/loader/combo-loader.js'].lineData[428]++;
      res.mods = [];
      _$jscoverage['/loader/combo-loader.js'].lineData[431]++;
      var pushComboUrl = function() {
  _$jscoverage['/loader/combo-loader.js'].functionData[29]++;
  _$jscoverage['/loader/combo-loader.js'].lineData[433]++;
  res.push({
  combine: 1, 
  fullpath: prefix + currentComboUrls.join(comboSep) + suffix, 
  mods: currentComboMods});
};
      _$jscoverage['/loader/combo-loader.js'].lineData[440]++;
      for (var i = 0; visit352_440_1(i < mods.length); i++) {
        _$jscoverage['/loader/combo-loader.js'].lineData[441]++;
        var currentMod = mods[i];
        _$jscoverage['/loader/combo-loader.js'].lineData[442]++;
        res.mods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[443]++;
        var fullpath = currentMod.getFullPath();
        _$jscoverage['/loader/combo-loader.js'].lineData[444]++;
        if (visit353_444_1(!currentMod.canBeCombined)) {
          _$jscoverage['/loader/combo-loader.js'].lineData[445]++;
          res.push({
  combine: 0, 
  fullpath: fullpath, 
  mods: [currentMod]});
          _$jscoverage['/loader/combo-loader.js'].lineData[450]++;
          continue;
        }
        _$jscoverage['/loader/combo-loader.js'].lineData[453]++;
        var path = fullpath.slice(baseLen).replace(/\?.*$/, '');
        _$jscoverage['/loader/combo-loader.js'].lineData[454]++;
        currentComboUrls.push(path);
        _$jscoverage['/loader/combo-loader.js'].lineData[455]++;
        currentComboMods.push(currentMod);
        _$jscoverage['/loader/combo-loader.js'].lineData[457]++;
        if (visit354_457_1(visit355_457_2(currentComboUrls.length > maxFileNum) || (visit356_458_1(l + currentComboUrls.join(comboSep).length + suffixLength > maxUrlLength)))) {
          _$jscoverage['/loader/combo-loader.js'].lineData[459]++;
          currentComboUrls.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[460]++;
          currentComboMods.pop();
          _$jscoverage['/loader/combo-loader.js'].lineData[461]++;
          pushComboUrl();
          _$jscoverage['/loader/combo-loader.js'].lineData[462]++;
          currentComboUrls = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[463]++;
          currentComboMods = [];
          _$jscoverage['/loader/combo-loader.js'].lineData[464]++;
          i--;
        }
      }
      _$jscoverage['/loader/combo-loader.js'].lineData[467]++;
      if (visit357_467_1(currentComboUrls.length)) {
        _$jscoverage['/loader/combo-loader.js'].lineData[468]++;
        pushComboUrl();
      }
    }
  }
  _$jscoverage['/loader/combo-loader.js'].lineData[472]++;
  return comboRes;
}});
  _$jscoverage['/loader/combo-loader.js'].lineData[476]++;
  Loader.ComboLoader = ComboLoader;
})(KISSY);
