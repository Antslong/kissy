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
if (! _$jscoverage['/editor.js']) {
  _$jscoverage['/editor.js'] = {};
  _$jscoverage['/editor.js'].lineData = [];
  _$jscoverage['/editor.js'].lineData[6] = 0;
  _$jscoverage['/editor.js'].lineData[7] = 0;
  _$jscoverage['/editor.js'].lineData[30] = 0;
  _$jscoverage['/editor.js'].lineData[35] = 0;
  _$jscoverage['/editor.js'].lineData[37] = 0;
  _$jscoverage['/editor.js'].lineData[39] = 0;
  _$jscoverage['/editor.js'].lineData[40] = 0;
  _$jscoverage['/editor.js'].lineData[41] = 0;
  _$jscoverage['/editor.js'].lineData[43] = 0;
  _$jscoverage['/editor.js'].lineData[48] = 0;
  _$jscoverage['/editor.js'].lineData[49] = 0;
  _$jscoverage['/editor.js'].lineData[50] = 0;
  _$jscoverage['/editor.js'].lineData[51] = 0;
  _$jscoverage['/editor.js'].lineData[52] = 0;
  _$jscoverage['/editor.js'].lineData[56] = 0;
  _$jscoverage['/editor.js'].lineData[61] = 0;
  _$jscoverage['/editor.js'].lineData[64] = 0;
  _$jscoverage['/editor.js'].lineData[67] = 0;
  _$jscoverage['/editor.js'].lineData[68] = 0;
  _$jscoverage['/editor.js'].lineData[70] = 0;
  _$jscoverage['/editor.js'].lineData[71] = 0;
  _$jscoverage['/editor.js'].lineData[75] = 0;
  _$jscoverage['/editor.js'].lineData[76] = 0;
  _$jscoverage['/editor.js'].lineData[80] = 0;
  _$jscoverage['/editor.js'].lineData[82] = 0;
  _$jscoverage['/editor.js'].lineData[83] = 0;
  _$jscoverage['/editor.js'].lineData[86] = 0;
  _$jscoverage['/editor.js'].lineData[87] = 0;
  _$jscoverage['/editor.js'].lineData[94] = 0;
  _$jscoverage['/editor.js'].lineData[98] = 0;
  _$jscoverage['/editor.js'].lineData[100] = 0;
  _$jscoverage['/editor.js'].lineData[102] = 0;
  _$jscoverage['/editor.js'].lineData[103] = 0;
  _$jscoverage['/editor.js'].lineData[107] = 0;
  _$jscoverage['/editor.js'].lineData[110] = 0;
  _$jscoverage['/editor.js'].lineData[111] = 0;
  _$jscoverage['/editor.js'].lineData[112] = 0;
  _$jscoverage['/editor.js'].lineData[113] = 0;
  _$jscoverage['/editor.js'].lineData[116] = 0;
  _$jscoverage['/editor.js'].lineData[117] = 0;
  _$jscoverage['/editor.js'].lineData[118] = 0;
  _$jscoverage['/editor.js'].lineData[120] = 0;
  _$jscoverage['/editor.js'].lineData[121] = 0;
  _$jscoverage['/editor.js'].lineData[127] = 0;
  _$jscoverage['/editor.js'].lineData[129] = 0;
  _$jscoverage['/editor.js'].lineData[130] = 0;
  _$jscoverage['/editor.js'].lineData[135] = 0;
  _$jscoverage['/editor.js'].lineData[140] = 0;
  _$jscoverage['/editor.js'].lineData[143] = 0;
  _$jscoverage['/editor.js'].lineData[146] = 0;
  _$jscoverage['/editor.js'].lineData[147] = 0;
  _$jscoverage['/editor.js'].lineData[151] = 0;
  _$jscoverage['/editor.js'].lineData[153] = 0;
  _$jscoverage['/editor.js'].lineData[155] = 0;
  _$jscoverage['/editor.js'].lineData[157] = 0;
  _$jscoverage['/editor.js'].lineData[159] = 0;
  _$jscoverage['/editor.js'].lineData[162] = 0;
  _$jscoverage['/editor.js'].lineData[163] = 0;
  _$jscoverage['/editor.js'].lineData[164] = 0;
  _$jscoverage['/editor.js'].lineData[168] = 0;
  _$jscoverage['/editor.js'].lineData[169] = 0;
  _$jscoverage['/editor.js'].lineData[177] = 0;
  _$jscoverage['/editor.js'].lineData[184] = 0;
  _$jscoverage['/editor.js'].lineData[185] = 0;
  _$jscoverage['/editor.js'].lineData[193] = 0;
  _$jscoverage['/editor.js'].lineData[202] = 0;
  _$jscoverage['/editor.js'].lineData[212] = 0;
  _$jscoverage['/editor.js'].lineData[213] = 0;
  _$jscoverage['/editor.js'].lineData[215] = 0;
  _$jscoverage['/editor.js'].lineData[216] = 0;
  _$jscoverage['/editor.js'].lineData[230] = 0;
  _$jscoverage['/editor.js'].lineData[239] = 0;
  _$jscoverage['/editor.js'].lineData[249] = 0;
  _$jscoverage['/editor.js'].lineData[252] = 0;
  _$jscoverage['/editor.js'].lineData[253] = 0;
  _$jscoverage['/editor.js'].lineData[254] = 0;
  _$jscoverage['/editor.js'].lineData[255] = 0;
  _$jscoverage['/editor.js'].lineData[257] = 0;
  _$jscoverage['/editor.js'].lineData[258] = 0;
  _$jscoverage['/editor.js'].lineData[268] = 0;
  _$jscoverage['/editor.js'].lineData[272] = 0;
  _$jscoverage['/editor.js'].lineData[275] = 0;
  _$jscoverage['/editor.js'].lineData[277] = 0;
  _$jscoverage['/editor.js'].lineData[278] = 0;
  _$jscoverage['/editor.js'].lineData[280] = 0;
  _$jscoverage['/editor.js'].lineData[281] = 0;
  _$jscoverage['/editor.js'].lineData[284] = 0;
  _$jscoverage['/editor.js'].lineData[285] = 0;
  _$jscoverage['/editor.js'].lineData[296] = 0;
  _$jscoverage['/editor.js'].lineData[299] = 0;
  _$jscoverage['/editor.js'].lineData[300] = 0;
  _$jscoverage['/editor.js'].lineData[302] = 0;
  _$jscoverage['/editor.js'].lineData[303] = 0;
  _$jscoverage['/editor.js'].lineData[305] = 0;
  _$jscoverage['/editor.js'].lineData[308] = 0;
  _$jscoverage['/editor.js'].lineData[309] = 0;
  _$jscoverage['/editor.js'].lineData[311] = 0;
  _$jscoverage['/editor.js'].lineData[313] = 0;
  _$jscoverage['/editor.js'].lineData[317] = 0;
  _$jscoverage['/editor.js'].lineData[318] = 0;
  _$jscoverage['/editor.js'].lineData[320] = 0;
  _$jscoverage['/editor.js'].lineData[330] = 0;
  _$jscoverage['/editor.js'].lineData[338] = 0;
  _$jscoverage['/editor.js'].lineData[339] = 0;
  _$jscoverage['/editor.js'].lineData[348] = 0;
  _$jscoverage['/editor.js'].lineData[357] = 0;
  _$jscoverage['/editor.js'].lineData[361] = 0;
  _$jscoverage['/editor.js'].lineData[362] = 0;
  _$jscoverage['/editor.js'].lineData[363] = 0;
  _$jscoverage['/editor.js'].lineData[364] = 0;
  _$jscoverage['/editor.js'].lineData[365] = 0;
  _$jscoverage['/editor.js'].lineData[367] = 0;
  _$jscoverage['/editor.js'].lineData[375] = 0;
  _$jscoverage['/editor.js'].lineData[378] = 0;
  _$jscoverage['/editor.js'].lineData[379] = 0;
  _$jscoverage['/editor.js'].lineData[381] = 0;
  _$jscoverage['/editor.js'].lineData[382] = 0;
  _$jscoverage['/editor.js'].lineData[384] = 0;
  _$jscoverage['/editor.js'].lineData[387] = 0;
  _$jscoverage['/editor.js'].lineData[391] = 0;
  _$jscoverage['/editor.js'].lineData[393] = 0;
  _$jscoverage['/editor.js'].lineData[394] = 0;
  _$jscoverage['/editor.js'].lineData[398] = 0;
  _$jscoverage['/editor.js'].lineData[406] = 0;
  _$jscoverage['/editor.js'].lineData[408] = 0;
  _$jscoverage['/editor.js'].lineData[409] = 0;
  _$jscoverage['/editor.js'].lineData[419] = 0;
  _$jscoverage['/editor.js'].lineData[422] = 0;
  _$jscoverage['/editor.js'].lineData[423] = 0;
  _$jscoverage['/editor.js'].lineData[424] = 0;
  _$jscoverage['/editor.js'].lineData[425] = 0;
  _$jscoverage['/editor.js'].lineData[435] = 0;
  _$jscoverage['/editor.js'].lineData[444] = 0;
  _$jscoverage['/editor.js'].lineData[447] = 0;
  _$jscoverage['/editor.js'].lineData[448] = 0;
  _$jscoverage['/editor.js'].lineData[449] = 0;
  _$jscoverage['/editor.js'].lineData[450] = 0;
  _$jscoverage['/editor.js'].lineData[451] = 0;
  _$jscoverage['/editor.js'].lineData[452] = 0;
  _$jscoverage['/editor.js'].lineData[461] = 0;
  _$jscoverage['/editor.js'].lineData[464] = 0;
  _$jscoverage['/editor.js'].lineData[465] = 0;
  _$jscoverage['/editor.js'].lineData[466] = 0;
  _$jscoverage['/editor.js'].lineData[469] = 0;
  _$jscoverage['/editor.js'].lineData[471] = 0;
  _$jscoverage['/editor.js'].lineData[472] = 0;
  _$jscoverage['/editor.js'].lineData[483] = 0;
  _$jscoverage['/editor.js'].lineData[484] = 0;
  _$jscoverage['/editor.js'].lineData[485] = 0;
  _$jscoverage['/editor.js'].lineData[486] = 0;
  _$jscoverage['/editor.js'].lineData[496] = 0;
  _$jscoverage['/editor.js'].lineData[505] = 0;
  _$jscoverage['/editor.js'].lineData[506] = 0;
  _$jscoverage['/editor.js'].lineData[507] = 0;
  _$jscoverage['/editor.js'].lineData[510] = 0;
  _$jscoverage['/editor.js'].lineData[511] = 0;
  _$jscoverage['/editor.js'].lineData[512] = 0;
  _$jscoverage['/editor.js'].lineData[513] = 0;
  _$jscoverage['/editor.js'].lineData[515] = 0;
  _$jscoverage['/editor.js'].lineData[516] = 0;
  _$jscoverage['/editor.js'].lineData[517] = 0;
  _$jscoverage['/editor.js'].lineData[533] = 0;
  _$jscoverage['/editor.js'].lineData[534] = 0;
  _$jscoverage['/editor.js'].lineData[535] = 0;
  _$jscoverage['/editor.js'].lineData[544] = 0;
  _$jscoverage['/editor.js'].lineData[546] = 0;
  _$jscoverage['/editor.js'].lineData[547] = 0;
  _$jscoverage['/editor.js'].lineData[550] = 0;
  _$jscoverage['/editor.js'].lineData[552] = 0;
  _$jscoverage['/editor.js'].lineData[566] = 0;
  _$jscoverage['/editor.js'].lineData[567] = 0;
  _$jscoverage['/editor.js'].lineData[570] = 0;
  _$jscoverage['/editor.js'].lineData[572] = 0;
  _$jscoverage['/editor.js'].lineData[573] = 0;
  _$jscoverage['/editor.js'].lineData[576] = 0;
  _$jscoverage['/editor.js'].lineData[577] = 0;
  _$jscoverage['/editor.js'].lineData[580] = 0;
  _$jscoverage['/editor.js'].lineData[581] = 0;
  _$jscoverage['/editor.js'].lineData[585] = 0;
  _$jscoverage['/editor.js'].lineData[586] = 0;
  _$jscoverage['/editor.js'].lineData[589] = 0;
  _$jscoverage['/editor.js'].lineData[592] = 0;
  _$jscoverage['/editor.js'].lineData[593] = 0;
  _$jscoverage['/editor.js'].lineData[594] = 0;
  _$jscoverage['/editor.js'].lineData[595] = 0;
  _$jscoverage['/editor.js'].lineData[598] = 0;
  _$jscoverage['/editor.js'].lineData[601] = 0;
  _$jscoverage['/editor.js'].lineData[604] = 0;
  _$jscoverage['/editor.js'].lineData[605] = 0;
  _$jscoverage['/editor.js'].lineData[608] = 0;
  _$jscoverage['/editor.js'].lineData[609] = 0;
  _$jscoverage['/editor.js'].lineData[615] = 0;
  _$jscoverage['/editor.js'].lineData[616] = 0;
  _$jscoverage['/editor.js'].lineData[626] = 0;
  _$jscoverage['/editor.js'].lineData[630] = 0;
  _$jscoverage['/editor.js'].lineData[631] = 0;
  _$jscoverage['/editor.js'].lineData[634] = 0;
  _$jscoverage['/editor.js'].lineData[635] = 0;
  _$jscoverage['/editor.js'].lineData[638] = 0;
  _$jscoverage['/editor.js'].lineData[639] = 0;
  _$jscoverage['/editor.js'].lineData[643] = 0;
  _$jscoverage['/editor.js'].lineData[644] = 0;
  _$jscoverage['/editor.js'].lineData[645] = 0;
  _$jscoverage['/editor.js'].lineData[646] = 0;
  _$jscoverage['/editor.js'].lineData[648] = 0;
  _$jscoverage['/editor.js'].lineData[649] = 0;
  _$jscoverage['/editor.js'].lineData[651] = 0;
  _$jscoverage['/editor.js'].lineData[658] = 0;
  _$jscoverage['/editor.js'].lineData[659] = 0;
  _$jscoverage['/editor.js'].lineData[661] = 0;
  _$jscoverage['/editor.js'].lineData[664] = 0;
  _$jscoverage['/editor.js'].lineData[665] = 0;
  _$jscoverage['/editor.js'].lineData[667] = 0;
  _$jscoverage['/editor.js'].lineData[669] = 0;
  _$jscoverage['/editor.js'].lineData[670] = 0;
  _$jscoverage['/editor.js'].lineData[671] = 0;
  _$jscoverage['/editor.js'].lineData[673] = 0;
  _$jscoverage['/editor.js'].lineData[674] = 0;
  _$jscoverage['/editor.js'].lineData[676] = 0;
  _$jscoverage['/editor.js'].lineData[682] = 0;
  _$jscoverage['/editor.js'].lineData[683] = 0;
  _$jscoverage['/editor.js'].lineData[685] = 0;
  _$jscoverage['/editor.js'].lineData[697] = 0;
  _$jscoverage['/editor.js'].lineData[698] = 0;
  _$jscoverage['/editor.js'].lineData[699] = 0;
  _$jscoverage['/editor.js'].lineData[700] = 0;
  _$jscoverage['/editor.js'].lineData[701] = 0;
  _$jscoverage['/editor.js'].lineData[702] = 0;
  _$jscoverage['/editor.js'].lineData[703] = 0;
  _$jscoverage['/editor.js'].lineData[704] = 0;
  _$jscoverage['/editor.js'].lineData[705] = 0;
  _$jscoverage['/editor.js'].lineData[707] = 0;
  _$jscoverage['/editor.js'].lineData[708] = 0;
  _$jscoverage['/editor.js'].lineData[710] = 0;
  _$jscoverage['/editor.js'].lineData[711] = 0;
  _$jscoverage['/editor.js'].lineData[713] = 0;
  _$jscoverage['/editor.js'].lineData[714] = 0;
  _$jscoverage['/editor.js'].lineData[715] = 0;
  _$jscoverage['/editor.js'].lineData[716] = 0;
  _$jscoverage['/editor.js'].lineData[717] = 0;
  _$jscoverage['/editor.js'].lineData[724] = 0;
  _$jscoverage['/editor.js'].lineData[725] = 0;
  _$jscoverage['/editor.js'].lineData[731] = 0;
  _$jscoverage['/editor.js'].lineData[733] = 0;
  _$jscoverage['/editor.js'].lineData[735] = 0;
  _$jscoverage['/editor.js'].lineData[737] = 0;
  _$jscoverage['/editor.js'].lineData[759] = 0;
  _$jscoverage['/editor.js'].lineData[761] = 0;
  _$jscoverage['/editor.js'].lineData[764] = 0;
  _$jscoverage['/editor.js'].lineData[765] = 0;
  _$jscoverage['/editor.js'].lineData[766] = 0;
  _$jscoverage['/editor.js'].lineData[770] = 0;
  _$jscoverage['/editor.js'].lineData[772] = 0;
  _$jscoverage['/editor.js'].lineData[773] = 0;
  _$jscoverage['/editor.js'].lineData[775] = 0;
  _$jscoverage['/editor.js'].lineData[776] = 0;
  _$jscoverage['/editor.js'].lineData[778] = 0;
  _$jscoverage['/editor.js'].lineData[785] = 0;
  _$jscoverage['/editor.js'].lineData[796] = 0;
  _$jscoverage['/editor.js'].lineData[797] = 0;
  _$jscoverage['/editor.js'].lineData[804] = 0;
  _$jscoverage['/editor.js'].lineData[805] = 0;
  _$jscoverage['/editor.js'].lineData[806] = 0;
  _$jscoverage['/editor.js'].lineData[807] = 0;
  _$jscoverage['/editor.js'].lineData[814] = 0;
  _$jscoverage['/editor.js'].lineData[820] = 0;
  _$jscoverage['/editor.js'].lineData[829] = 0;
  _$jscoverage['/editor.js'].lineData[830] = 0;
  _$jscoverage['/editor.js'].lineData[831] = 0;
  _$jscoverage['/editor.js'].lineData[832] = 0;
  _$jscoverage['/editor.js'].lineData[833] = 0;
  _$jscoverage['/editor.js'].lineData[840] = 0;
  _$jscoverage['/editor.js'].lineData[841] = 0;
  _$jscoverage['/editor.js'].lineData[842] = 0;
  _$jscoverage['/editor.js'].lineData[846] = 0;
  _$jscoverage['/editor.js'].lineData[848] = 0;
  _$jscoverage['/editor.js'].lineData[850] = 0;
  _$jscoverage['/editor.js'].lineData[851] = 0;
  _$jscoverage['/editor.js'].lineData[852] = 0;
  _$jscoverage['/editor.js'].lineData[858] = 0;
  _$jscoverage['/editor.js'].lineData[859] = 0;
  _$jscoverage['/editor.js'].lineData[860] = 0;
  _$jscoverage['/editor.js'].lineData[863] = 0;
  _$jscoverage['/editor.js'].lineData[873] = 0;
  _$jscoverage['/editor.js'].lineData[874] = 0;
  _$jscoverage['/editor.js'].lineData[875] = 0;
  _$jscoverage['/editor.js'].lineData[877] = 0;
  _$jscoverage['/editor.js'].lineData[879] = 0;
  _$jscoverage['/editor.js'].lineData[880] = 0;
  _$jscoverage['/editor.js'].lineData[881] = 0;
  _$jscoverage['/editor.js'].lineData[883] = 0;
  _$jscoverage['/editor.js'].lineData[884] = 0;
  _$jscoverage['/editor.js'].lineData[890] = 0;
  _$jscoverage['/editor.js'].lineData[891] = 0;
  _$jscoverage['/editor.js'].lineData[892] = 0;
  _$jscoverage['/editor.js'].lineData[894] = 0;
  _$jscoverage['/editor.js'].lineData[899] = 0;
  _$jscoverage['/editor.js'].lineData[900] = 0;
  _$jscoverage['/editor.js'].lineData[910] = 0;
  _$jscoverage['/editor.js'].lineData[911] = 0;
  _$jscoverage['/editor.js'].lineData[912] = 0;
  _$jscoverage['/editor.js'].lineData[913] = 0;
  _$jscoverage['/editor.js'].lineData[914] = 0;
  _$jscoverage['/editor.js'].lineData[918] = 0;
  _$jscoverage['/editor.js'].lineData[919] = 0;
  _$jscoverage['/editor.js'].lineData[920] = 0;
  _$jscoverage['/editor.js'].lineData[921] = 0;
  _$jscoverage['/editor.js'].lineData[927] = 0;
  _$jscoverage['/editor.js'].lineData[928] = 0;
  _$jscoverage['/editor.js'].lineData[929] = 0;
  _$jscoverage['/editor.js'].lineData[936] = 0;
  _$jscoverage['/editor.js'].lineData[937] = 0;
  _$jscoverage['/editor.js'].lineData[939] = 0;
  _$jscoverage['/editor.js'].lineData[940] = 0;
  _$jscoverage['/editor.js'].lineData[941] = 0;
  _$jscoverage['/editor.js'].lineData[943] = 0;
  _$jscoverage['/editor.js'].lineData[944] = 0;
  _$jscoverage['/editor.js'].lineData[945] = 0;
  _$jscoverage['/editor.js'].lineData[949] = 0;
  _$jscoverage['/editor.js'].lineData[955] = 0;
  _$jscoverage['/editor.js'].lineData[956] = 0;
  _$jscoverage['/editor.js'].lineData[958] = 0;
  _$jscoverage['/editor.js'].lineData[959] = 0;
  _$jscoverage['/editor.js'].lineData[962] = 0;
  _$jscoverage['/editor.js'].lineData[965] = 0;
  _$jscoverage['/editor.js'].lineData[969] = 0;
  _$jscoverage['/editor.js'].lineData[970] = 0;
  _$jscoverage['/editor.js'].lineData[971] = 0;
  _$jscoverage['/editor.js'].lineData[976] = 0;
  _$jscoverage['/editor.js'].lineData[982] = 0;
  _$jscoverage['/editor.js'].lineData[983] = 0;
  _$jscoverage['/editor.js'].lineData[985] = 0;
  _$jscoverage['/editor.js'].lineData[986] = 0;
  _$jscoverage['/editor.js'].lineData[988] = 0;
  _$jscoverage['/editor.js'].lineData[990] = 0;
  _$jscoverage['/editor.js'].lineData[993] = 0;
  _$jscoverage['/editor.js'].lineData[995] = 0;
  _$jscoverage['/editor.js'].lineData[996] = 0;
  _$jscoverage['/editor.js'].lineData[997] = 0;
  _$jscoverage['/editor.js'].lineData[998] = 0;
  _$jscoverage['/editor.js'].lineData[1006] = 0;
  _$jscoverage['/editor.js'].lineData[1007] = 0;
  _$jscoverage['/editor.js'].lineData[1008] = 0;
  _$jscoverage['/editor.js'].lineData[1009] = 0;
  _$jscoverage['/editor.js'].lineData[1010] = 0;
  _$jscoverage['/editor.js'].lineData[1011] = 0;
  _$jscoverage['/editor.js'].lineData[1019] = 0;
  _$jscoverage['/editor.js'].lineData[1020] = 0;
  _$jscoverage['/editor.js'].lineData[1021] = 0;
  _$jscoverage['/editor.js'].lineData[1022] = 0;
  _$jscoverage['/editor.js'].lineData[1023] = 0;
  _$jscoverage['/editor.js'].lineData[1029] = 0;
  _$jscoverage['/editor.js'].lineData[1030] = 0;
  _$jscoverage['/editor.js'].lineData[1031] = 0;
  _$jscoverage['/editor.js'].lineData[1032] = 0;
  _$jscoverage['/editor.js'].lineData[1034] = 0;
  _$jscoverage['/editor.js'].lineData[1040] = 0;
  _$jscoverage['/editor.js'].lineData[1044] = 0;
  _$jscoverage['/editor.js'].lineData[1045] = 0;
  _$jscoverage['/editor.js'].lineData[1048] = 0;
  _$jscoverage['/editor.js'].lineData[1049] = 0;
  _$jscoverage['/editor.js'].lineData[1050] = 0;
  _$jscoverage['/editor.js'].lineData[1051] = 0;
  _$jscoverage['/editor.js'].lineData[1055] = 0;
  _$jscoverage['/editor.js'].lineData[1081] = 0;
  _$jscoverage['/editor.js'].lineData[1082] = 0;
  _$jscoverage['/editor.js'].lineData[1085] = 0;
  _$jscoverage['/editor.js'].lineData[1086] = 0;
  _$jscoverage['/editor.js'].lineData[1093] = 0;
  _$jscoverage['/editor.js'].lineData[1094] = 0;
  _$jscoverage['/editor.js'].lineData[1102] = 0;
  _$jscoverage['/editor.js'].lineData[1107] = 0;
  _$jscoverage['/editor.js'].lineData[1110] = 0;
  _$jscoverage['/editor.js'].lineData[1111] = 0;
  _$jscoverage['/editor.js'].lineData[1112] = 0;
  _$jscoverage['/editor.js'].lineData[1115] = 0;
  _$jscoverage['/editor.js'].lineData[1116] = 0;
  _$jscoverage['/editor.js'].lineData[1117] = 0;
  _$jscoverage['/editor.js'].lineData[1118] = 0;
  _$jscoverage['/editor.js'].lineData[1119] = 0;
  _$jscoverage['/editor.js'].lineData[1120] = 0;
  _$jscoverage['/editor.js'].lineData[1122] = 0;
  _$jscoverage['/editor.js'].lineData[1123] = 0;
  _$jscoverage['/editor.js'].lineData[1124] = 0;
  _$jscoverage['/editor.js'].lineData[1128] = 0;
  _$jscoverage['/editor.js'].lineData[1132] = 0;
  _$jscoverage['/editor.js'].lineData[1133] = 0;
  _$jscoverage['/editor.js'].lineData[1134] = 0;
  _$jscoverage['/editor.js'].lineData[1136] = 0;
  _$jscoverage['/editor.js'].lineData[1141] = 0;
  _$jscoverage['/editor.js'].lineData[1142] = 0;
  _$jscoverage['/editor.js'].lineData[1144] = 0;
  _$jscoverage['/editor.js'].lineData[1145] = 0;
  _$jscoverage['/editor.js'].lineData[1146] = 0;
  _$jscoverage['/editor.js'].lineData[1148] = 0;
  _$jscoverage['/editor.js'].lineData[1149] = 0;
  _$jscoverage['/editor.js'].lineData[1150] = 0;
  _$jscoverage['/editor.js'].lineData[1154] = 0;
  _$jscoverage['/editor.js'].lineData[1158] = 0;
  _$jscoverage['/editor.js'].lineData[1159] = 0;
  _$jscoverage['/editor.js'].lineData[1160] = 0;
  _$jscoverage['/editor.js'].lineData[1162] = 0;
  _$jscoverage['/editor.js'].lineData[1168] = 0;
  _$jscoverage['/editor.js'].lineData[1169] = 0;
  _$jscoverage['/editor.js'].lineData[1171] = 0;
  _$jscoverage['/editor.js'].lineData[1176] = 0;
}
if (! _$jscoverage['/editor.js'].functionData) {
  _$jscoverage['/editor.js'].functionData = [];
  _$jscoverage['/editor.js'].functionData[0] = 0;
  _$jscoverage['/editor.js'].functionData[1] = 0;
  _$jscoverage['/editor.js'].functionData[2] = 0;
  _$jscoverage['/editor.js'].functionData[3] = 0;
  _$jscoverage['/editor.js'].functionData[4] = 0;
  _$jscoverage['/editor.js'].functionData[5] = 0;
  _$jscoverage['/editor.js'].functionData[6] = 0;
  _$jscoverage['/editor.js'].functionData[7] = 0;
  _$jscoverage['/editor.js'].functionData[8] = 0;
  _$jscoverage['/editor.js'].functionData[9] = 0;
  _$jscoverage['/editor.js'].functionData[10] = 0;
  _$jscoverage['/editor.js'].functionData[11] = 0;
  _$jscoverage['/editor.js'].functionData[12] = 0;
  _$jscoverage['/editor.js'].functionData[13] = 0;
  _$jscoverage['/editor.js'].functionData[14] = 0;
  _$jscoverage['/editor.js'].functionData[15] = 0;
  _$jscoverage['/editor.js'].functionData[16] = 0;
  _$jscoverage['/editor.js'].functionData[17] = 0;
  _$jscoverage['/editor.js'].functionData[18] = 0;
  _$jscoverage['/editor.js'].functionData[19] = 0;
  _$jscoverage['/editor.js'].functionData[20] = 0;
  _$jscoverage['/editor.js'].functionData[21] = 0;
  _$jscoverage['/editor.js'].functionData[22] = 0;
  _$jscoverage['/editor.js'].functionData[23] = 0;
  _$jscoverage['/editor.js'].functionData[24] = 0;
  _$jscoverage['/editor.js'].functionData[25] = 0;
  _$jscoverage['/editor.js'].functionData[26] = 0;
  _$jscoverage['/editor.js'].functionData[27] = 0;
  _$jscoverage['/editor.js'].functionData[28] = 0;
  _$jscoverage['/editor.js'].functionData[29] = 0;
  _$jscoverage['/editor.js'].functionData[30] = 0;
  _$jscoverage['/editor.js'].functionData[31] = 0;
  _$jscoverage['/editor.js'].functionData[32] = 0;
  _$jscoverage['/editor.js'].functionData[33] = 0;
  _$jscoverage['/editor.js'].functionData[34] = 0;
  _$jscoverage['/editor.js'].functionData[35] = 0;
  _$jscoverage['/editor.js'].functionData[36] = 0;
  _$jscoverage['/editor.js'].functionData[37] = 0;
  _$jscoverage['/editor.js'].functionData[38] = 0;
  _$jscoverage['/editor.js'].functionData[39] = 0;
  _$jscoverage['/editor.js'].functionData[40] = 0;
  _$jscoverage['/editor.js'].functionData[41] = 0;
  _$jscoverage['/editor.js'].functionData[42] = 0;
  _$jscoverage['/editor.js'].functionData[43] = 0;
  _$jscoverage['/editor.js'].functionData[44] = 0;
  _$jscoverage['/editor.js'].functionData[45] = 0;
  _$jscoverage['/editor.js'].functionData[46] = 0;
  _$jscoverage['/editor.js'].functionData[47] = 0;
  _$jscoverage['/editor.js'].functionData[48] = 0;
  _$jscoverage['/editor.js'].functionData[49] = 0;
  _$jscoverage['/editor.js'].functionData[50] = 0;
  _$jscoverage['/editor.js'].functionData[51] = 0;
  _$jscoverage['/editor.js'].functionData[52] = 0;
  _$jscoverage['/editor.js'].functionData[53] = 0;
  _$jscoverage['/editor.js'].functionData[54] = 0;
  _$jscoverage['/editor.js'].functionData[55] = 0;
  _$jscoverage['/editor.js'].functionData[56] = 0;
  _$jscoverage['/editor.js'].functionData[57] = 0;
  _$jscoverage['/editor.js'].functionData[58] = 0;
  _$jscoverage['/editor.js'].functionData[59] = 0;
  _$jscoverage['/editor.js'].functionData[60] = 0;
  _$jscoverage['/editor.js'].functionData[61] = 0;
  _$jscoverage['/editor.js'].functionData[62] = 0;
  _$jscoverage['/editor.js'].functionData[63] = 0;
  _$jscoverage['/editor.js'].functionData[64] = 0;
  _$jscoverage['/editor.js'].functionData[65] = 0;
  _$jscoverage['/editor.js'].functionData[66] = 0;
  _$jscoverage['/editor.js'].functionData[67] = 0;
  _$jscoverage['/editor.js'].functionData[68] = 0;
  _$jscoverage['/editor.js'].functionData[69] = 0;
  _$jscoverage['/editor.js'].functionData[70] = 0;
  _$jscoverage['/editor.js'].functionData[71] = 0;
  _$jscoverage['/editor.js'].functionData[72] = 0;
  _$jscoverage['/editor.js'].functionData[73] = 0;
  _$jscoverage['/editor.js'].functionData[74] = 0;
  _$jscoverage['/editor.js'].functionData[75] = 0;
  _$jscoverage['/editor.js'].functionData[76] = 0;
}
if (! _$jscoverage['/editor.js'].branchData) {
  _$jscoverage['/editor.js'].branchData = {};
  _$jscoverage['/editor.js'].branchData['61'] = [];
  _$jscoverage['/editor.js'].branchData['61'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['62'] = [];
  _$jscoverage['/editor.js'].branchData['62'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['70'] = [];
  _$jscoverage['/editor.js'].branchData['70'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['76'] = [];
  _$jscoverage['/editor.js'].branchData['76'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['100'] = [];
  _$jscoverage['/editor.js'].branchData['100'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['100'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['101'] = [];
  _$jscoverage['/editor.js'].branchData['101'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['101'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['110'] = [];
  _$jscoverage['/editor.js'].branchData['110'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['116'] = [];
  _$jscoverage['/editor.js'].branchData['116'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['129'] = [];
  _$jscoverage['/editor.js'].branchData['129'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['140'] = [];
  _$jscoverage['/editor.js'].branchData['140'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['141'] = [];
  _$jscoverage['/editor.js'].branchData['141'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['146'] = [];
  _$jscoverage['/editor.js'].branchData['146'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['163'] = [];
  _$jscoverage['/editor.js'].branchData['163'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['254'] = [];
  _$jscoverage['/editor.js'].branchData['254'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['275'] = [];
  _$jscoverage['/editor.js'].branchData['275'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['280'] = [];
  _$jscoverage['/editor.js'].branchData['280'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['299'] = [];
  _$jscoverage['/editor.js'].branchData['299'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['302'] = [];
  _$jscoverage['/editor.js'].branchData['302'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['302'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['308'] = [];
  _$jscoverage['/editor.js'].branchData['308'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['317'] = [];
  _$jscoverage['/editor.js'].branchData['317'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['361'] = [];
  _$jscoverage['/editor.js'].branchData['361'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['378'] = [];
  _$jscoverage['/editor.js'].branchData['378'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['384'] = [];
  _$jscoverage['/editor.js'].branchData['384'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['387'] = [];
  _$jscoverage['/editor.js'].branchData['387'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['387'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['391'] = [];
  _$jscoverage['/editor.js'].branchData['391'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['421'] = [];
  _$jscoverage['/editor.js'].branchData['421'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['424'] = [];
  _$jscoverage['/editor.js'].branchData['424'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['465'] = [];
  _$jscoverage['/editor.js'].branchData['465'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['471'] = [];
  _$jscoverage['/editor.js'].branchData['471'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['485'] = [];
  _$jscoverage['/editor.js'].branchData['485'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['506'] = [];
  _$jscoverage['/editor.js'].branchData['506'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['512'] = [];
  _$jscoverage['/editor.js'].branchData['512'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['515'] = [];
  _$jscoverage['/editor.js'].branchData['515'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['546'] = [];
  _$jscoverage['/editor.js'].branchData['546'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['558'] = [];
  _$jscoverage['/editor.js'].branchData['558'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['566'] = [];
  _$jscoverage['/editor.js'].branchData['566'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['566'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['572'] = [];
  _$jscoverage['/editor.js'].branchData['572'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['576'] = [];
  _$jscoverage['/editor.js'].branchData['576'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['576'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['580'] = [];
  _$jscoverage['/editor.js'].branchData['580'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['585'] = [];
  _$jscoverage['/editor.js'].branchData['585'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['592'] = [];
  _$jscoverage['/editor.js'].branchData['592'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['595'] = [];
  _$jscoverage['/editor.js'].branchData['595'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['595'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['595'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['598'] = [];
  _$jscoverage['/editor.js'].branchData['598'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['599'] = [];
  _$jscoverage['/editor.js'].branchData['599'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['608'] = [];
  _$jscoverage['/editor.js'].branchData['608'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['608'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['630'] = [];
  _$jscoverage['/editor.js'].branchData['630'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['634'] = [];
  _$jscoverage['/editor.js'].branchData['634'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['643'] = [];
  _$jscoverage['/editor.js'].branchData['643'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['645'] = [];
  _$jscoverage['/editor.js'].branchData['645'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['664'] = [];
  _$jscoverage['/editor.js'].branchData['664'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['667'] = [];
  _$jscoverage['/editor.js'].branchData['667'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['667'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['667'][3] = new BranchData();
  _$jscoverage['/editor.js'].branchData['669'] = [];
  _$jscoverage['/editor.js'].branchData['669'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['698'] = [];
  _$jscoverage['/editor.js'].branchData['698'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['700'] = [];
  _$jscoverage['/editor.js'].branchData['700'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['704'] = [];
  _$jscoverage['/editor.js'].branchData['704'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['705'] = [];
  _$jscoverage['/editor.js'].branchData['705'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['707'] = [];
  _$jscoverage['/editor.js'].branchData['707'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['708'] = [];
  _$jscoverage['/editor.js'].branchData['708'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['710'] = [];
  _$jscoverage['/editor.js'].branchData['710'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['713'] = [];
  _$jscoverage['/editor.js'].branchData['713'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['759'] = [];
  _$jscoverage['/editor.js'].branchData['759'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['772'] = [];
  _$jscoverage['/editor.js'].branchData['772'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['775'] = [];
  _$jscoverage['/editor.js'].branchData['775'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['794'] = [];
  _$jscoverage['/editor.js'].branchData['794'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['805'] = [];
  _$jscoverage['/editor.js'].branchData['805'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['806'] = [];
  _$jscoverage['/editor.js'].branchData['806'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['829'] = [];
  _$jscoverage['/editor.js'].branchData['829'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['831'] = [];
  _$jscoverage['/editor.js'].branchData['831'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['848'] = [];
  _$jscoverage['/editor.js'].branchData['848'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['860'] = [];
  _$jscoverage['/editor.js'].branchData['860'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['861'] = [];
  _$jscoverage['/editor.js'].branchData['861'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['861'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['883'] = [];
  _$jscoverage['/editor.js'].branchData['883'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['894'] = [];
  _$jscoverage['/editor.js'].branchData['894'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['910'] = [];
  _$jscoverage['/editor.js'].branchData['910'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['913'] = [];
  _$jscoverage['/editor.js'].branchData['913'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['920'] = [];
  _$jscoverage['/editor.js'].branchData['920'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['927'] = [];
  _$jscoverage['/editor.js'].branchData['927'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['927'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['940'] = [];
  _$jscoverage['/editor.js'].branchData['940'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['955'] = [];
  _$jscoverage['/editor.js'].branchData['955'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['958'] = [];
  _$jscoverage['/editor.js'].branchData['958'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['965'] = [];
  _$jscoverage['/editor.js'].branchData['965'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['970'] = [];
  _$jscoverage['/editor.js'].branchData['970'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['976'] = [];
  _$jscoverage['/editor.js'].branchData['976'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['985'] = [];
  _$jscoverage['/editor.js'].branchData['985'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['988'] = [];
  _$jscoverage['/editor.js'].branchData['988'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1006'] = [];
  _$jscoverage['/editor.js'].branchData['1006'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1009'] = [];
  _$jscoverage['/editor.js'].branchData['1009'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1019'] = [];
  _$jscoverage['/editor.js'].branchData['1019'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1022'] = [];
  _$jscoverage['/editor.js'].branchData['1022'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1029'] = [];
  _$jscoverage['/editor.js'].branchData['1029'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1032'] = [];
  _$jscoverage['/editor.js'].branchData['1032'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1032'][2] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1050'] = [];
  _$jscoverage['/editor.js'].branchData['1050'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1059'] = [];
  _$jscoverage['/editor.js'].branchData['1059'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1066'] = [];
  _$jscoverage['/editor.js'].branchData['1066'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1110'] = [];
  _$jscoverage['/editor.js'].branchData['1110'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1132'] = [];
  _$jscoverage['/editor.js'].branchData['1132'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1133'] = [];
  _$jscoverage['/editor.js'].branchData['1133'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1141'] = [];
  _$jscoverage['/editor.js'].branchData['1141'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1148'] = [];
  _$jscoverage['/editor.js'].branchData['1148'][1] = new BranchData();
  _$jscoverage['/editor.js'].branchData['1159'] = [];
  _$jscoverage['/editor.js'].branchData['1159'][1] = new BranchData();
}
_$jscoverage['/editor.js'].branchData['1159'][1].init(13, 19, '!self.get(\'iframe\')');
function visit1244_1159_1(result) {
  _$jscoverage['/editor.js'].branchData['1159'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1148'][1].init(880, 31, 'UA[\'gecko\'] && !iframe.__loaded');
function visit1243_1148_1(result) {
  _$jscoverage['/editor.js'].branchData['1148'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1141'][1].init(555, 28, 'textarea.hasAttr(\'tabindex\')');
function visit1242_1141_1(result) {
  _$jscoverage['/editor.js'].branchData['1141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1133'][1].init(261, 9, 'iframeSrc');
function visit1241_1133_1(result) {
  _$jscoverage['/editor.js'].branchData['1133'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1132'][1].init(212, 35, '$(window).getEmptyIframeSrc() || \'\'');
function visit1240_1132_1(result) {
  _$jscoverage['/editor.js'].branchData['1132'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1110'][1].init(371, 9, 'IS_IE < 7');
function visit1239_1110_1(result) {
  _$jscoverage['/editor.js'].branchData['1110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1066'][1].init(528, 10, 'data || \'\'');
function visit1238_1066_1(result) {
  _$jscoverage['/editor.js'].branchData['1066'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1059'][1].init(232, 27, 'document.documentMode === 8');
function visit1237_1059_1(result) {
  _$jscoverage['/editor.js'].branchData['1059'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1050'][1].init(216, 21, 'i < customLink.length');
function visit1236_1050_1(result) {
  _$jscoverage['/editor.js'].branchData['1050'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1032'][2].init(72, 28, 'control.nodeName() === \'img\'');
function visit1235_1032_2(result) {
  _$jscoverage['/editor.js'].branchData['1032'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1032'][1].init(72, 64, 'control.nodeName() === \'img\' && /ke_/.test(control[0].className)');
function visit1234_1032_1(result) {
  _$jscoverage['/editor.js'].branchData['1032'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1029'][1].init(4835, 11, 'UA[\'gecko\']');
function visit1233_1029_1(result) {
  _$jscoverage['/editor.js'].branchData['1029'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1022'][1].init(72, 75, 'S.inArray(control.nodeName(), [\'img\', \'hr\', \'input\', \'textarea\', \'select\'])');
function visit1232_1022_1(result) {
  _$jscoverage['/editor.js'].branchData['1022'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1019'][1].init(4498, 12, 'UA[\'webkit\']');
function visit1231_1019_1(result) {
  _$jscoverage['/editor.js'].branchData['1019'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1009'][1].init(25, 29, 'evt.keyCode in pageUpDownKeys');
function visit1230_1009_1(result) {
  _$jscoverage['/editor.js'].branchData['1009'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['1006'][1].init(1337, 30, 'doc.compatMode == \'CSS1Compat\'');
function visit1229_1006_1(result) {
  _$jscoverage['/editor.js'].branchData['1006'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['988'][1].init(136, 7, 'control');
function visit1228_988_1(result) {
  _$jscoverage['/editor.js'].branchData['988'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['985'][1].init(104, 26, 'keyCode in {\n  8: 1, \n  46: 1}');
function visit1227_985_1(result) {
  _$jscoverage['/editor.js'].branchData['985'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['976'][1].init(2645, 5, 'IS_IE');
function visit1226_976_1(result) {
  _$jscoverage['/editor.js'].branchData['976'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['970'][1].init(21, 19, '!self.__iframeFocus');
function visit1225_970_1(result) {
  _$jscoverage['/editor.js'].branchData['970'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['965'][1].init(2360, 11, 'UA[\'gecko\']');
function visit1224_965_1(result) {
  _$jscoverage['/editor.js'].branchData['965'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['958'][1].init(240, 11, 'UA[\'opera\']');
function visit1223_958_1(result) {
  _$jscoverage['/editor.js'].branchData['958'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['955'][1].init(148, 11, 'UA[\'gecko\']');
function visit1222_955_1(result) {
  _$jscoverage['/editor.js'].branchData['955'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['940'][1].init(21, 33, 'UA[\'gecko\'] && self.__iframeFocus');
function visit1221_940_1(result) {
  _$jscoverage['/editor.js'].branchData['940'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['927'][2].init(1092, 20, 'IS_IE || UA[\'opera\']');
function visit1220_927_2(result) {
  _$jscoverage['/editor.js'].branchData['927'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['927'][1].init(1077, 35, 'UA[\'gecko\'] || IS_IE || UA[\'opera\']');
function visit1219_927_1(result) {
  _$jscoverage['/editor.js'].branchData['927'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['920'][1].init(72, 52, 'S.inArray(control.nodeName(), [\'input\', \'textarea\'])');
function visit1218_920_1(result) {
  _$jscoverage['/editor.js'].branchData['920'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['913'][1].init(72, 50, 'S.inArray(control.nodeName(), [\'input\', \'select\'])');
function visit1217_913_1(result) {
  _$jscoverage['/editor.js'].branchData['913'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['910'][1].init(428, 12, 'UA[\'webkit\']');
function visit1216_910_1(result) {
  _$jscoverage['/editor.js'].branchData['910'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['894'][1].init(220, 29, '!retry && blinkCursor(doc, 1)');
function visit1215_894_1(result) {
  _$jscoverage['/editor.js'].branchData['894'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['883'][1].init(149, 23, '!arguments.callee.retry');
function visit1214_883_1(result) {
  _$jscoverage['/editor.js'].branchData['883'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['861'][2].init(53, 24, 't.nodeName() === \'table\'');
function visit1213_861_2(result) {
  _$jscoverage['/editor.js'].branchData['861'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['861'][1].init(53, 85, 't.nodeName() === \'table\' && disableInlineTableEditing');
function visit1212_861_1(result) {
  _$jscoverage['/editor.js'].branchData['861'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['860'][1].init(83, 140, 'disableObjectResizing || (t.nodeName() === \'table\' && disableInlineTableEditing)');
function visit1211_860_1(result) {
  _$jscoverage['/editor.js'].branchData['860'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['848'][1].init(318, 50, 'disableObjectResizing || disableInlineTableEditing');
function visit1210_848_1(result) {
  _$jscoverage['/editor.js'].branchData['848'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['831'][1].init(25, 3, 'doc');
function visit1209_831_1(result) {
  _$jscoverage['/editor.js'].branchData['831'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['829'][1].init(372, 5, 'IS_IE');
function visit1208_829_1(result) {
  _$jscoverage['/editor.js'].branchData['829'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['806'][1].init(25, 11, 'UA[\'gecko\']');
function visit1207_806_1(result) {
  _$jscoverage['/editor.js'].branchData['806'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['805'][1].init(319, 16, 't == htmlElement');
function visit1206_805_1(result) {
  _$jscoverage['/editor.js'].branchData['805'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['794'][1].init(363, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1205_794_1(result) {
  _$jscoverage['/editor.js'].branchData['794'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['775'][1].init(224, 12, 'UA[\'webkit\']');
function visit1204_775_1(result) {
  _$jscoverage['/editor.js'].branchData['775'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['772'][1].init(98, 26, 'UA[\'gecko\'] || UA[\'opera\']');
function visit1203_772_1(result) {
  _$jscoverage['/editor.js'].branchData['772'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['759'][1].init(1281, 5, 'IS_IE');
function visit1202_759_1(result) {
  _$jscoverage['/editor.js'].branchData['759'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['713'][1].init(507, 26, 'cfg.data || textarea.val()');
function visit1201_713_1(result) {
  _$jscoverage['/editor.js'].branchData['713'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['710'][1].init(431, 4, 'name');
function visit1200_710_1(result) {
  _$jscoverage['/editor.js'].branchData['710'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['708'][1].init(26, 20, 'cfg.height || height');
function visit1199_708_1(result) {
  _$jscoverage['/editor.js'].branchData['708'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['707'][1].init(352, 6, 'height');
function visit1198_707_1(result) {
  _$jscoverage['/editor.js'].branchData['707'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['705'][1].init(25, 18, 'cfg.width || width');
function visit1197_705_1(result) {
  _$jscoverage['/editor.js'].branchData['705'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['704'][1].init(277, 5, 'width');
function visit1196_704_1(result) {
  _$jscoverage['/editor.js'].branchData['704'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['700'][1].init(106, 23, 'cfg.textareaAttrs || {}');
function visit1195_700_1(result) {
  _$jscoverage['/editor.js'].branchData['700'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['698'][1].init(15, 9, 'cfg || {}');
function visit1194_698_1(result) {
  _$jscoverage['/editor.js'].branchData['698'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['669'][1].init(311, 5, '!node');
function visit1193_669_1(result) {
  _$jscoverage['/editor.js'].branchData['669'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['667'][3].init(64, 33, 'el.nodeName.toLowerCase() != \'br\'');
function visit1192_667_3(result) {
  _$jscoverage['/editor.js'].branchData['667'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['667'][2].init(44, 16, 'el.nodeType == 1');
function visit1191_667_2(result) {
  _$jscoverage['/editor.js'].branchData['667'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['667'][1].init(44, 53, 'el.nodeType == 1 && el.nodeName.toLowerCase() != \'br\'');
function visit1190_667_1(result) {
  _$jscoverage['/editor.js'].branchData['667'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['664'][1].init(120, 43, 'self.getSelection().getRanges().length == 0');
function visit1189_664_1(result) {
  _$jscoverage['/editor.js'].branchData['664'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['645'][1].init(69, 22, '$sel.type == \'Control\'');
function visit1188_645_1(result) {
  _$jscoverage['/editor.js'].branchData['645'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['643'][1].init(523, 5, 'IS_IE');
function visit1187_643_1(result) {
  _$jscoverage['/editor.js'].branchData['643'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['634'][1].init(227, 42, 'htmlDataProcessor = self.htmlDataProcessor');
function visit1186_634_1(result) {
  _$jscoverage['/editor.js'].branchData['634'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['630'][1].init(135, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1185_630_1(result) {
  _$jscoverage['/editor.js'].branchData['630'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['608'][2].init(2357, 22, 'clone[0].nodeType == 1');
function visit1184_608_2(result) {
  _$jscoverage['/editor.js'].branchData['608'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['608'][1].init(2348, 31, 'clone && clone[0].nodeType == 1');
function visit1183_608_1(result) {
  _$jscoverage['/editor.js'].branchData['608'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['599'][1].init(31, 82, 'xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit1182_599_1(result) {
  _$jscoverage['/editor.js'].branchData['599'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['598'][1].init(338, 114, 'nextName && xhtml_dtd.$block[nextName] && xhtml_dtd[nextName][\'#text\']');
function visit1181_598_1(result) {
  _$jscoverage['/editor.js'].branchData['598'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['595'][3].init(168, 41, 'next[0].nodeType == NodeType.ELEMENT_NODE');
function visit1180_595_3(result) {
  _$jscoverage['/editor.js'].branchData['595'][3].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['595'][2].init(168, 80, 'next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit1179_595_2(result) {
  _$jscoverage['/editor.js'].branchData['595'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['595'][1].init(160, 88, 'next && next[0].nodeType == NodeType.ELEMENT_NODE && next.nodeName()');
function visit1178_595_1(result) {
  _$jscoverage['/editor.js'].branchData['595'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['592'][1].init(1580, 7, 'isBlock');
function visit1177_592_1(result) {
  _$jscoverage['/editor.js'].branchData['592'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['585'][1].init(1271, 12, '!lastElement');
function visit1176_585_1(result) {
  _$jscoverage['/editor.js'].branchData['585'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['580'][1].init(325, 12, '!lastElement');
function visit1175_580_1(result) {
  _$jscoverage['/editor.js'].branchData['580'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['576'][2].init(112, 13, '!i && element');
function visit1174_576_2(result) {
  _$jscoverage['/editor.js'].branchData['576'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['576'][1].init(112, 39, '!i && element || element[\'clone\'](TRUE)');
function visit1173_576_1(result) {
  _$jscoverage['/editor.js'].branchData['576'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['572'][1].init(826, 6, 'i >= 0');
function visit1172_572_1(result) {
  _$jscoverage['/editor.js'].branchData['572'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['566'][2].init(676, 18, 'ranges.length == 0');
function visit1171_566_2(result) {
  _$jscoverage['/editor.js'].branchData['566'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['566'][1].init(665, 29, '!ranges || ranges.length == 0');
function visit1170_566_1(result) {
  _$jscoverage['/editor.js'].branchData['566'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['558'][1].init(285, 34, 'selection && selection.getRanges()');
function visit1169_558_1(result) {
  _$jscoverage['/editor.js'].branchData['558'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['546'][1].init(47, 33, 'self.get(\'mode\') !== WYSIWYG_MODE');
function visit1168_546_1(result) {
  _$jscoverage['/editor.js'].branchData['546'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['515'][1].init(169, 65, '!self.__previousPath || !self.__previousPath.compare(currentPath)');
function visit1167_515_1(result) {
  _$jscoverage['/editor.js'].branchData['515'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['512'][1].init(74, 33, 'selection && !selection.isInvalid');
function visit1166_512_1(result) {
  _$jscoverage['/editor.js'].branchData['512'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['506'][1].init(46, 29, 'self.__checkSelectionChangeId');
function visit1165_506_1(result) {
  _$jscoverage['/editor.js'].branchData['506'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['485'][1].init(85, 15, 'self.__docReady');
function visit1164_485_1(result) {
  _$jscoverage['/editor.js'].branchData['485'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['471'][1].init(371, 9, 'ind != -1');
function visit1163_471_1(result) {
  _$jscoverage['/editor.js'].branchData['471'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['465'][1].init(21, 22, 'l.attr(\'href\') == link');
function visit1162_465_1(result) {
  _$jscoverage['/editor.js'].branchData['465'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['424'][1].init(242, 3, 'win');
function visit1161_424_1(result) {
  _$jscoverage['/editor.js'].branchData['424'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['421'][1].init(88, 29, 'self.get(\'customStyle\') || \'\'');
function visit1160_421_1(result) {
  _$jscoverage['/editor.js'].branchData['421'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['391'][1].init(597, 18, 'win && win.focus()');
function visit1159_391_1(result) {
  _$jscoverage['/editor.js'].branchData['391'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['387'][2].init(140, 32, 'win.parent && win.parent.focus()');
function visit1158_387_2(result) {
  _$jscoverage['/editor.js'].branchData['387'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['387'][1].init(133, 39, 'win && win.parent && win.parent.focus()');
function visit1157_387_1(result) {
  _$jscoverage['/editor.js'].branchData['387'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['384'][1].init(297, 9, '!UA[\'ie\']');
function visit1156_384_1(result) {
  _$jscoverage['/editor.js'].branchData['384'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['378'][1].init(128, 4, '!win');
function visit1155_378_1(result) {
  _$jscoverage['/editor.js'].branchData['378'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['361'][1].init(159, 5, 'range');
function visit1154_361_1(result) {
  _$jscoverage['/editor.js'].branchData['361'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['317'][1].init(772, 28, 'EMPTY_CONTENT_REG.test(html)');
function visit1153_317_1(result) {
  _$jscoverage['/editor.js'].branchData['317'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['308'][1].init(497, 6, 'format');
function visit1152_308_1(result) {
  _$jscoverage['/editor.js'].branchData['308'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['302'][2].init(220, 20, 'mode == WYSIWYG_MODE');
function visit1151_302_2(result) {
  _$jscoverage['/editor.js'].branchData['302'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['302'][1].init(220, 41, 'mode == WYSIWYG_MODE && self.isDocReady()');
function visit1150_302_1(result) {
  _$jscoverage['/editor.js'].branchData['302'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['299'][1].init(128, 17, 'mode == undefined');
function visit1149_299_1(result) {
  _$jscoverage['/editor.js'].branchData['299'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['280'][1].init(282, 42, 'htmlDataProcessor = self.htmlDataProcessor');
function visit1148_280_1(result) {
  _$jscoverage['/editor.js'].branchData['280'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['275'][1].init(115, 32, 'self.get(\'mode\') != WYSIWYG_MODE');
function visit1147_275_1(result) {
  _$jscoverage['/editor.js'].branchData['275'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['254'][1].init(196, 3, 'cmd');
function visit1146_254_1(result) {
  _$jscoverage['/editor.js'].branchData['254'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['163'][1].init(21, 15, 'control.destroy');
function visit1145_163_1(result) {
  _$jscoverage['/editor.js'].branchData['163'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['146'][1].init(356, 3, 'doc');
function visit1144_146_1(result) {
  _$jscoverage['/editor.js'].branchData['146'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['141'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1143_141_1(result) {
  _$jscoverage['/editor.js'].branchData['141'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['140'][1].init(162, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1142_140_1(result) {
  _$jscoverage['/editor.js'].branchData['140'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['129'][1].init(76, 20, 'v && self.__docReady');
function visit1141_129_1(result) {
  _$jscoverage['/editor.js'].branchData['129'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['116'][1].init(65, 6, 'iframe');
function visit1140_116_1(result) {
  _$jscoverage['/editor.js'].branchData['116'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['110'][1].init(140, 17, 'v == WYSIWYG_MODE');
function visit1139_110_1(result) {
  _$jscoverage['/editor.js'].branchData['110'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['101'][2].init(61, 40, 'statusBarEl && statusBarEl.outerHeight()');
function visit1138_101_2(result) {
  _$jscoverage['/editor.js'].branchData['101'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['101'][1].init(61, 45, 'statusBarEl && statusBarEl.outerHeight() || 0');
function visit1137_101_1(result) {
  _$jscoverage['/editor.js'].branchData['101'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['100'][2].init(266, 36, 'toolBarEl && toolBarEl.outerHeight()');
function visit1136_100_2(result) {
  _$jscoverage['/editor.js'].branchData['100'][2].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['100'][1].init(266, 41, 'toolBarEl && toolBarEl.outerHeight() || 0');
function visit1135_100_1(result) {
  _$jscoverage['/editor.js'].branchData['100'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['76'][1].init(72, 28, 'sel && sel.removeAllRanges()');
function visit1134_76_1(result) {
  _$jscoverage['/editor.js'].branchData['76'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['70'][1].init(101, 19, 'self.get(\'focused\')');
function visit1133_70_1(result) {
  _$jscoverage['/editor.js'].branchData['70'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['62'][1].init(42, 60, '(form = textarea[0].form) && (form = $(form))');
function visit1132_62_1(result) {
  _$jscoverage['/editor.js'].branchData['62'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].branchData['61'][1].init(169, 103, 'self.get(\'attachForm\') && (form = textarea[0].form) && (form = $(form))');
function visit1131_61_1(result) {
  _$jscoverage['/editor.js'].branchData['61'][1].ranCondition(result);
  return result;
}_$jscoverage['/editor.js'].lineData[6]++;
KISSY.add('editor', function(S, Node, iframeContentTpl, Editor, Utils, focusManager, Styles, zIndexManger, clipboard, enterKey, htmlDataProcessor, selectionFix) {
  _$jscoverage['/editor.js'].functionData[0]++;
  _$jscoverage['/editor.js'].lineData[7]++;
  var TRUE = true, undefined = undefined, FALSE = false, NULL = null, logger = S.getLogger('s/editor'), window = S.Env.host, document = window.document, UA = S.UA, IS_IE = UA['ie'], NodeType = Node.NodeType, $ = Node.all, HEIGHT = 'height', tryThese = Utils.tryThese, IFRAME_TPL = '<iframe' + ' class="{prefixCls}editor-iframe"' + ' frameborder="0" ' + ' title="kissy-editor" ' + ' allowTransparency="true" ' + ' {iframeSrc} ' + '>' + '</iframe>', EMPTY_CONTENT_REG = /^(?:<(p)>)?(?:(?:&nbsp;)|\s|<br[^>]*>)*(?:<\/\1>)?$/i;
  _$jscoverage['/editor.js'].lineData[30]++;
  Editor.Mode = {
  SOURCE_MODE: 0, 
  WYSIWYG_MODE: 1};
  _$jscoverage['/editor.js'].lineData[35]++;
  var WYSIWYG_MODE = 1;
  _$jscoverage['/editor.js'].lineData[37]++;
  Editor.addMembers({
  initializer: function() {
  _$jscoverage['/editor.js'].functionData[1]++;
  _$jscoverage['/editor.js'].lineData[39]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[40]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[41]++;
  self.__controls = {};
  _$jscoverage['/editor.js'].lineData[43]++;
  focusManager.register(self);
}, 
  renderUI: function() {
  _$jscoverage['/editor.js'].functionData[2]++;
  _$jscoverage['/editor.js'].lineData[48]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[49]++;
  clipboard.init(self);
  _$jscoverage['/editor.js'].lineData[50]++;
  enterKey.init(self);
  _$jscoverage['/editor.js'].lineData[51]++;
  htmlDataProcessor.init(self);
  _$jscoverage['/editor.js'].lineData[52]++;
  selectionFix.init(self);
}, 
  bindUI: function() {
  _$jscoverage['/editor.js'].functionData[3]++;
  _$jscoverage['/editor.js'].lineData[56]++;
  var self = this, form, prefixCls = self.get('prefixCls'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[61]++;
  if (visit1131_61_1(self.get('attachForm') && visit1132_62_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[64]++;
    form.on('submit', self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[67]++;
  function docReady() {
    _$jscoverage['/editor.js'].functionData[4]++;
    _$jscoverage['/editor.js'].lineData[68]++;
    self.detach('docReady', docReady);
    _$jscoverage['/editor.js'].lineData[70]++;
    if (visit1133_70_1(self.get('focused'))) {
      _$jscoverage['/editor.js'].lineData[71]++;
      self.focus();
    } else {
      _$jscoverage['/editor.js'].lineData[75]++;
      var sel = self.getSelection();
      _$jscoverage['/editor.js'].lineData[76]++;
      visit1134_76_1(sel && sel.removeAllRanges());
    }
  }
  _$jscoverage['/editor.js'].lineData[80]++;
  self.on('docReady', docReady);
  _$jscoverage['/editor.js'].lineData[82]++;
  self.on('blur', function() {
  _$jscoverage['/editor.js'].functionData[5]++;
  _$jscoverage['/editor.js'].lineData[83]++;
  self.$el.removeClass(prefixCls + 'editor-focused');
});
  _$jscoverage['/editor.js'].lineData[86]++;
  self.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[6]++;
  _$jscoverage['/editor.js'].lineData[87]++;
  self.$el.addClass(prefixCls + 'editor-focused');
});
}, 
  _onSetHeight: function(v) {
  _$jscoverage['/editor.js'].functionData[7]++;
  _$jscoverage['/editor.js'].lineData[94]++;
  var self = this, textareaEl = self.get('textarea'), toolBarEl = self.get("toolBarEl"), statusBarEl = self.get("statusBarEl");
  _$jscoverage['/editor.js'].lineData[98]++;
  v = parseInt(v, 10);
  _$jscoverage['/editor.js'].lineData[100]++;
  v -= (visit1135_100_1(visit1136_100_2(toolBarEl && toolBarEl.outerHeight()) || 0)) + (visit1137_101_1(visit1138_101_2(statusBarEl && statusBarEl.outerHeight()) || 0));
  _$jscoverage['/editor.js'].lineData[102]++;
  textareaEl.parent().css(HEIGHT, v);
  _$jscoverage['/editor.js'].lineData[103]++;
  textareaEl.css(HEIGHT, v);
}, 
  _onSetMode: function(v) {
  _$jscoverage['/editor.js'].functionData[8]++;
  _$jscoverage['/editor.js'].lineData[107]++;
  var self = this, iframe = self.get('iframe'), textarea = self.get('textarea');
  _$jscoverage['/editor.js'].lineData[110]++;
  if (visit1139_110_1(v == WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[111]++;
    self.setData(textarea.val());
    _$jscoverage['/editor.js'].lineData[112]++;
    textarea.hide();
    _$jscoverage['/editor.js'].lineData[113]++;
    self.fire("wysiwygMode");
  } else {
    _$jscoverage['/editor.js'].lineData[116]++;
    if (visit1140_116_1(iframe)) {
      _$jscoverage['/editor.js'].lineData[117]++;
      textarea.val(self.getFormatData(WYSIWYG_MODE));
      _$jscoverage['/editor.js'].lineData[118]++;
      iframe.hide();
    }
    _$jscoverage['/editor.js'].lineData[120]++;
    textarea.show();
    _$jscoverage['/editor.js'].lineData[121]++;
    self.fire("sourceMode");
  }
}, 
  _onSetFocused: function(v) {
  _$jscoverage['/editor.js'].functionData[9]++;
  _$jscoverage['/editor.js'].lineData[127]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[129]++;
  if (visit1141_129_1(v && self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[130]++;
    self.focus();
  }
}, 
  destructor: function() {
  _$jscoverage['/editor.js'].functionData[10]++;
  _$jscoverage['/editor.js'].lineData[135]++;
  var self = this, form, textarea = self.get('textarea'), doc = self.get('document');
  _$jscoverage['/editor.js'].lineData[140]++;
  if (visit1142_140_1(self.get('attachForm') && visit1143_141_1((form = textarea[0].form) && (form = $(form))))) {
    _$jscoverage['/editor.js'].lineData[143]++;
    form.detach("submit", self.sync, self);
  }
  _$jscoverage['/editor.js'].lineData[146]++;
  if (visit1144_146_1(doc)) {
    _$jscoverage['/editor.js'].lineData[147]++;
    var body = $(doc[0].body), documentElement = $(doc[0].documentElement), win = self.get('window');
    _$jscoverage['/editor.js'].lineData[151]++;
    focusManager.remove(self);
    _$jscoverage['/editor.js'].lineData[153]++;
    doc.detach();
    _$jscoverage['/editor.js'].lineData[155]++;
    documentElement.detach();
    _$jscoverage['/editor.js'].lineData[157]++;
    body.detach();
    _$jscoverage['/editor.js'].lineData[159]++;
    win.detach();
  }
  _$jscoverage['/editor.js'].lineData[162]++;
  S.each(self.__controls, function(control) {
  _$jscoverage['/editor.js'].functionData[11]++;
  _$jscoverage['/editor.js'].lineData[163]++;
  if (visit1145_163_1(control.destroy)) {
    _$jscoverage['/editor.js'].lineData[164]++;
    control.destroy();
  }
});
  _$jscoverage['/editor.js'].lineData[168]++;
  self.__commands = {};
  _$jscoverage['/editor.js'].lineData[169]++;
  self.__controls = {};
}, 
  getControl: function(id) {
  _$jscoverage['/editor.js'].functionData[12]++;
  _$jscoverage['/editor.js'].lineData[177]++;
  return this.__controls[id];
}, 
  sync: function() {
  _$jscoverage['/editor.js'].functionData[13]++;
  _$jscoverage['/editor.js'].lineData[184]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[185]++;
  self.get("textarea").val(self.getData());
}, 
  getControls: function() {
  _$jscoverage['/editor.js'].functionData[14]++;
  _$jscoverage['/editor.js'].lineData[193]++;
  return this.__controls;
}, 
  addControl: function(id, control) {
  _$jscoverage['/editor.js'].functionData[15]++;
  _$jscoverage['/editor.js'].lineData[202]++;
  this.__controls[id] = control;
}, 
  showDialog: function(name, args) {
  _$jscoverage['/editor.js'].functionData[16]++;
  _$jscoverage['/editor.js'].lineData[212]++;
  name += '/dialog';
  _$jscoverage['/editor.js'].lineData[213]++;
  var self = this, d = self.__controls[name];
  _$jscoverage['/editor.js'].lineData[215]++;
  d.show(args);
  _$jscoverage['/editor.js'].lineData[216]++;
  self.fire('dialogShow', {
  dialog: d.dialog, 
  "pluginDialog": d, 
  "dialogName": name});
}, 
  addCommand: function(name, obj) {
  _$jscoverage['/editor.js'].functionData[17]++;
  _$jscoverage['/editor.js'].lineData[230]++;
  this.__commands[name] = obj;
}, 
  hasCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[18]++;
  _$jscoverage['/editor.js'].lineData[239]++;
  return this.__commands[name];
}, 
  execCommand: function(name) {
  _$jscoverage['/editor.js'].functionData[19]++;
  _$jscoverage['/editor.js'].lineData[249]++;
  var self = this, cmd = self.__commands[name], args = S.makeArray(arguments);
  _$jscoverage['/editor.js'].lineData[252]++;
  args.shift();
  _$jscoverage['/editor.js'].lineData[253]++;
  args.unshift(self);
  _$jscoverage['/editor.js'].lineData[254]++;
  if (visit1146_254_1(cmd)) {
    _$jscoverage['/editor.js'].lineData[255]++;
    return cmd.exec.apply(cmd, args);
  } else {
    _$jscoverage['/editor.js'].lineData[257]++;
    logger.error(name + ': command not found');
    _$jscoverage['/editor.js'].lineData[258]++;
    return undefined;
  }
}, 
  queryCommandValue: function(name) {
  _$jscoverage['/editor.js'].functionData[20]++;
  _$jscoverage['/editor.js'].lineData[268]++;
  return this.execCommand(Utils.getQueryCmd(name));
}, 
  'setData': function(data) {
  _$jscoverage['/editor.js'].functionData[21]++;
  _$jscoverage['/editor.js'].lineData[272]++;
  var self = this, htmlDataProcessor, afterData = data;
  _$jscoverage['/editor.js'].lineData[275]++;
  if (visit1147_275_1(self.get('mode') != WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[277]++;
    self.get('textarea').val(data);
    _$jscoverage['/editor.js'].lineData[278]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[280]++;
  if (visit1148_280_1(htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[281]++;
    afterData = htmlDataProcessor.toDataFormat(data);
  }
  _$jscoverage['/editor.js'].lineData[284]++;
  clearIframeDocContent(self);
  _$jscoverage['/editor.js'].lineData[285]++;
  createIframe(self, afterData);
}, 
  getData: function(format, mode) {
  _$jscoverage['/editor.js'].functionData[22]++;
  _$jscoverage['/editor.js'].lineData[296]++;
  var self = this, htmlDataProcessor = self.htmlDataProcessor, html;
  _$jscoverage['/editor.js'].lineData[299]++;
  if (visit1149_299_1(mode == undefined)) {
    _$jscoverage['/editor.js'].lineData[300]++;
    mode = self.get('mode');
  }
  _$jscoverage['/editor.js'].lineData[302]++;
  if (visit1150_302_1(visit1151_302_2(mode == WYSIWYG_MODE) && self.isDocReady())) {
    _$jscoverage['/editor.js'].lineData[303]++;
    html = self.get('document')[0].body.innerHTML;
  } else {
    _$jscoverage['/editor.js'].lineData[305]++;
    html = htmlDataProcessor.toDataFormat(self.get('textarea').val());
  }
  _$jscoverage['/editor.js'].lineData[308]++;
  if (visit1152_308_1(format)) {
    _$jscoverage['/editor.js'].lineData[309]++;
    html = htmlDataProcessor.toHtml(html);
  } else {
    _$jscoverage['/editor.js'].lineData[311]++;
    html = htmlDataProcessor.toServer(html);
  }
  _$jscoverage['/editor.js'].lineData[313]++;
  html = S.trim(html);
  _$jscoverage['/editor.js'].lineData[317]++;
  if (visit1153_317_1(EMPTY_CONTENT_REG.test(html))) {
    _$jscoverage['/editor.js'].lineData[318]++;
    html = '';
  }
  _$jscoverage['/editor.js'].lineData[320]++;
  return html;
}, 
  getFormatData: function(mode) {
  _$jscoverage['/editor.js'].functionData[23]++;
  _$jscoverage['/editor.js'].lineData[330]++;
  return this.getData(1, mode);
}, 
  getDocHtml: function() {
  _$jscoverage['/editor.js'].functionData[24]++;
  _$jscoverage['/editor.js'].lineData[338]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[339]++;
  return prepareIFrameHTML(0, self.get('customStyle'), self.get('customLink'), self.getFormatData());
}, 
  getSelection: function() {
  _$jscoverage['/editor.js'].functionData[25]++;
  _$jscoverage['/editor.js'].lineData[348]++;
  return Editor.Selection.getSelection(this.get('document')[0]);
}, 
  'getSelectedHtml': function() {
  _$jscoverage['/editor.js'].functionData[26]++;
  _$jscoverage['/editor.js'].lineData[357]++;
  var self = this, range = self.getSelection().getRanges()[0], contents, html = '';
  _$jscoverage['/editor.js'].lineData[361]++;
  if (visit1154_361_1(range)) {
    _$jscoverage['/editor.js'].lineData[362]++;
    contents = range.cloneContents();
    _$jscoverage['/editor.js'].lineData[363]++;
    html = self.get('document')[0].createElement('div');
    _$jscoverage['/editor.js'].lineData[364]++;
    html.appendChild(contents);
    _$jscoverage['/editor.js'].lineData[365]++;
    html = html.innerHTML;
  }
  _$jscoverage['/editor.js'].lineData[367]++;
  return html;
}, 
  focus: function() {
  _$jscoverage['/editor.js'].functionData[27]++;
  _$jscoverage['/editor.js'].lineData[375]++;
  var self = this, win = self.get('window');
  _$jscoverage['/editor.js'].lineData[378]++;
  if (visit1155_378_1(!win)) {
    _$jscoverage['/editor.js'].lineData[379]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[381]++;
  var doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[382]++;
  win = win[0];
  _$jscoverage['/editor.js'].lineData[384]++;
  if (visit1156_384_1(!UA['ie'])) {
    _$jscoverage['/editor.js'].lineData[387]++;
    visit1157_387_1(win && visit1158_387_2(win.parent && win.parent.focus()));
  }
  _$jscoverage['/editor.js'].lineData[391]++;
  visit1159_391_1(win && win.focus());
  _$jscoverage['/editor.js'].lineData[393]++;
  try {
    _$jscoverage['/editor.js'].lineData[394]++;
    doc.body.focus();
  }  catch (e) {
}
  _$jscoverage['/editor.js'].lineData[398]++;
  self.notifySelectionChange();
}, 
  blur: function() {
  _$jscoverage['/editor.js'].functionData[28]++;
  _$jscoverage['/editor.js'].lineData[406]++;
  var self = this, win = self.get('window')[0];
  _$jscoverage['/editor.js'].lineData[408]++;
  win.blur();
  _$jscoverage['/editor.js'].lineData[409]++;
  self.get('document')[0].body.blur();
}, 
  addCustomStyle: function(cssText, id) {
  _$jscoverage['/editor.js'].functionData[29]++;
  _$jscoverage['/editor.js'].lineData[419]++;
  var self = this, win = self.get('window'), customStyle = visit1160_421_1(self.get('customStyle') || '');
  _$jscoverage['/editor.js'].lineData[422]++;
  customStyle += "\n" + cssText;
  _$jscoverage['/editor.js'].lineData[423]++;
  self.set('customStyle', customStyle);
  _$jscoverage['/editor.js'].lineData[424]++;
  if (visit1161_424_1(win)) {
    _$jscoverage['/editor.js'].lineData[425]++;
    win['addStyleSheet'](cssText, id);
  }
}, 
  removeCustomStyle: function(id) {
  _$jscoverage['/editor.js'].functionData[30]++;
  _$jscoverage['/editor.js'].lineData[435]++;
  this.get('document').on('#' + id).remove();
}, 
  addCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[31]++;
  _$jscoverage['/editor.js'].lineData[444]++;
  var self = this, customLink = self.get('customLink'), doc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[447]++;
  customLink.push(link);
  _$jscoverage['/editor.js'].lineData[448]++;
  self.set('customLink', customLink);
  _$jscoverage['/editor.js'].lineData[449]++;
  var elem = doc.createElement('link');
  _$jscoverage['/editor.js'].lineData[450]++;
  elem.rel = 'stylesheet';
  _$jscoverage['/editor.js'].lineData[451]++;
  doc.getElementsByTagName('head')[0].appendChild(elem);
  _$jscoverage['/editor.js'].lineData[452]++;
  elem.href = link;
}, 
  removeCustomLink: function(link) {
  _$jscoverage['/editor.js'].functionData[32]++;
  _$jscoverage['/editor.js'].lineData[461]++;
  var self = this, doc = self.get('document'), links = doc.all('link');
  _$jscoverage['/editor.js'].lineData[464]++;
  links.each(function(l) {
  _$jscoverage['/editor.js'].functionData[33]++;
  _$jscoverage['/editor.js'].lineData[465]++;
  if (visit1162_465_1(l.attr('href') == link)) {
    _$jscoverage['/editor.js'].lineData[466]++;
    l.remove();
  }
});
  _$jscoverage['/editor.js'].lineData[469]++;
  var cls = self.get('customLink'), ind = S.indexOf(link, cls);
  _$jscoverage['/editor.js'].lineData[471]++;
  if (visit1163_471_1(ind != -1)) {
    _$jscoverage['/editor.js'].lineData[472]++;
    cls.splice(ind, 1);
  }
}, 
  docReady: function(func) {
  _$jscoverage['/editor.js'].functionData[34]++;
  _$jscoverage['/editor.js'].lineData[483]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[484]++;
  self.on('docReady', func);
  _$jscoverage['/editor.js'].lineData[485]++;
  if (visit1164_485_1(self.__docReady)) {
    _$jscoverage['/editor.js'].lineData[486]++;
    func.call(self);
  }
}, 
  isDocReady: function() {
  _$jscoverage['/editor.js'].functionData[35]++;
  _$jscoverage['/editor.js'].lineData[496]++;
  return this.__docReady;
}, 
  checkSelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[36]++;
  _$jscoverage['/editor.js'].lineData[505]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[506]++;
  if (visit1165_506_1(self.__checkSelectionChangeId)) {
    _$jscoverage['/editor.js'].lineData[507]++;
    clearTimeout(self.__checkSelectionChangeId);
  }
  _$jscoverage['/editor.js'].lineData[510]++;
  self.__checkSelectionChangeId = setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[37]++;
  _$jscoverage['/editor.js'].lineData[511]++;
  var selection = self.getSelection();
  _$jscoverage['/editor.js'].lineData[512]++;
  if (visit1166_512_1(selection && !selection.isInvalid)) {
    _$jscoverage['/editor.js'].lineData[513]++;
    var startElement = selection.getStartElement(), currentPath = new Editor.ElementPath(startElement);
    _$jscoverage['/editor.js'].lineData[515]++;
    if (visit1167_515_1(!self.__previousPath || !self.__previousPath.compare(currentPath))) {
      _$jscoverage['/editor.js'].lineData[516]++;
      self.__previousPath = currentPath;
      _$jscoverage['/editor.js'].lineData[517]++;
      self.fire('selectionChange', {
  selection: selection, 
  path: currentPath, 
  element: startElement});
    }
  }
}, 100);
}, 
  notifySelectionChange: function() {
  _$jscoverage['/editor.js'].functionData[38]++;
  _$jscoverage['/editor.js'].lineData[533]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[534]++;
  self.__previousPath = NULL;
  _$jscoverage['/editor.js'].lineData[535]++;
  self.checkSelectionChange();
}, 
  insertElement: function(element) {
  _$jscoverage['/editor.js'].functionData[39]++;
  _$jscoverage['/editor.js'].lineData[544]++;
  var self = this;
  _$jscoverage['/editor.js'].lineData[546]++;
  if (visit1168_546_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[547]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[550]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[552]++;
  var clone, elementName = element['nodeName'](), xhtml_dtd = Editor.XHTML_DTD, isBlock = xhtml_dtd['$block'][elementName], KER = Editor.RangeType, selection = self.getSelection(), ranges = visit1169_558_1(selection && selection.getRanges()), range, notWhitespaceEval, i, next, nextName, lastElement;
  _$jscoverage['/editor.js'].lineData[566]++;
  if (visit1170_566_1(!ranges || visit1171_566_2(ranges.length == 0))) {
    _$jscoverage['/editor.js'].lineData[567]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[570]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[572]++;
  for (i = ranges.length - 1; visit1172_572_1(i >= 0); i--) {
    _$jscoverage['/editor.js'].lineData[573]++;
    range = ranges[i];
    _$jscoverage['/editor.js'].lineData[576]++;
    clone = visit1173_576_1(visit1174_576_2(!i && element) || element['clone'](TRUE));
    _$jscoverage['/editor.js'].lineData[577]++;
    range.insertNodeByDtd(clone);
    _$jscoverage['/editor.js'].lineData[580]++;
    if (visit1175_580_1(!lastElement)) {
      _$jscoverage['/editor.js'].lineData[581]++;
      lastElement = clone;
    }
  }
  _$jscoverage['/editor.js'].lineData[585]++;
  if (visit1176_585_1(!lastElement)) {
    _$jscoverage['/editor.js'].lineData[586]++;
    return undefined;
  }
  _$jscoverage['/editor.js'].lineData[589]++;
  range.moveToPosition(lastElement, KER.POSITION_AFTER_END);
  _$jscoverage['/editor.js'].lineData[592]++;
  if (visit1177_592_1(isBlock)) {
    _$jscoverage['/editor.js'].lineData[593]++;
    notWhitespaceEval = Editor.Walker.whitespaces(true);
    _$jscoverage['/editor.js'].lineData[594]++;
    next = lastElement.next(notWhitespaceEval, 1);
    _$jscoverage['/editor.js'].lineData[595]++;
    nextName = visit1178_595_1(next && visit1179_595_2(visit1180_595_3(next[0].nodeType == NodeType.ELEMENT_NODE) && next.nodeName()));
    _$jscoverage['/editor.js'].lineData[598]++;
    if (visit1181_598_1(nextName && visit1182_599_1(xhtml_dtd.$block[nextName] && xhtml_dtd[nextName]['#text']))) {
      _$jscoverage['/editor.js'].lineData[601]++;
      range.moveToElementEditablePosition(next);
    }
  }
  _$jscoverage['/editor.js'].lineData[604]++;
  selection.selectRanges([range]);
  _$jscoverage['/editor.js'].lineData[605]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[608]++;
  if (visit1183_608_1(clone && visit1184_608_2(clone[0].nodeType == 1))) {
    _$jscoverage['/editor.js'].lineData[609]++;
    clone.scrollIntoView(undefined, {
  alignWithTop: false, 
  allowHorizontalScroll: true, 
  onlyScrollIfNeeded: true});
  }
  _$jscoverage['/editor.js'].lineData[615]++;
  saveLater.call(self);
  _$jscoverage['/editor.js'].lineData[616]++;
  return clone;
}, 
  insertHtml: function(data, dataFilter) {
  _$jscoverage['/editor.js'].functionData[40]++;
  _$jscoverage['/editor.js'].lineData[626]++;
  var self = this, htmlDataProcessor, editorDoc = self.get('document')[0];
  _$jscoverage['/editor.js'].lineData[630]++;
  if (visit1185_630_1(self.get('mode') !== WYSIWYG_MODE)) {
    _$jscoverage['/editor.js'].lineData[631]++;
    return;
  }
  _$jscoverage['/editor.js'].lineData[634]++;
  if (visit1186_634_1(htmlDataProcessor = self.htmlDataProcessor)) {
    _$jscoverage['/editor.js'].lineData[635]++;
    data = htmlDataProcessor.toDataFormat(data, dataFilter);
  }
  _$jscoverage['/editor.js'].lineData[638]++;
  self.focus();
  _$jscoverage['/editor.js'].lineData[639]++;
  self.execCommand('save');
  _$jscoverage['/editor.js'].lineData[643]++;
  if (visit1187_643_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[644]++;
    var $sel = editorDoc.selection;
    _$jscoverage['/editor.js'].lineData[645]++;
    if (visit1188_645_1($sel.type == 'Control')) {
      _$jscoverage['/editor.js'].lineData[646]++;
      $sel.clear();
    }
    _$jscoverage['/editor.js'].lineData[648]++;
    try {
      _$jscoverage['/editor.js'].lineData[649]++;
      $sel.createRange().pasteHTML(data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[651]++;
  logger.error('insertHtml error in ie');
}
  } else {
    _$jscoverage['/editor.js'].lineData[658]++;
    try {
      _$jscoverage['/editor.js'].lineData[659]++;
      editorDoc.execCommand('inserthtml', FALSE, data);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[661]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[41]++;
  _$jscoverage['/editor.js'].lineData[664]++;
  if (visit1189_664_1(self.getSelection().getRanges().length == 0)) {
    _$jscoverage['/editor.js'].lineData[665]++;
    var r = new Editor.Range(editorDoc), node = $(editorDoc.body).first(function(el) {
  _$jscoverage['/editor.js'].functionData[42]++;
  _$jscoverage['/editor.js'].lineData[667]++;
  return visit1190_667_1(visit1191_667_2(el.nodeType == 1) && visit1192_667_3(el.nodeName.toLowerCase() != 'br'));
});
    _$jscoverage['/editor.js'].lineData[669]++;
    if (visit1193_669_1(!node)) {
      _$jscoverage['/editor.js'].lineData[670]++;
      node = $(editorDoc.createElement('p'));
      _$jscoverage['/editor.js'].lineData[671]++;
      node._4e_appendBogus().appendTo(editorDoc.body);
    }
    _$jscoverage['/editor.js'].lineData[673]++;
    r.setStartAt(node, Editor.RangeType.POSITION_AFTER_START);
    _$jscoverage['/editor.js'].lineData[674]++;
    r.select();
  }
  _$jscoverage['/editor.js'].lineData[676]++;
  editorDoc.execCommand('inserthtml', FALSE, data);
}, 50);
}
  }
  _$jscoverage['/editor.js'].lineData[682]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[43]++;
  _$jscoverage['/editor.js'].lineData[683]++;
  self.getSelection().scrollIntoView();
}, 50);
  _$jscoverage['/editor.js'].lineData[685]++;
  saveLater.call(self);
}});
  _$jscoverage['/editor.js'].lineData[697]++;
  Editor.decorate = function(textarea, cfg) {
  _$jscoverage['/editor.js'].functionData[44]++;
  _$jscoverage['/editor.js'].lineData[698]++;
  cfg = visit1194_698_1(cfg || {});
  _$jscoverage['/editor.js'].lineData[699]++;
  textarea = $(textarea);
  _$jscoverage['/editor.js'].lineData[700]++;
  var textareaAttrs = cfg.textareaAttrs = visit1195_700_1(cfg.textareaAttrs || {});
  _$jscoverage['/editor.js'].lineData[701]++;
  var width = textarea.style('width');
  _$jscoverage['/editor.js'].lineData[702]++;
  var height = textarea.style('height');
  _$jscoverage['/editor.js'].lineData[703]++;
  var name = textarea.attr('name');
  _$jscoverage['/editor.js'].lineData[704]++;
  if (visit1196_704_1(width)) {
    _$jscoverage['/editor.js'].lineData[705]++;
    cfg.width = visit1197_705_1(cfg.width || width);
  }
  _$jscoverage['/editor.js'].lineData[707]++;
  if (visit1198_707_1(height)) {
    _$jscoverage['/editor.js'].lineData[708]++;
    cfg.height = visit1199_708_1(cfg.height || height);
  }
  _$jscoverage['/editor.js'].lineData[710]++;
  if (visit1200_710_1(name)) {
    _$jscoverage['/editor.js'].lineData[711]++;
    textareaAttrs.name = name;
  }
  _$jscoverage['/editor.js'].lineData[713]++;
  cfg.data = visit1201_713_1(cfg.data || textarea.val());
  _$jscoverage['/editor.js'].lineData[714]++;
  cfg.elBefore = textarea;
  _$jscoverage['/editor.js'].lineData[715]++;
  var editor = new Editor(cfg).render();
  _$jscoverage['/editor.js'].lineData[716]++;
  textarea.remove();
  _$jscoverage['/editor.js'].lineData[717]++;
  return editor;
};
  _$jscoverage['/editor.js'].lineData[724]++;
  Editor["_initIframe"] = function(id) {
  _$jscoverage['/editor.js'].functionData[45]++;
  _$jscoverage['/editor.js'].lineData[725]++;
  var self = focusManager.getInstance(id), $doc = self.get('document'), doc = $doc[0], script = $doc.one('#ke_active_script');
  _$jscoverage['/editor.js'].lineData[731]++;
  script.remove();
  _$jscoverage['/editor.js'].lineData[733]++;
  fixByBindIframeDoc(self);
  _$jscoverage['/editor.js'].lineData[735]++;
  var body = doc.body;
  _$jscoverage['/editor.js'].lineData[737]++;
  var $body = $(body);
  _$jscoverage['/editor.js'].lineData[759]++;
  if (visit1202_759_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[761]++;
    body['hideFocus'] = TRUE;
    _$jscoverage['/editor.js'].lineData[764]++;
    body.disabled = TRUE;
    _$jscoverage['/editor.js'].lineData[765]++;
    body['contentEditable'] = TRUE;
    _$jscoverage['/editor.js'].lineData[766]++;
    body.removeAttribute('disabled');
  } else {
    _$jscoverage['/editor.js'].lineData[770]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[46]++;
  _$jscoverage['/editor.js'].lineData[772]++;
  if (visit1203_772_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[773]++;
    body['contentEditable'] = TRUE;
  } else {
    _$jscoverage['/editor.js'].lineData[775]++;
    if (visit1204_775_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[776]++;
      body.parentNode['contentEditable'] = TRUE;
    } else {
      _$jscoverage['/editor.js'].lineData[778]++;
      doc['designMode'] = 'on';
    }
  }
}, 0);
  }
  _$jscoverage['/editor.js'].lineData[785]++;
  if (visit1205_794_1(UA['gecko'] || UA['opera'])) {
    _$jscoverage['/editor.js'].lineData[796]++;
    var htmlElement = doc.documentElement;
    _$jscoverage['/editor.js'].lineData[797]++;
    $(htmlElement).on('mousedown', function(evt) {
  _$jscoverage['/editor.js'].functionData[47]++;
  _$jscoverage['/editor.js'].lineData[804]++;
  var t = evt.target;
  _$jscoverage['/editor.js'].lineData[805]++;
  if (visit1206_805_1(t == htmlElement)) {
    _$jscoverage['/editor.js'].lineData[806]++;
    if (visit1207_806_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[807]++;
      blinkCursor(doc, FALSE);
    }
    _$jscoverage['/editor.js'].lineData[814]++;
    self.activateGecko();
  }
});
  }
  _$jscoverage['/editor.js'].lineData[820]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[48]++;
  _$jscoverage['/editor.js'].lineData[829]++;
  if (visit1208_829_1(IS_IE)) {
    _$jscoverage['/editor.js'].lineData[830]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[49]++;
  _$jscoverage['/editor.js'].lineData[831]++;
  if (visit1209_831_1(doc)) {
    _$jscoverage['/editor.js'].lineData[832]++;
    body.runtimeStyle['marginBottom'] = '0px';
    _$jscoverage['/editor.js'].lineData[833]++;
    body.runtimeStyle['marginBottom'] = '';
  }
}, 1000);
  }
}, 0);
  _$jscoverage['/editor.js'].lineData[840]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[50]++;
  _$jscoverage['/editor.js'].lineData[841]++;
  self.__docReady = 1;
  _$jscoverage['/editor.js'].lineData[842]++;
  self.fire('docReady');
  _$jscoverage['/editor.js'].lineData[846]++;
  var disableObjectResizing = self.get('disableObjectResizing'), disableInlineTableEditing = self.get('disableInlineTableEditing');
  _$jscoverage['/editor.js'].lineData[848]++;
  if (visit1210_848_1(disableObjectResizing || disableInlineTableEditing)) {
    _$jscoverage['/editor.js'].lineData[850]++;
    try {
      _$jscoverage['/editor.js'].lineData[851]++;
      doc.execCommand('enableObjectResizing', FALSE, !disableObjectResizing);
      _$jscoverage['/editor.js'].lineData[852]++;
      doc.execCommand('enableInlineTableEditing', FALSE, !disableInlineTableEditing);
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[858]++;
  $body.on(IS_IE ? 'resizestart' : 'resize', function(evt) {
  _$jscoverage['/editor.js'].functionData[51]++;
  _$jscoverage['/editor.js'].lineData[859]++;
  var t = new Node(evt.target);
  _$jscoverage['/editor.js'].lineData[860]++;
  if (visit1211_860_1(disableObjectResizing || (visit1212_861_1(visit1213_861_2(t.nodeName() === 'table') && disableInlineTableEditing)))) {
    _$jscoverage['/editor.js'].lineData[863]++;
    evt.preventDefault();
  }
});
}
  }
}, 10);
};
  _$jscoverage['/editor.js'].lineData[873]++;
  function blinkCursor(doc, retry) {
    _$jscoverage['/editor.js'].functionData[52]++;
    _$jscoverage['/editor.js'].lineData[874]++;
    var body = doc.body;
    _$jscoverage['/editor.js'].lineData[875]++;
    tryThese(function() {
  _$jscoverage['/editor.js'].functionData[53]++;
  _$jscoverage['/editor.js'].lineData[877]++;
  doc['designMode'] = 'on';
  _$jscoverage['/editor.js'].lineData[879]++;
  setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[54]++;
  _$jscoverage['/editor.js'].lineData[880]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[881]++;
  body.focus();
  _$jscoverage['/editor.js'].lineData[883]++;
  if (visit1214_883_1(!arguments.callee.retry)) {
    _$jscoverage['/editor.js'].lineData[884]++;
    arguments.callee.retry = TRUE;
  }
}, 50);
}, function() {
  _$jscoverage['/editor.js'].functionData[55]++;
  _$jscoverage['/editor.js'].lineData[890]++;
  doc['designMode'] = 'off';
  _$jscoverage['/editor.js'].lineData[891]++;
  body.setAttribute('contentEditable', false);
  _$jscoverage['/editor.js'].lineData[892]++;
  body.setAttribute('contentEditable', true);
  _$jscoverage['/editor.js'].lineData[894]++;
  visit1215_894_1(!retry && blinkCursor(doc, 1));
});
  }
  _$jscoverage['/editor.js'].lineData[899]++;
  function fixByBindIframeDoc(self) {
    _$jscoverage['/editor.js'].functionData[56]++;
    _$jscoverage['/editor.js'].lineData[900]++;
    var iframe = self.get('iframe'), textarea = self.get('textarea')[0], $win = self.get('window'), $doc = self.get('document'), doc = $doc[0];
    _$jscoverage['/editor.js'].lineData[910]++;
    if (visit1216_910_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[911]++;
      $doc.on('click', function(ev) {
  _$jscoverage['/editor.js'].functionData[57]++;
  _$jscoverage['/editor.js'].lineData[912]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[913]++;
  if (visit1217_913_1(S.inArray(control.nodeName(), ['input', 'select']))) {
    _$jscoverage['/editor.js'].lineData[914]++;
    ev.preventDefault();
  }
});
      _$jscoverage['/editor.js'].lineData[918]++;
      $doc.on('mouseup', function(ev) {
  _$jscoverage['/editor.js'].functionData[58]++;
  _$jscoverage['/editor.js'].lineData[919]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[920]++;
  if (visit1218_920_1(S.inArray(control.nodeName(), ['input', 'textarea']))) {
    _$jscoverage['/editor.js'].lineData[921]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[927]++;
    if (visit1219_927_1(UA['gecko'] || visit1220_927_2(IS_IE || UA['opera']))) {
      _$jscoverage['/editor.js'].lineData[928]++;
      var focusGrabber;
      _$jscoverage['/editor.js'].lineData[929]++;
      focusGrabber = new Node('<span ' + 'tabindex="-1" ' + 'style="position:absolute; left:-10000"' + ' role="presentation"' + '></span>').insertAfter(textarea);
      _$jscoverage['/editor.js'].lineData[936]++;
      focusGrabber.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[59]++;
  _$jscoverage['/editor.js'].lineData[937]++;
  self.focus();
});
      _$jscoverage['/editor.js'].lineData[939]++;
      self.activateGecko = function() {
  _$jscoverage['/editor.js'].functionData[60]++;
  _$jscoverage['/editor.js'].lineData[940]++;
  if (visit1221_940_1(UA['gecko'] && self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[941]++;
    focusGrabber[0].focus();
  }
};
      _$jscoverage['/editor.js'].lineData[943]++;
      self.on('destroy', function() {
  _$jscoverage['/editor.js'].functionData[61]++;
  _$jscoverage['/editor.js'].lineData[944]++;
  focusGrabber.detach();
  _$jscoverage['/editor.js'].lineData[945]++;
  focusGrabber.remove();
});
    }
    _$jscoverage['/editor.js'].lineData[949]++;
    $win.on('focus', function() {
  _$jscoverage['/editor.js'].functionData[62]++;
  _$jscoverage['/editor.js'].lineData[955]++;
  if (visit1222_955_1(UA['gecko'])) {
    _$jscoverage['/editor.js'].lineData[956]++;
    blinkCursor(doc, FALSE);
  } else {
    _$jscoverage['/editor.js'].lineData[958]++;
    if (visit1223_958_1(UA['opera'])) {
      _$jscoverage['/editor.js'].lineData[959]++;
      doc.body.focus();
    }
  }
  _$jscoverage['/editor.js'].lineData[962]++;
  self.notifySelectionChange();
});
    _$jscoverage['/editor.js'].lineData[965]++;
    if (visit1224_965_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[969]++;
      $doc.on('mousedown', function() {
  _$jscoverage['/editor.js'].functionData[63]++;
  _$jscoverage['/editor.js'].lineData[970]++;
  if (visit1225_970_1(!self.__iframeFocus)) {
    _$jscoverage['/editor.js'].lineData[971]++;
    blinkCursor(doc, FALSE);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[976]++;
    if (visit1226_976_1(IS_IE)) {
      _$jscoverage['/editor.js'].lineData[982]++;
      $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[64]++;
  _$jscoverage['/editor.js'].lineData[983]++;
  var keyCode = evt.keyCode;
  _$jscoverage['/editor.js'].lineData[985]++;
  if (visit1227_985_1(keyCode in {
  8: 1, 
  46: 1})) {
    _$jscoverage['/editor.js'].lineData[986]++;
    var sel = self.getSelection(), control = sel.getSelectedElement();
    _$jscoverage['/editor.js'].lineData[988]++;
    if (visit1228_988_1(control)) {
      _$jscoverage['/editor.js'].lineData[990]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[993]++;
      var bookmark = sel.getRanges()[0].createBookmark();
      _$jscoverage['/editor.js'].lineData[995]++;
      control.remove();
      _$jscoverage['/editor.js'].lineData[996]++;
      sel.selectBookmarks([bookmark]);
      _$jscoverage['/editor.js'].lineData[997]++;
      self.execCommand('save');
      _$jscoverage['/editor.js'].lineData[998]++;
      evt.preventDefault();
    }
  }
});
      _$jscoverage['/editor.js'].lineData[1006]++;
      if (visit1229_1006_1(doc.compatMode == 'CSS1Compat')) {
        _$jscoverage['/editor.js'].lineData[1007]++;
        var pageUpDownKeys = {
  33: 1, 
  34: 1};
        _$jscoverage['/editor.js'].lineData[1008]++;
        $doc.on('keydown', function(evt) {
  _$jscoverage['/editor.js'].functionData[65]++;
  _$jscoverage['/editor.js'].lineData[1009]++;
  if (visit1230_1009_1(evt.keyCode in pageUpDownKeys)) {
    _$jscoverage['/editor.js'].lineData[1010]++;
    setTimeout(function() {
  _$jscoverage['/editor.js'].functionData[66]++;
  _$jscoverage['/editor.js'].lineData[1011]++;
  self.getSelection().scrollIntoView();
}, 0);
  }
});
      }
    }
    _$jscoverage['/editor.js'].lineData[1019]++;
    if (visit1231_1019_1(UA['webkit'])) {
      _$jscoverage['/editor.js'].lineData[1020]++;
      $doc.on('mousedown', function(ev) {
  _$jscoverage['/editor.js'].functionData[67]++;
  _$jscoverage['/editor.js'].lineData[1021]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1022]++;
  if (visit1232_1022_1(S.inArray(control.nodeName(), ['img', 'hr', 'input', 'textarea', 'select']))) {
    _$jscoverage['/editor.js'].lineData[1023]++;
    self.getSelection().selectElement(control);
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1029]++;
    if (visit1233_1029_1(UA['gecko'])) {
      _$jscoverage['/editor.js'].lineData[1030]++;
      $doc.on('dragstart', function(ev) {
  _$jscoverage['/editor.js'].functionData[68]++;
  _$jscoverage['/editor.js'].lineData[1031]++;
  var control = new Node(ev.target);
  _$jscoverage['/editor.js'].lineData[1032]++;
  if (visit1234_1032_1(visit1235_1032_2(control.nodeName() === 'img') && /ke_/.test(control[0].className))) {
    _$jscoverage['/editor.js'].lineData[1034]++;
    ev.preventDefault();
  }
});
    }
    _$jscoverage['/editor.js'].lineData[1040]++;
    focusManager.add(self);
  }
  _$jscoverage['/editor.js'].lineData[1044]++;
  function prepareIFrameHTML(id, customStyle, customLink, data) {
    _$jscoverage['/editor.js'].functionData[69]++;
    _$jscoverage['/editor.js'].lineData[1045]++;
    var links = '', i, innerCssFile = Utils.debugUrl('theme/editor-iframe.css');
    _$jscoverage['/editor.js'].lineData[1048]++;
    customLink = customLink.concat([]);
    _$jscoverage['/editor.js'].lineData[1049]++;
    customLink.unshift(innerCssFile);
    _$jscoverage['/editor.js'].lineData[1050]++;
    for (i = 0; visit1236_1050_1(i < customLink.length); i++) {
      _$jscoverage['/editor.js'].lineData[1051]++;
      links += S.substitute('<link href="' + '{href}" rel="stylesheet" />', {
  href: customLink[i]});
    }
    _$jscoverage['/editor.js'].lineData[1055]++;
    return S.substitute(iframeContentTpl, {
  doctype: visit1237_1059_1(document.documentMode === 8) ? '<meta http-equiv="X-UA-Compatible" content="IE=7" />' : '', 
  title: '{title}', 
  links: links, 
  style: '<style>' + customStyle + '</style>', 
  data: visit1238_1066_1(data || ''), 
  script: id ? ('<script id="ke_active_script">' + ($(window).isCustomDomain() ? ('document.domain="' + document.domain + '";') : '') + 'parent.KISSY.require("editor")._initIframe("' + id + '");' + '</script>') : ''});
  }
  _$jscoverage['/editor.js'].lineData[1081]++;
  var saveLater = S.buffer(function() {
  _$jscoverage['/editor.js'].functionData[70]++;
  _$jscoverage['/editor.js'].lineData[1082]++;
  this.execCommand('save');
}, 50);
  _$jscoverage['/editor.js'].lineData[1085]++;
  function setUpIFrame(self, data) {
    _$jscoverage['/editor.js'].functionData[71]++;
    _$jscoverage['/editor.js'].lineData[1086]++;
    var iframe = self.get('iframe'), html = prepareIFrameHTML(self.get('id'), self.get('customStyle'), self.get('customLink'), data), iframeDom = iframe[0], win = iframeDom.contentWindow, doc;
    _$jscoverage['/editor.js'].lineData[1093]++;
    iframe.__loaded = 1;
    _$jscoverage['/editor.js'].lineData[1094]++;
    try {
      _$jscoverage['/editor.js'].lineData[1102]++;
      doc = win.document;
    }    catch (e) {
  _$jscoverage['/editor.js'].lineData[1107]++;
  iframeDom.src = iframeDom.src;
  _$jscoverage['/editor.js'].lineData[1110]++;
  if (visit1239_1110_1(IS_IE < 7)) {
    _$jscoverage['/editor.js'].lineData[1111]++;
    setTimeout(run, 10);
    _$jscoverage['/editor.js'].lineData[1112]++;
    return;
  }
}
    _$jscoverage['/editor.js'].lineData[1115]++;
    run();
    _$jscoverage['/editor.js'].lineData[1116]++;
    function run() {
      _$jscoverage['/editor.js'].functionData[72]++;
      _$jscoverage['/editor.js'].lineData[1117]++;
      doc = win.document;
      _$jscoverage['/editor.js'].lineData[1118]++;
      self.setInternal('document', new Node(doc));
      _$jscoverage['/editor.js'].lineData[1119]++;
      self.setInternal('window', new Node(win));
      _$jscoverage['/editor.js'].lineData[1120]++;
      iframe.detach();
      _$jscoverage['/editor.js'].lineData[1122]++;
      doc['open']('text/html', 'replace');
      _$jscoverage['/editor.js'].lineData[1123]++;
      doc.write(html);
      _$jscoverage['/editor.js'].lineData[1124]++;
      doc.close();
    }
  }
  _$jscoverage['/editor.js'].lineData[1128]++;
  function createIframe(self, afterData) {
    _$jscoverage['/editor.js'].functionData[73]++;
    _$jscoverage['/editor.js'].lineData[1132]++;
    var iframeSrc = visit1240_1132_1($(window).getEmptyIframeSrc() || '');
    _$jscoverage['/editor.js'].lineData[1133]++;
    if (visit1241_1133_1(iframeSrc)) {
      _$jscoverage['/editor.js'].lineData[1134]++;
      iframeSrc = ' src="' + iframeSrc + '" ';
    }
    _$jscoverage['/editor.js'].lineData[1136]++;
    var iframe = new Node(S.substitute(IFRAME_TPL, {
  iframeSrc: iframeSrc, 
  prefixCls: self.get('prefixCls')})), textarea = self.get('textarea');
    _$jscoverage['/editor.js'].lineData[1141]++;
    if (visit1242_1141_1(textarea.hasAttr('tabindex'))) {
      _$jscoverage['/editor.js'].lineData[1142]++;
      iframe.attr('tabindex', UA['webkit'] ? -1 : textarea.attr('tabindex'));
    }
    _$jscoverage['/editor.js'].lineData[1144]++;
    textarea.parent().prepend(iframe);
    _$jscoverage['/editor.js'].lineData[1145]++;
    self.set('iframe', iframe);
    _$jscoverage['/editor.js'].lineData[1146]++;
    self.__docReady = 0;
    _$jscoverage['/editor.js'].lineData[1148]++;
    if (visit1243_1148_1(UA['gecko'] && !iframe.__loaded)) {
      _$jscoverage['/editor.js'].lineData[1149]++;
      iframe.on('load', function() {
  _$jscoverage['/editor.js'].functionData[74]++;
  _$jscoverage['/editor.js'].lineData[1150]++;
  setUpIFrame(self, afterData);
}, self);
    } else {
      _$jscoverage['/editor.js'].lineData[1154]++;
      setUpIFrame(self, afterData);
    }
  }
  _$jscoverage['/editor.js'].lineData[1158]++;
  function clearIframeDocContent(self) {
    _$jscoverage['/editor.js'].functionData[75]++;
    _$jscoverage['/editor.js'].lineData[1159]++;
    if (visit1244_1159_1(!self.get('iframe'))) {
      _$jscoverage['/editor.js'].lineData[1160]++;
      return;
    }
    _$jscoverage['/editor.js'].lineData[1162]++;
    var iframe = self.get('iframe'), win = self.get('window'), doc = self.get('document'), domDoc = doc[0], documentElement = $(domDoc.documentElement), body = $(domDoc.body);
    _$jscoverage['/editor.js'].lineData[1168]++;
    S.each([doc, documentElement, body, win], function(el) {
  _$jscoverage['/editor.js'].functionData[76]++;
  _$jscoverage['/editor.js'].lineData[1169]++;
  el.detach();
});
    _$jscoverage['/editor.js'].lineData[1171]++;
    iframe.remove();
  }
  _$jscoverage['/editor.js'].lineData[1176]++;
  return Editor;
}, {
  requires: ['node', 'editor/iframe-content-tpl', 'editor/base', 'editor/utils', 'editor/focusManager', 'editor/styles', 'editor/z-index-manager', 'editor/clipboard', 'editor/enterKey', 'editor/htmlDataProcessor', 'editor/selectionFix', 'editor/plugin-meta']});
