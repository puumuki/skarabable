/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/mustache/mustache.js":
/*!*******************************************!*\
  !*** ./node_modules/mustache/mustache.js ***!
  \*******************************************/
/***/ (function(module) {

(function (global, factory) {
   true ? module.exports = factory() :
  0;
}(this, (function () { 'use strict';

  /*!
   * mustache.js - Logic-less {{mustache}} templates with JavaScript
   * http://github.com/janl/mustache.js
   */

  var objectToString = Object.prototype.toString;
  var isArray = Array.isArray || function isArrayPolyfill (object) {
    return objectToString.call(object) === '[object Array]';
  };

  function isFunction (object) {
    return typeof object === 'function';
  }

  /**
   * More correct typeof string handling array
   * which normally returns typeof 'object'
   */
  function typeStr (obj) {
    return isArray(obj) ? 'array' : typeof obj;
  }

  function escapeRegExp (string) {
    return string.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, '\\$&');
  }

  /**
   * Null safe way of checking whether or not an object,
   * including its prototype, has a given property
   */
  function hasProperty (obj, propName) {
    return obj != null && typeof obj === 'object' && (propName in obj);
  }

  /**
   * Safe way of detecting whether or not the given thing is a primitive and
   * whether it has the given property
   */
  function primitiveHasOwnProperty (primitive, propName) {
    return (
      primitive != null
      && typeof primitive !== 'object'
      && primitive.hasOwnProperty
      && primitive.hasOwnProperty(propName)
    );
  }

  // Workaround for https://issues.apache.org/jira/browse/COUCHDB-577
  // See https://github.com/janl/mustache.js/issues/189
  var regExpTest = RegExp.prototype.test;
  function testRegExp (re, string) {
    return regExpTest.call(re, string);
  }

  var nonSpaceRe = /\S/;
  function isWhitespace (string) {
    return !testRegExp(nonSpaceRe, string);
  }

  var entityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  function escapeHtml (string) {
    return String(string).replace(/[&<>"'`=\/]/g, function fromEntityMap (s) {
      return entityMap[s];
    });
  }

  var whiteRe = /\s*/;
  var spaceRe = /\s+/;
  var equalsRe = /\s*=/;
  var curlyRe = /\s*\}/;
  var tagRe = /#|\^|\/|>|\{|&|=|!/;

  /**
   * Breaks up the given `template` string into a tree of tokens. If the `tags`
   * argument is given here it must be an array with two string values: the
   * opening and closing tags used in the template (e.g. [ "<%", "%>" ]). Of
   * course, the default is to use mustaches (i.e. mustache.tags).
   *
   * A token is an array with at least 4 elements. The first element is the
   * mustache symbol that was used inside the tag, e.g. "#" or "&". If the tag
   * did not contain a symbol (i.e. {{myValue}}) this element is "name". For
   * all text that appears outside a symbol this element is "text".
   *
   * The second element of a token is its "value". For mustache tags this is
   * whatever else was inside the tag besides the opening symbol. For text tokens
   * this is the text itself.
   *
   * The third and fourth elements of the token are the start and end indices,
   * respectively, of the token in the original template.
   *
   * Tokens that are the root node of a subtree contain two more elements: 1) an
   * array of tokens in the subtree and 2) the index in the original template at
   * which the closing tag for that section begins.
   *
   * Tokens for partials also contain two more elements: 1) a string value of
   * indendation prior to that tag and 2) the index of that tag on that line -
   * eg a value of 2 indicates the partial is the third tag on this line.
   */
  function parseTemplate (template, tags) {
    if (!template)
      return [];
    var lineHasNonSpace = false;
    var sections = [];     // Stack to hold section tokens
    var tokens = [];       // Buffer to hold the tokens
    var spaces = [];       // Indices of whitespace tokens on the current line
    var hasTag = false;    // Is there a {{tag}} on the current line?
    var nonSpace = false;  // Is there a non-space char on the current line?
    var indentation = '';  // Tracks indentation for tags that use it
    var tagIndex = 0;      // Stores a count of number of tags encountered on a line

    // Strips all whitespace tokens array for the current line
    // if there was a {{#tag}} on it and otherwise only space.
    function stripSpace () {
      if (hasTag && !nonSpace) {
        while (spaces.length)
          delete tokens[spaces.pop()];
      } else {
        spaces = [];
      }

      hasTag = false;
      nonSpace = false;
    }

    var openingTagRe, closingTagRe, closingCurlyRe;
    function compileTags (tagsToCompile) {
      if (typeof tagsToCompile === 'string')
        tagsToCompile = tagsToCompile.split(spaceRe, 2);

      if (!isArray(tagsToCompile) || tagsToCompile.length !== 2)
        throw new Error('Invalid tags: ' + tagsToCompile);

      openingTagRe = new RegExp(escapeRegExp(tagsToCompile[0]) + '\\s*');
      closingTagRe = new RegExp('\\s*' + escapeRegExp(tagsToCompile[1]));
      closingCurlyRe = new RegExp('\\s*' + escapeRegExp('}' + tagsToCompile[1]));
    }

    compileTags(tags || mustache.tags);

    var scanner = new Scanner(template);

    var start, type, value, chr, token, openSection;
    while (!scanner.eos()) {
      start = scanner.pos;

      // Match any text between tags.
      value = scanner.scanUntil(openingTagRe);

      if (value) {
        for (var i = 0, valueLength = value.length; i < valueLength; ++i) {
          chr = value.charAt(i);

          if (isWhitespace(chr)) {
            spaces.push(tokens.length);
            indentation += chr;
          } else {
            nonSpace = true;
            lineHasNonSpace = true;
            indentation += ' ';
          }

          tokens.push([ 'text', chr, start, start + 1 ]);
          start += 1;

          // Check for whitespace on the current line.
          if (chr === '\n') {
            stripSpace();
            indentation = '';
            tagIndex = 0;
            lineHasNonSpace = false;
          }
        }
      }

      // Match the opening tag.
      if (!scanner.scan(openingTagRe))
        break;

      hasTag = true;

      // Get the tag type.
      type = scanner.scan(tagRe) || 'name';
      scanner.scan(whiteRe);

      // Get the tag value.
      if (type === '=') {
        value = scanner.scanUntil(equalsRe);
        scanner.scan(equalsRe);
        scanner.scanUntil(closingTagRe);
      } else if (type === '{') {
        value = scanner.scanUntil(closingCurlyRe);
        scanner.scan(curlyRe);
        scanner.scanUntil(closingTagRe);
        type = '&';
      } else {
        value = scanner.scanUntil(closingTagRe);
      }

      // Match the closing tag.
      if (!scanner.scan(closingTagRe))
        throw new Error('Unclosed tag at ' + scanner.pos);

      if (type == '>') {
        token = [ type, value, start, scanner.pos, indentation, tagIndex, lineHasNonSpace ];
      } else {
        token = [ type, value, start, scanner.pos ];
      }
      tagIndex++;
      tokens.push(token);

      if (type === '#' || type === '^') {
        sections.push(token);
      } else if (type === '/') {
        // Check section nesting.
        openSection = sections.pop();

        if (!openSection)
          throw new Error('Unopened section "' + value + '" at ' + start);

        if (openSection[1] !== value)
          throw new Error('Unclosed section "' + openSection[1] + '" at ' + start);
      } else if (type === 'name' || type === '{' || type === '&') {
        nonSpace = true;
      } else if (type === '=') {
        // Set the tags for the next time around.
        compileTags(value);
      }
    }

    stripSpace();

    // Make sure there are no open sections when we're done.
    openSection = sections.pop();

    if (openSection)
      throw new Error('Unclosed section "' + openSection[1] + '" at ' + scanner.pos);

    return nestTokens(squashTokens(tokens));
  }

  /**
   * Combines the values of consecutive text tokens in the given `tokens` array
   * to a single token.
   */
  function squashTokens (tokens) {
    var squashedTokens = [];

    var token, lastToken;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      if (token) {
        if (token[0] === 'text' && lastToken && lastToken[0] === 'text') {
          lastToken[1] += token[1];
          lastToken[3] = token[3];
        } else {
          squashedTokens.push(token);
          lastToken = token;
        }
      }
    }

    return squashedTokens;
  }

  /**
   * Forms the given array of `tokens` into a nested tree structure where
   * tokens that represent a section have two additional items: 1) an array of
   * all tokens that appear in that section and 2) the index in the original
   * template that represents the end of that section.
   */
  function nestTokens (tokens) {
    var nestedTokens = [];
    var collector = nestedTokens;
    var sections = [];

    var token, section;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      token = tokens[i];

      switch (token[0]) {
        case '#':
        case '^':
          collector.push(token);
          sections.push(token);
          collector = token[4] = [];
          break;
        case '/':
          section = sections.pop();
          section[5] = token[2];
          collector = sections.length > 0 ? sections[sections.length - 1][4] : nestedTokens;
          break;
        default:
          collector.push(token);
      }
    }

    return nestedTokens;
  }

  /**
   * A simple string scanner that is used by the template parser to find
   * tokens in template strings.
   */
  function Scanner (string) {
    this.string = string;
    this.tail = string;
    this.pos = 0;
  }

  /**
   * Returns `true` if the tail is empty (end of string).
   */
  Scanner.prototype.eos = function eos () {
    return this.tail === '';
  };

  /**
   * Tries to match the given regular expression at the current position.
   * Returns the matched text if it can match, the empty string otherwise.
   */
  Scanner.prototype.scan = function scan (re) {
    var match = this.tail.match(re);

    if (!match || match.index !== 0)
      return '';

    var string = match[0];

    this.tail = this.tail.substring(string.length);
    this.pos += string.length;

    return string;
  };

  /**
   * Skips all text until the given regular expression can be matched. Returns
   * the skipped string, which is the entire tail if no match can be made.
   */
  Scanner.prototype.scanUntil = function scanUntil (re) {
    var index = this.tail.search(re), match;

    switch (index) {
      case -1:
        match = this.tail;
        this.tail = '';
        break;
      case 0:
        match = '';
        break;
      default:
        match = this.tail.substring(0, index);
        this.tail = this.tail.substring(index);
    }

    this.pos += match.length;

    return match;
  };

  /**
   * Represents a rendering context by wrapping a view object and
   * maintaining a reference to the parent context.
   */
  function Context (view, parentContext) {
    this.view = view;
    this.cache = { '.': this.view };
    this.parent = parentContext;
  }

  /**
   * Creates a new context using the given view with this context
   * as the parent.
   */
  Context.prototype.push = function push (view) {
    return new Context(view, this);
  };

  /**
   * Returns the value of the given name in this context, traversing
   * up the context hierarchy if the value is absent in this context's view.
   */
  Context.prototype.lookup = function lookup (name) {
    var cache = this.cache;

    var value;
    if (cache.hasOwnProperty(name)) {
      value = cache[name];
    } else {
      var context = this, intermediateValue, names, index, lookupHit = false;

      while (context) {
        if (name.indexOf('.') > 0) {
          intermediateValue = context.view;
          names = name.split('.');
          index = 0;

          /**
           * Using the dot notion path in `name`, we descend through the
           * nested objects.
           *
           * To be certain that the lookup has been successful, we have to
           * check if the last object in the path actually has the property
           * we are looking for. We store the result in `lookupHit`.
           *
           * This is specially necessary for when the value has been set to
           * `undefined` and we want to avoid looking up parent contexts.
           *
           * In the case where dot notation is used, we consider the lookup
           * to be successful even if the last "object" in the path is
           * not actually an object but a primitive (e.g., a string, or an
           * integer), because it is sometimes useful to access a property
           * of an autoboxed primitive, such as the length of a string.
           **/
          while (intermediateValue != null && index < names.length) {
            if (index === names.length - 1)
              lookupHit = (
                hasProperty(intermediateValue, names[index])
                || primitiveHasOwnProperty(intermediateValue, names[index])
              );

            intermediateValue = intermediateValue[names[index++]];
          }
        } else {
          intermediateValue = context.view[name];

          /**
           * Only checking against `hasProperty`, which always returns `false` if
           * `context.view` is not an object. Deliberately omitting the check
           * against `primitiveHasOwnProperty` if dot notation is not used.
           *
           * Consider this example:
           * ```
           * Mustache.render("The length of a football field is {{#length}}{{length}}{{/length}}.", {length: "100 yards"})
           * ```
           *
           * If we were to check also against `primitiveHasOwnProperty`, as we do
           * in the dot notation case, then render call would return:
           *
           * "The length of a football field is 9."
           *
           * rather than the expected:
           *
           * "The length of a football field is 100 yards."
           **/
          lookupHit = hasProperty(context.view, name);
        }

        if (lookupHit) {
          value = intermediateValue;
          break;
        }

        context = context.parent;
      }

      cache[name] = value;
    }

    if (isFunction(value))
      value = value.call(this.view);

    return value;
  };

  /**
   * A Writer knows how to take a stream of tokens and render them to a
   * string, given a context. It also maintains a cache of templates to
   * avoid the need to parse the same template twice.
   */
  function Writer () {
    this.templateCache = {
      _cache: {},
      set: function set (key, value) {
        this._cache[key] = value;
      },
      get: function get (key) {
        return this._cache[key];
      },
      clear: function clear () {
        this._cache = {};
      }
    };
  }

  /**
   * Clears all cached templates in this writer.
   */
  Writer.prototype.clearCache = function clearCache () {
    if (typeof this.templateCache !== 'undefined') {
      this.templateCache.clear();
    }
  };

  /**
   * Parses and caches the given `template` according to the given `tags` or
   * `mustache.tags` if `tags` is omitted,  and returns the array of tokens
   * that is generated from the parse.
   */
  Writer.prototype.parse = function parse (template, tags) {
    var cache = this.templateCache;
    var cacheKey = template + ':' + (tags || mustache.tags).join(':');
    var isCacheEnabled = typeof cache !== 'undefined';
    var tokens = isCacheEnabled ? cache.get(cacheKey) : undefined;

    if (tokens == undefined) {
      tokens = parseTemplate(template, tags);
      isCacheEnabled && cache.set(cacheKey, tokens);
    }
    return tokens;
  };

  /**
   * High-level method that is used to render the given `template` with
   * the given `view`.
   *
   * The optional `partials` argument may be an object that contains the
   * names and templates of partials that are used in the template. It may
   * also be a function that is used to load partial templates on the fly
   * that takes a single argument: the name of the partial.
   *
   * If the optional `config` argument is given here, then it should be an
   * object with a `tags` attribute or an `escape` attribute or both.
   * If an array is passed, then it will be interpreted the same way as
   * a `tags` attribute on a `config` object.
   *
   * The `tags` attribute of a `config` object must be an array with two
   * string values: the opening and closing tags used in the template (e.g.
   * [ "<%", "%>" ]). The default is to mustache.tags.
   *
   * The `escape` attribute of a `config` object must be a function which
   * accepts a string as input and outputs a safely escaped string.
   * If an `escape` function is not provided, then an HTML-safe string
   * escaping function is used as the default.
   */
  Writer.prototype.render = function render (template, view, partials, config) {
    var tags = this.getConfigTags(config);
    var tokens = this.parse(template, tags);
    var context = (view instanceof Context) ? view : new Context(view, undefined);
    return this.renderTokens(tokens, context, partials, template, config);
  };

  /**
   * Low-level method that renders the given array of `tokens` using
   * the given `context` and `partials`.
   *
   * Note: The `originalTemplate` is only ever used to extract the portion
   * of the original template that was contained in a higher-order section.
   * If the template doesn't use higher-order sections, this argument may
   * be omitted.
   */
  Writer.prototype.renderTokens = function renderTokens (tokens, context, partials, originalTemplate, config) {
    var buffer = '';

    var token, symbol, value;
    for (var i = 0, numTokens = tokens.length; i < numTokens; ++i) {
      value = undefined;
      token = tokens[i];
      symbol = token[0];

      if (symbol === '#') value = this.renderSection(token, context, partials, originalTemplate, config);
      else if (symbol === '^') value = this.renderInverted(token, context, partials, originalTemplate, config);
      else if (symbol === '>') value = this.renderPartial(token, context, partials, config);
      else if (symbol === '&') value = this.unescapedValue(token, context);
      else if (symbol === 'name') value = this.escapedValue(token, context, config);
      else if (symbol === 'text') value = this.rawValue(token);

      if (value !== undefined)
        buffer += value;
    }

    return buffer;
  };

  Writer.prototype.renderSection = function renderSection (token, context, partials, originalTemplate, config) {
    var self = this;
    var buffer = '';
    var value = context.lookup(token[1]);

    // This function is used to render an arbitrary template
    // in the current context by higher-order sections.
    function subRender (template) {
      return self.render(template, context, partials, config);
    }

    if (!value) return;

    if (isArray(value)) {
      for (var j = 0, valueLength = value.length; j < valueLength; ++j) {
        buffer += this.renderTokens(token[4], context.push(value[j]), partials, originalTemplate, config);
      }
    } else if (typeof value === 'object' || typeof value === 'string' || typeof value === 'number') {
      buffer += this.renderTokens(token[4], context.push(value), partials, originalTemplate, config);
    } else if (isFunction(value)) {
      if (typeof originalTemplate !== 'string')
        throw new Error('Cannot use higher-order sections without the original template');

      // Extract the portion of the original template that the section contains.
      value = value.call(context.view, originalTemplate.slice(token[3], token[5]), subRender);

      if (value != null)
        buffer += value;
    } else {
      buffer += this.renderTokens(token[4], context, partials, originalTemplate, config);
    }
    return buffer;
  };

  Writer.prototype.renderInverted = function renderInverted (token, context, partials, originalTemplate, config) {
    var value = context.lookup(token[1]);

    // Use JavaScript's definition of falsy. Include empty arrays.
    // See https://github.com/janl/mustache.js/issues/186
    if (!value || (isArray(value) && value.length === 0))
      return this.renderTokens(token[4], context, partials, originalTemplate, config);
  };

  Writer.prototype.indentPartial = function indentPartial (partial, indentation, lineHasNonSpace) {
    var filteredIndentation = indentation.replace(/[^ \t]/g, '');
    var partialByNl = partial.split('\n');
    for (var i = 0; i < partialByNl.length; i++) {
      if (partialByNl[i].length && (i > 0 || !lineHasNonSpace)) {
        partialByNl[i] = filteredIndentation + partialByNl[i];
      }
    }
    return partialByNl.join('\n');
  };

  Writer.prototype.renderPartial = function renderPartial (token, context, partials, config) {
    if (!partials) return;
    var tags = this.getConfigTags(config);

    var value = isFunction(partials) ? partials(token[1]) : partials[token[1]];
    if (value != null) {
      var lineHasNonSpace = token[6];
      var tagIndex = token[5];
      var indentation = token[4];
      var indentedValue = value;
      if (tagIndex == 0 && indentation) {
        indentedValue = this.indentPartial(value, indentation, lineHasNonSpace);
      }
      var tokens = this.parse(indentedValue, tags);
      return this.renderTokens(tokens, context, partials, indentedValue, config);
    }
  };

  Writer.prototype.unescapedValue = function unescapedValue (token, context) {
    var value = context.lookup(token[1]);
    if (value != null)
      return value;
  };

  Writer.prototype.escapedValue = function escapedValue (token, context, config) {
    var escape = this.getConfigEscape(config) || mustache.escape;
    var value = context.lookup(token[1]);
    if (value != null)
      return (typeof value === 'number' && escape === mustache.escape) ? String(value) : escape(value);
  };

  Writer.prototype.rawValue = function rawValue (token) {
    return token[1];
  };

  Writer.prototype.getConfigTags = function getConfigTags (config) {
    if (isArray(config)) {
      return config;
    }
    else if (config && typeof config === 'object') {
      return config.tags;
    }
    else {
      return undefined;
    }
  };

  Writer.prototype.getConfigEscape = function getConfigEscape (config) {
    if (config && typeof config === 'object' && !isArray(config)) {
      return config.escape;
    }
    else {
      return undefined;
    }
  };

  var mustache = {
    name: 'mustache.js',
    version: '4.2.0',
    tags: [ '{{', '}}' ],
    clearCache: undefined,
    escape: undefined,
    parse: undefined,
    render: undefined,
    Scanner: undefined,
    Context: undefined,
    Writer: undefined,
    /**
     * Allows a user to override the default caching strategy, by providing an
     * object with set, get and clear methods. This can also be used to disable
     * the cache by setting it to the literal `undefined`.
     */
    set templateCache (cache) {
      defaultWriter.templateCache = cache;
    },
    /**
     * Gets the default or overridden caching object from the default writer.
     */
    get templateCache () {
      return defaultWriter.templateCache;
    }
  };

  // All high-level mustache.* functions use this writer.
  var defaultWriter = new Writer();

  /**
   * Clears all cached templates in the default writer.
   */
  mustache.clearCache = function clearCache () {
    return defaultWriter.clearCache();
  };

  /**
   * Parses and caches the given template in the default writer and returns the
   * array of tokens it contains. Doing this ahead of time avoids the need to
   * parse templates on the fly as they are rendered.
   */
  mustache.parse = function parse (template, tags) {
    return defaultWriter.parse(template, tags);
  };

  /**
   * Renders the `template` with the given `view`, `partials`, and `config`
   * using the default writer.
   */
  mustache.render = function render (template, view, partials, config) {
    if (typeof template !== 'string') {
      throw new TypeError('Invalid template! Template should be a "string" ' +
                          'but "' + typeStr(template) + '" was given as the first ' +
                          'argument for mustache#render(template, view, partials)');
    }

    return defaultWriter.render(template, view, partials, config);
  };

  // Export the escaping function so that the user may override it.
  // See https://github.com/janl/mustache.js/issues/244
  mustache.escape = escapeHtml;

  // Export these mainly for testing, but also for advanced usage.
  mustache.Scanner = Scanner;
  mustache.Context = Context;
  mustache.Writer = Writer;

  return mustache;

})));


/***/ }),

/***/ "./node_modules/performance-now/lib/performance-now.js":
/*!*************************************************************!*\
  !*** ./node_modules/performance-now/lib/performance-now.js ***!
  \*************************************************************/
/***/ (function(module) {

// Generated by CoffeeScript 1.12.2
(function() {
  var getNanoSeconds, hrtime, loadTime, moduleLoadTime, nodeLoadTime, upTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - nodeLoadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    moduleLoadTime = getNanoSeconds();
    upTime = process.uptime() * 1e9;
    nodeLoadTime = moduleLoadTime - upTime;
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

//# sourceMappingURL=performance-now.js.map


/***/ }),

/***/ "./node_modules/raf/index.js":
/*!***********************************!*\
  !*** ./node_modules/raf/index.js ***!
  \***********************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var now = __webpack_require__(/*! performance-now */ "./node_modules/performance-now/lib/performance-now.js")
  , root = typeof window === 'undefined' ? __webpack_require__.g : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = root['request' + suffix]
  , caf = root['cancel' + suffix] || root['cancelRequest' + suffix]

for(var i = 0; !raf && i < vendors.length; i++) {
  raf = root[vendors[i] + 'Request' + suffix]
  caf = root[vendors[i] + 'Cancel' + suffix]
      || root[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(root, fn)
}
module.exports.cancel = function() {
  caf.apply(root, arguments)
}
module.exports.polyfill = function(object) {
  if (!object) {
    object = root;
  }
  object.requestAnimationFrame = raf
  object.cancelAnimationFrame = caf
}


/***/ }),

/***/ "./node_modules/rgbcolor/index.js":
/*!****************************************!*\
  !*** ./node_modules/rgbcolor/index.js ***!
  \****************************************/
/***/ ((module) => {

/*
	Based on rgbcolor.js by Stoyan Stefanov <sstoo@gmail.com>
	http://www.phpied.com/rgb-color-parser-in-javascript/
*/

module.exports = function(color_string) {
    this.ok = false;
    this.alpha = 1.0;

    // strip any leading #
    if (color_string.charAt(0) == '#') { // remove # if any
        color_string = color_string.substr(1,6);
    }

    color_string = color_string.replace(/ /g,'');
    color_string = color_string.toLowerCase();

    // before getting into regexps, try simple matches
    // and overwrite the input
    var simple_colors = {
        aliceblue: 'f0f8ff',
        antiquewhite: 'faebd7',
        aqua: '00ffff',
        aquamarine: '7fffd4',
        azure: 'f0ffff',
        beige: 'f5f5dc',
        bisque: 'ffe4c4',
        black: '000000',
        blanchedalmond: 'ffebcd',
        blue: '0000ff',
        blueviolet: '8a2be2',
        brown: 'a52a2a',
        burlywood: 'deb887',
        cadetblue: '5f9ea0',
        chartreuse: '7fff00',
        chocolate: 'd2691e',
        coral: 'ff7f50',
        cornflowerblue: '6495ed',
        cornsilk: 'fff8dc',
        crimson: 'dc143c',
        cyan: '00ffff',
        darkblue: '00008b',
        darkcyan: '008b8b',
        darkgoldenrod: 'b8860b',
        darkgray: 'a9a9a9',
        darkgreen: '006400',
        darkkhaki: 'bdb76b',
        darkmagenta: '8b008b',
        darkolivegreen: '556b2f',
        darkorange: 'ff8c00',
        darkorchid: '9932cc',
        darkred: '8b0000',
        darksalmon: 'e9967a',
        darkseagreen: '8fbc8f',
        darkslateblue: '483d8b',
        darkslategray: '2f4f4f',
        darkturquoise: '00ced1',
        darkviolet: '9400d3',
        deeppink: 'ff1493',
        deepskyblue: '00bfff',
        dimgray: '696969',
        dodgerblue: '1e90ff',
        feldspar: 'd19275',
        firebrick: 'b22222',
        floralwhite: 'fffaf0',
        forestgreen: '228b22',
        fuchsia: 'ff00ff',
        gainsboro: 'dcdcdc',
        ghostwhite: 'f8f8ff',
        gold: 'ffd700',
        goldenrod: 'daa520',
        gray: '808080',
        green: '008000',
        greenyellow: 'adff2f',
        honeydew: 'f0fff0',
        hotpink: 'ff69b4',
        indianred : 'cd5c5c',
        indigo : '4b0082',
        ivory: 'fffff0',
        khaki: 'f0e68c',
        lavender: 'e6e6fa',
        lavenderblush: 'fff0f5',
        lawngreen: '7cfc00',
        lemonchiffon: 'fffacd',
        lightblue: 'add8e6',
        lightcoral: 'f08080',
        lightcyan: 'e0ffff',
        lightgoldenrodyellow: 'fafad2',
        lightgrey: 'd3d3d3',
        lightgreen: '90ee90',
        lightpink: 'ffb6c1',
        lightsalmon: 'ffa07a',
        lightseagreen: '20b2aa',
        lightskyblue: '87cefa',
        lightslateblue: '8470ff',
        lightslategray: '778899',
        lightsteelblue: 'b0c4de',
        lightyellow: 'ffffe0',
        lime: '00ff00',
        limegreen: '32cd32',
        linen: 'faf0e6',
        magenta: 'ff00ff',
        maroon: '800000',
        mediumaquamarine: '66cdaa',
        mediumblue: '0000cd',
        mediumorchid: 'ba55d3',
        mediumpurple: '9370d8',
        mediumseagreen: '3cb371',
        mediumslateblue: '7b68ee',
        mediumspringgreen: '00fa9a',
        mediumturquoise: '48d1cc',
        mediumvioletred: 'c71585',
        midnightblue: '191970',
        mintcream: 'f5fffa',
        mistyrose: 'ffe4e1',
        moccasin: 'ffe4b5',
        navajowhite: 'ffdead',
        navy: '000080',
        oldlace: 'fdf5e6',
        olive: '808000',
        olivedrab: '6b8e23',
        orange: 'ffa500',
        orangered: 'ff4500',
        orchid: 'da70d6',
        palegoldenrod: 'eee8aa',
        palegreen: '98fb98',
        paleturquoise: 'afeeee',
        palevioletred: 'd87093',
        papayawhip: 'ffefd5',
        peachpuff: 'ffdab9',
        peru: 'cd853f',
        pink: 'ffc0cb',
        plum: 'dda0dd',
        powderblue: 'b0e0e6',
        purple: '800080',
        rebeccapurple: '663399',
        red: 'ff0000',
        rosybrown: 'bc8f8f',
        royalblue: '4169e1',
        saddlebrown: '8b4513',
        salmon: 'fa8072',
        sandybrown: 'f4a460',
        seagreen: '2e8b57',
        seashell: 'fff5ee',
        sienna: 'a0522d',
        silver: 'c0c0c0',
        skyblue: '87ceeb',
        slateblue: '6a5acd',
        slategray: '708090',
        snow: 'fffafa',
        springgreen: '00ff7f',
        steelblue: '4682b4',
        tan: 'd2b48c',
        teal: '008080',
        thistle: 'd8bfd8',
        tomato: 'ff6347',
        turquoise: '40e0d0',
        violet: 'ee82ee',
        violetred: 'd02090',
        wheat: 'f5deb3',
        white: 'ffffff',
        whitesmoke: 'f5f5f5',
        yellow: 'ffff00',
        yellowgreen: '9acd32'
    };
    color_string = simple_colors[color_string] || color_string;
    // emd of simple type-in colors

    // array of color definition objects
    var color_defs = [
        {
            re: /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*((?:\d?\.)?\d)\)$/,
            example: ['rgba(123, 234, 45, 0.8)', 'rgba(255,234,245,1.0)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3]),
                    parseFloat(bits[4])
                ];
            }
        },
        {
            re: /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/,
            example: ['rgb(123, 234, 45)', 'rgb(255,234,245)'],
            process: function (bits){
                return [
                    parseInt(bits[1]),
                    parseInt(bits[2]),
                    parseInt(bits[3])
                ];
            }
        },
        {
            re: /^([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
            example: ['#00ff00', '336699'],
            process: function (bits){
                return [
                    parseInt(bits[1], 16),
                    parseInt(bits[2], 16),
                    parseInt(bits[3], 16)
                ];
            }
        },
        {
            re: /^([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
            example: ['#fb0', 'f0f'],
            process: function (bits){
                return [
                    parseInt(bits[1] + bits[1], 16),
                    parseInt(bits[2] + bits[2], 16),
                    parseInt(bits[3] + bits[3], 16)
                ];
            }
        }
    ];

    // search through the definitions to find a match
    for (var i = 0; i < color_defs.length; i++) {
        var re = color_defs[i].re;
        var processor = color_defs[i].process;
        var bits = re.exec(color_string);
        if (bits) {
            var channels = processor(bits);
            this.r = channels[0];
            this.g = channels[1];
            this.b = channels[2];
            if (channels.length > 3) {
                this.alpha = channels[3];
            }
            this.ok = true;
        }

    }

    // validate/cleanup values
    this.r = (this.r < 0 || isNaN(this.r)) ? 0 : ((this.r > 255) ? 255 : this.r);
    this.g = (this.g < 0 || isNaN(this.g)) ? 0 : ((this.g > 255) ? 255 : this.g);
    this.b = (this.b < 0 || isNaN(this.b)) ? 0 : ((this.b > 255) ? 255 : this.b);
    this.alpha = (this.alpha < 0) ? 0 : ((this.alpha > 1.0 || isNaN(this.alpha)) ? 1.0 : this.alpha);

    // some getters
    this.toRGB = function () {
        return 'rgb(' + this.r + ', ' + this.g + ', ' + this.b + ')';
    }
    this.toRGBA = function () {
        return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ', ' + this.alpha + ')';
    }
    this.toHex = function () {
        var r = this.r.toString(16);
        var g = this.g.toString(16);
        var b = this.b.toString(16);
        if (r.length == 1) r = '0' + r;
        if (g.length == 1) g = '0' + g;
        if (b.length == 1) b = '0' + b;
        return '#' + r + g + b;
    }

    // help
    this.getHelpXML = function () {

        var examples = new Array();
        // add regexps
        for (var i = 0; i < color_defs.length; i++) {
            var example = color_defs[i].example;
            for (var j = 0; j < example.length; j++) {
                examples[examples.length] = example[j];
            }
        }
        // add type-in colors
        for (var sc in simple_colors) {
            examples[examples.length] = sc;
        }

        var xml = document.createElement('ul');
        xml.setAttribute('id', 'rgbcolor-examples');
        for (var i = 0; i < examples.length; i++) {
            try {
                var list_item = document.createElement('li');
                var list_color = new RGBColor(examples[i]);
                var example_div = document.createElement('div');
                example_div.style.cssText =
                        'margin: 3px; '
                        + 'border: 1px solid black; '
                        + 'background:' + list_color.toHex() + '; '
                        + 'color:' + list_color.toHex()
                ;
                example_div.appendChild(document.createTextNode('test'));
                var list_item_value = document.createTextNode(
                    ' ' + examples[i] + ' -> ' + list_color.toRGB() + ' -> ' + list_color.toHex()
                );
                list_item.appendChild(example_div);
                list_item.appendChild(list_item_value);
                xml.appendChild(list_item);

            } catch(e){}
        }
        return xml;

    }

}


/***/ }),

/***/ "./node_modules/stackblur-canvas/dist/stackblur-es.js":
/*!************************************************************!*\
  !*** ./node_modules/stackblur-canvas/dist/stackblur-es.js ***!
  \************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "BlurStack": () => (/* binding */ BlurStack),
/* harmony export */   "canvasRGB": () => (/* binding */ processCanvasRGB),
/* harmony export */   "canvasRGBA": () => (/* binding */ processCanvasRGBA),
/* harmony export */   "image": () => (/* binding */ processImage),
/* harmony export */   "imageDataRGB": () => (/* binding */ processImageDataRGB),
/* harmony export */   "imageDataRGBA": () => (/* binding */ processImageDataRGBA)
/* harmony export */ });
function _typeof(obj) {
  "@babel/helpers - typeof";

  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

/* eslint-disable no-bitwise -- used for calculations */

/* eslint-disable unicorn/prefer-query-selector -- aiming at
  backward-compatibility */

/**
* StackBlur - a fast almost Gaussian Blur For Canvas
*
* In case you find this class useful - especially in commercial projects -
* I am not totally unhappy for a small donation to my PayPal account
* mario@quasimondo.de
*
* Or support me on flattr:
* {@link https://flattr.com/thing/72791/StackBlur-a-fast-almost-Gaussian-Blur-Effect-for-CanvasJavascript}.
*
* @module StackBlur
* @author Mario Klingemann
* Contact: mario@quasimondo.com
* Website: {@link http://www.quasimondo.com/StackBlurForCanvas/StackBlurDemo.html}
* Twitter: @quasimondo
*
* @copyright (c) 2010 Mario Klingemann
*
* Permission is hereby granted, free of charge, to any person
* obtaining a copy of this software and associated documentation
* files (the "Software"), to deal in the Software without
* restriction, including without limitation the rights to use,
* copy, modify, merge, publish, distribute, sublicense, and/or sell
* copies of the Software, and to permit persons to whom the
* Software is furnished to do so, subject to the following
* conditions:
*
* The above copyright notice and this permission notice shall be
* included in all copies or substantial portions of the Software.
*
* THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
* EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
* OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
* NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
* HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
* WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
* FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
* OTHER DEALINGS IN THE SOFTWARE.
*/
var mulTable = [512, 512, 456, 512, 328, 456, 335, 512, 405, 328, 271, 456, 388, 335, 292, 512, 454, 405, 364, 328, 298, 271, 496, 456, 420, 388, 360, 335, 312, 292, 273, 512, 482, 454, 428, 405, 383, 364, 345, 328, 312, 298, 284, 271, 259, 496, 475, 456, 437, 420, 404, 388, 374, 360, 347, 335, 323, 312, 302, 292, 282, 273, 265, 512, 497, 482, 468, 454, 441, 428, 417, 405, 394, 383, 373, 364, 354, 345, 337, 328, 320, 312, 305, 298, 291, 284, 278, 271, 265, 259, 507, 496, 485, 475, 465, 456, 446, 437, 428, 420, 412, 404, 396, 388, 381, 374, 367, 360, 354, 347, 341, 335, 329, 323, 318, 312, 307, 302, 297, 292, 287, 282, 278, 273, 269, 265, 261, 512, 505, 497, 489, 482, 475, 468, 461, 454, 447, 441, 435, 428, 422, 417, 411, 405, 399, 394, 389, 383, 378, 373, 368, 364, 359, 354, 350, 345, 341, 337, 332, 328, 324, 320, 316, 312, 309, 305, 301, 298, 294, 291, 287, 284, 281, 278, 274, 271, 268, 265, 262, 259, 257, 507, 501, 496, 491, 485, 480, 475, 470, 465, 460, 456, 451, 446, 442, 437, 433, 428, 424, 420, 416, 412, 408, 404, 400, 396, 392, 388, 385, 381, 377, 374, 370, 367, 363, 360, 357, 354, 350, 347, 344, 341, 338, 335, 332, 329, 326, 323, 320, 318, 315, 312, 310, 307, 304, 302, 299, 297, 294, 292, 289, 287, 285, 282, 280, 278, 275, 273, 271, 269, 267, 265, 263, 261, 259];
var shgTable = [9, 11, 12, 13, 13, 14, 14, 15, 15, 15, 15, 16, 16, 16, 16, 17, 17, 17, 17, 17, 17, 17, 18, 18, 18, 18, 18, 18, 18, 18, 18, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 21, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 22, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 23, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24, 24];
/**
 * @param {string|HTMLImageElement} img
 * @param {string|HTMLCanvasElement} canvas
 * @param {Float} radius
 * @param {boolean} blurAlphaChannel
 * @param {boolean} useOffset
 * @param {boolean} skipStyles
 * @returns {undefined}
 */

function processImage(img, canvas, radius, blurAlphaChannel, useOffset, skipStyles) {
  if (typeof img === 'string') {
    img = document.getElementById(img);
  }

  if (!img || !('naturalWidth' in img)) {
    return;
  }

  var dimensionType = useOffset ? 'offset' : 'natural';
  var w = img[dimensionType + 'Width'];
  var h = img[dimensionType + 'Height'];

  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }

  if (!canvas || !('getContext' in canvas)) {
    return;
  }

  if (!skipStyles) {
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
  }

  canvas.width = w;
  canvas.height = h;
  var context = canvas.getContext('2d');
  context.clearRect(0, 0, w, h);
  context.drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight, 0, 0, w, h);

  if (isNaN(radius) || radius < 1) {
    return;
  }

  if (blurAlphaChannel) {
    processCanvasRGBA(canvas, 0, 0, w, h, radius);
  } else {
    processCanvasRGB(canvas, 0, 0, w, h, radius);
  }
}
/**
 * @param {string|HTMLCanvasElement} canvas
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @throws {Error|TypeError}
 * @returns {ImageData} See {@link https://html.spec.whatwg.org/multipage/canvas.html#imagedata}
 */


function getImageDataFromCanvas(canvas, topX, topY, width, height) {
  if (typeof canvas === 'string') {
    canvas = document.getElementById(canvas);
  }

  if (!canvas || _typeof(canvas) !== 'object' || !('getContext' in canvas)) {
    throw new TypeError('Expecting canvas with `getContext` method ' + 'in processCanvasRGB(A) calls!');
  }

  var context = canvas.getContext('2d');

  try {
    return context.getImageData(topX, topY, width, height);
  } catch (e) {
    throw new Error('unable to access image data: ' + e);
  }
}
/**
 * @param {HTMLCanvasElement} canvas
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {undefined}
 */


function processCanvasRGBA(canvas, topX, topY, width, height, radius) {
  if (isNaN(radius) || radius < 1) {
    return;
  }

  radius |= 0;
  var imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);
  imageData = processImageDataRGBA(imageData, topX, topY, width, height, radius);
  canvas.getContext('2d').putImageData(imageData, topX, topY);
}
/**
 * @param {ImageData} imageData
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {ImageData}
 */


function processImageDataRGBA(imageData, topX, topY, width, height, radius) {
  var pixels = imageData.data;
  var div = 2 * radius + 1; // const w4 = width << 2;

  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;
  var stackEnd;

  for (var i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();

    if (i === radiusPlus1) {
      stackEnd = stack;
    }
  }

  stack.next = stackStart;
  var stackIn = null,
      stackOut = null,
      yw = 0,
      yi = 0;
  var mulSum = mulTable[radius];
  var shgSum = shgTable[radius];

  for (var y = 0; y < height; y++) {
    stack = stackStart;
    var pr = pixels[yi],
        pg = pixels[yi + 1],
        pb = pixels[yi + 2],
        pa = pixels[yi + 3];

    for (var _i = 0; _i < radiusPlus1; _i++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack.a = pa;
      stack = stack.next;
    }

    var rInSum = 0,
        gInSum = 0,
        bInSum = 0,
        aInSum = 0,
        rOutSum = radiusPlus1 * pr,
        gOutSum = radiusPlus1 * pg,
        bOutSum = radiusPlus1 * pb,
        aOutSum = radiusPlus1 * pa,
        rSum = sumFactor * pr,
        gSum = sumFactor * pg,
        bSum = sumFactor * pb,
        aSum = sumFactor * pa;

    for (var _i2 = 1; _i2 < radiusPlus1; _i2++) {
      var p = yi + ((widthMinus1 < _i2 ? widthMinus1 : _i2) << 2);
      var r = pixels[p],
          g = pixels[p + 1],
          b = pixels[p + 2],
          a = pixels[p + 3];
      var rbs = radiusPlus1 - _i2;
      rSum += (stack.r = r) * rbs;
      gSum += (stack.g = g) * rbs;
      bSum += (stack.b = b) * rbs;
      aSum += (stack.a = a) * rbs;
      rInSum += r;
      gInSum += g;
      bInSum += b;
      aInSum += a;
      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (var x = 0; x < width; x++) {
      var paInitial = aSum * mulSum >> shgSum;
      pixels[yi + 3] = paInitial;

      if (paInitial !== 0) {
        var _a2 = 255 / paInitial;

        pixels[yi] = (rSum * mulSum >> shgSum) * _a2;
        pixels[yi + 1] = (gSum * mulSum >> shgSum) * _a2;
        pixels[yi + 2] = (bSum * mulSum >> shgSum) * _a2;
      } else {
        pixels[yi] = pixels[yi + 1] = pixels[yi + 2] = 0;
      }

      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      aSum -= aOutSum;
      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;
      aOutSum -= stackIn.a;

      var _p = x + radius + 1;

      _p = yw + (_p < widthMinus1 ? _p : widthMinus1) << 2;
      rInSum += stackIn.r = pixels[_p];
      gInSum += stackIn.g = pixels[_p + 1];
      bInSum += stackIn.b = pixels[_p + 2];
      aInSum += stackIn.a = pixels[_p + 3];
      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      aSum += aInSum;
      stackIn = stackIn.next;
      var _stackOut = stackOut,
          _r = _stackOut.r,
          _g = _stackOut.g,
          _b = _stackOut.b,
          _a = _stackOut.a;
      rOutSum += _r;
      gOutSum += _g;
      bOutSum += _b;
      aOutSum += _a;
      rInSum -= _r;
      gInSum -= _g;
      bInSum -= _b;
      aInSum -= _a;
      stackOut = stackOut.next;
      yi += 4;
    }

    yw += width;
  }

  for (var _x = 0; _x < width; _x++) {
    yi = _x << 2;

    var _pr = pixels[yi],
        _pg = pixels[yi + 1],
        _pb = pixels[yi + 2],
        _pa = pixels[yi + 3],
        _rOutSum = radiusPlus1 * _pr,
        _gOutSum = radiusPlus1 * _pg,
        _bOutSum = radiusPlus1 * _pb,
        _aOutSum = radiusPlus1 * _pa,
        _rSum = sumFactor * _pr,
        _gSum = sumFactor * _pg,
        _bSum = sumFactor * _pb,
        _aSum = sumFactor * _pa;

    stack = stackStart;

    for (var _i3 = 0; _i3 < radiusPlus1; _i3++) {
      stack.r = _pr;
      stack.g = _pg;
      stack.b = _pb;
      stack.a = _pa;
      stack = stack.next;
    }

    var yp = width;
    var _gInSum = 0,
        _bInSum = 0,
        _aInSum = 0,
        _rInSum = 0;

    for (var _i4 = 1; _i4 <= radius; _i4++) {
      yi = yp + _x << 2;

      var _rbs = radiusPlus1 - _i4;

      _rSum += (stack.r = _pr = pixels[yi]) * _rbs;
      _gSum += (stack.g = _pg = pixels[yi + 1]) * _rbs;
      _bSum += (stack.b = _pb = pixels[yi + 2]) * _rbs;
      _aSum += (stack.a = _pa = pixels[yi + 3]) * _rbs;
      _rInSum += _pr;
      _gInSum += _pg;
      _bInSum += _pb;
      _aInSum += _pa;
      stack = stack.next;

      if (_i4 < heightMinus1) {
        yp += width;
      }
    }

    yi = _x;
    stackIn = stackStart;
    stackOut = stackEnd;

    for (var _y = 0; _y < height; _y++) {
      var _p2 = yi << 2;

      pixels[_p2 + 3] = _pa = _aSum * mulSum >> shgSum;

      if (_pa > 0) {
        _pa = 255 / _pa;
        pixels[_p2] = (_rSum * mulSum >> shgSum) * _pa;
        pixels[_p2 + 1] = (_gSum * mulSum >> shgSum) * _pa;
        pixels[_p2 + 2] = (_bSum * mulSum >> shgSum) * _pa;
      } else {
        pixels[_p2] = pixels[_p2 + 1] = pixels[_p2 + 2] = 0;
      }

      _rSum -= _rOutSum;
      _gSum -= _gOutSum;
      _bSum -= _bOutSum;
      _aSum -= _aOutSum;
      _rOutSum -= stackIn.r;
      _gOutSum -= stackIn.g;
      _bOutSum -= stackIn.b;
      _aOutSum -= stackIn.a;
      _p2 = _x + ((_p2 = _y + radiusPlus1) < heightMinus1 ? _p2 : heightMinus1) * width << 2;
      _rSum += _rInSum += stackIn.r = pixels[_p2];
      _gSum += _gInSum += stackIn.g = pixels[_p2 + 1];
      _bSum += _bInSum += stackIn.b = pixels[_p2 + 2];
      _aSum += _aInSum += stackIn.a = pixels[_p2 + 3];
      stackIn = stackIn.next;
      _rOutSum += _pr = stackOut.r;
      _gOutSum += _pg = stackOut.g;
      _bOutSum += _pb = stackOut.b;
      _aOutSum += _pa = stackOut.a;
      _rInSum -= _pr;
      _gInSum -= _pg;
      _bInSum -= _pb;
      _aInSum -= _pa;
      stackOut = stackOut.next;
      yi += width;
    }
  }

  return imageData;
}
/**
 * @param {HTMLCanvasElement} canvas
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {undefined}
 */


function processCanvasRGB(canvas, topX, topY, width, height, radius) {
  if (isNaN(radius) || radius < 1) {
    return;
  }

  radius |= 0;
  var imageData = getImageDataFromCanvas(canvas, topX, topY, width, height);
  imageData = processImageDataRGB(imageData, topX, topY, width, height, radius);
  canvas.getContext('2d').putImageData(imageData, topX, topY);
}
/**
 * @param {ImageData} imageData
 * @param {Integer} topX
 * @param {Integer} topY
 * @param {Integer} width
 * @param {Integer} height
 * @param {Float} radius
 * @returns {ImageData}
 */


function processImageDataRGB(imageData, topX, topY, width, height, radius) {
  var pixels = imageData.data;
  var div = 2 * radius + 1; // const w4 = width << 2;

  var widthMinus1 = width - 1;
  var heightMinus1 = height - 1;
  var radiusPlus1 = radius + 1;
  var sumFactor = radiusPlus1 * (radiusPlus1 + 1) / 2;
  var stackStart = new BlurStack();
  var stack = stackStart;
  var stackEnd;

  for (var i = 1; i < div; i++) {
    stack = stack.next = new BlurStack();

    if (i === radiusPlus1) {
      stackEnd = stack;
    }
  }

  stack.next = stackStart;
  var stackIn = null;
  var stackOut = null;
  var mulSum = mulTable[radius];
  var shgSum = shgTable[radius];
  var p, rbs;
  var yw = 0,
      yi = 0;

  for (var y = 0; y < height; y++) {
    var pr = pixels[yi],
        pg = pixels[yi + 1],
        pb = pixels[yi + 2],
        rOutSum = radiusPlus1 * pr,
        gOutSum = radiusPlus1 * pg,
        bOutSum = radiusPlus1 * pb,
        rSum = sumFactor * pr,
        gSum = sumFactor * pg,
        bSum = sumFactor * pb;
    stack = stackStart;

    for (var _i5 = 0; _i5 < radiusPlus1; _i5++) {
      stack.r = pr;
      stack.g = pg;
      stack.b = pb;
      stack = stack.next;
    }

    var rInSum = 0,
        gInSum = 0,
        bInSum = 0;

    for (var _i6 = 1; _i6 < radiusPlus1; _i6++) {
      p = yi + ((widthMinus1 < _i6 ? widthMinus1 : _i6) << 2);
      rSum += (stack.r = pr = pixels[p]) * (rbs = radiusPlus1 - _i6);
      gSum += (stack.g = pg = pixels[p + 1]) * rbs;
      bSum += (stack.b = pb = pixels[p + 2]) * rbs;
      rInSum += pr;
      gInSum += pg;
      bInSum += pb;
      stack = stack.next;
    }

    stackIn = stackStart;
    stackOut = stackEnd;

    for (var x = 0; x < width; x++) {
      pixels[yi] = rSum * mulSum >> shgSum;
      pixels[yi + 1] = gSum * mulSum >> shgSum;
      pixels[yi + 2] = bSum * mulSum >> shgSum;
      rSum -= rOutSum;
      gSum -= gOutSum;
      bSum -= bOutSum;
      rOutSum -= stackIn.r;
      gOutSum -= stackIn.g;
      bOutSum -= stackIn.b;
      p = yw + ((p = x + radius + 1) < widthMinus1 ? p : widthMinus1) << 2;
      rInSum += stackIn.r = pixels[p];
      gInSum += stackIn.g = pixels[p + 1];
      bInSum += stackIn.b = pixels[p + 2];
      rSum += rInSum;
      gSum += gInSum;
      bSum += bInSum;
      stackIn = stackIn.next;
      rOutSum += pr = stackOut.r;
      gOutSum += pg = stackOut.g;
      bOutSum += pb = stackOut.b;
      rInSum -= pr;
      gInSum -= pg;
      bInSum -= pb;
      stackOut = stackOut.next;
      yi += 4;
    }

    yw += width;
  }

  for (var _x2 = 0; _x2 < width; _x2++) {
    yi = _x2 << 2;

    var _pr2 = pixels[yi],
        _pg2 = pixels[yi + 1],
        _pb2 = pixels[yi + 2],
        _rOutSum2 = radiusPlus1 * _pr2,
        _gOutSum2 = radiusPlus1 * _pg2,
        _bOutSum2 = radiusPlus1 * _pb2,
        _rSum2 = sumFactor * _pr2,
        _gSum2 = sumFactor * _pg2,
        _bSum2 = sumFactor * _pb2;

    stack = stackStart;

    for (var _i7 = 0; _i7 < radiusPlus1; _i7++) {
      stack.r = _pr2;
      stack.g = _pg2;
      stack.b = _pb2;
      stack = stack.next;
    }

    var _rInSum2 = 0,
        _gInSum2 = 0,
        _bInSum2 = 0;

    for (var _i8 = 1, yp = width; _i8 <= radius; _i8++) {
      yi = yp + _x2 << 2;
      _rSum2 += (stack.r = _pr2 = pixels[yi]) * (rbs = radiusPlus1 - _i8);
      _gSum2 += (stack.g = _pg2 = pixels[yi + 1]) * rbs;
      _bSum2 += (stack.b = _pb2 = pixels[yi + 2]) * rbs;
      _rInSum2 += _pr2;
      _gInSum2 += _pg2;
      _bInSum2 += _pb2;
      stack = stack.next;

      if (_i8 < heightMinus1) {
        yp += width;
      }
    }

    yi = _x2;
    stackIn = stackStart;
    stackOut = stackEnd;

    for (var _y2 = 0; _y2 < height; _y2++) {
      p = yi << 2;
      pixels[p] = _rSum2 * mulSum >> shgSum;
      pixels[p + 1] = _gSum2 * mulSum >> shgSum;
      pixels[p + 2] = _bSum2 * mulSum >> shgSum;
      _rSum2 -= _rOutSum2;
      _gSum2 -= _gOutSum2;
      _bSum2 -= _bOutSum2;
      _rOutSum2 -= stackIn.r;
      _gOutSum2 -= stackIn.g;
      _bOutSum2 -= stackIn.b;
      p = _x2 + ((p = _y2 + radiusPlus1) < heightMinus1 ? p : heightMinus1) * width << 2;
      _rSum2 += _rInSum2 += stackIn.r = pixels[p];
      _gSum2 += _gInSum2 += stackIn.g = pixels[p + 1];
      _bSum2 += _bInSum2 += stackIn.b = pixels[p + 2];
      stackIn = stackIn.next;
      _rOutSum2 += _pr2 = stackOut.r;
      _gOutSum2 += _pg2 = stackOut.g;
      _bOutSum2 += _pb2 = stackOut.b;
      _rInSum2 -= _pr2;
      _gInSum2 -= _pg2;
      _bInSum2 -= _pb2;
      stackOut = stackOut.next;
      yi += width;
    }
  }

  return imageData;
}
/**
 *
 */


var BlurStack =
/**
 * Set properties.
 */
function BlurStack() {
  _classCallCheck(this, BlurStack);

  this.r = 0;
  this.g = 0;
  this.b = 0;
  this.a = 0;
  this.next = null;
};




/***/ }),

/***/ "./src/client/board.ts":
/*!*****************************!*\
  !*** ./src/client/board.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.renderBoardSVG = exports.createBoardData = exports.boardMustacheTemplate = exports.DEFAULT_THEME = exports.T = void 0;
const mustache_1 = __importDefault(__webpack_require__(/*! mustache */ "./node_modules/mustache/mustache.js"));
/**
 * Tile types
 */
var T;
(function (T) {
    T["tw"] = "tw";
    T["dw"] = "dw";
    T["tl"] = "tl";
    T["dl"] = "dl";
    T["ss"] = "ss";
    T["ee"] = "ee"; //Empty tile
})(T = exports.T || (exports.T = {}));
exports.DEFAULT_THEME = {
    backgroud: '#ffffff',
    width: 317,
    height: 317,
    tileOffsetX: 2,
    tileOffsetY: 2,
    tileCap: 2,
    tileHeight: 19,
    tileWidth: 19,
    tileSize: 19,
    tringleOffset: 0.25,
    [T.tw]: {
        background: '#F56546',
        textColor: '#000000',
        text: ['TRIPLA', 'SANA', 'PISTEET'],
        triangles: { width: 5, height: 1.5, gap: 3, amount: 3, fill: '#F56546' }
    },
    [T.dw]: {
        background: '#FABAA8',
        textColor: '#000000',
        text: ['TUPLA', 'SANA', 'PISTEET'],
        triangles: { width: 5, height: 1.5, gap: 3, amount: 2, fill: '#FABAA8' }
    },
    [T.tl]: {
        background: '#459DB1',
        textColor: '#ffffff',
        text: ['TRIPLA', 'KIRJAIN', 'PISTEET'],
        triangles: { width: 5, height: 1.5, gap: 3, amount: 3, fill: '#459DB1' }
    },
    [T.dl]: {
        background: '#B8D6D2',
        textColor: '#000000',
        text: ['TUPLA', 'KIRJAIN', 'PISTEET'],
        triangles: { width: 5, height: 1.5, gap: 3, amount: 2, fill: '#B8D6D2' }
    },
    [T.ss]: {
        background: '#FF0000',
        textColor: '#000000',
        text: [],
        triangles: undefined
    },
    [T.ee]: {
        background: '#C7C0A4',
        textColor: '#000000',
        text: [],
        triangles: undefined
    }
};
exports.boardMustacheTemplate = ` 
<svg 
  viewBox="{{viewBox.minX}} {{viewBox.minY}} {{viewBox.width}} {{viewBox.height}}" 
  width="{{svg.width}}"
  height="{{svg.height}}"
  fill="{{svg.fill}}" 
  xmlns="http://www.w3.org/2000/svg">

  <style>
    * {
      font-size: 2.8pt;      
      font-family: sans-serif;
    }
    .points {             
      font-weight: bold;       
    }
  </style>
  
  <path fill="{{background.fill}}" d="M {{background.p.x}},{{background.p.y}} L {{background.p2.x}},{{background.p2.y}} L {{background.p3.x}},{{background.p3.y}} L {{background.p4.x}},{{background.p4.y}} z"/>



  {{#tileRows}}
    {{#cols}}
      <path fill="{{background}}"  d="M {{p.x}},{{p.y}} L {{p2.x}},{{p2.y}} L {{p3.x}},{{p3.y}} L {{p4.x}},{{p4.y}} z"/>

      {{#hasTriangles}}
      
        
        <g transform="translate({{triangeTransform.top.x}} {{triangeTransform.top.y}})" >
        {{#triangles}}
          <path fill="{{fill}}" d="M {{c.x}},{{c.y}} L {{c2.x}},{{c2.y}} L {{c3.x}},{{c3.y}} z"/>      
        {{/triangles}}
        </g>

        <g transform="translate({{triangeTransform.right.x}} {{triangeTransform.right.y}}) rotate(90 {{p2.x}} {{p2.y}})" >
        {{#triangles}}
          <path fill="{{fill}}" d="M {{c.x}},{{c.y}} L {{c2.x}},{{c2.y}} L {{c3.x}},{{c3.y}} z"/>      
        {{/triangles}}
        </g>

        <g transform="translate({{triangeTransform.bottom.x}} {{triangeTransform.bottom.y}}) rotate(180 {{p2.x}} {{p2.y}})" >
        {{#triangles}}
          <path fill="{{fill}}" d="M {{c.x}},{{c.y}} L {{c2.x}},{{c2.y}} L {{c3.x}},{{c3.y}} z"/>      
        {{/triangles}}
        </g>

        <g transform="translate({{triangeTransform.left.x}} {{triangeTransform.left.y}}) rotate(270 {{p2.x}} {{p2.y}})" >
        {{#triangles}}
          <path fill="{{fill}}" d="M {{c.x}},{{c.y}} L {{c2.x}},{{c2.y}} L {{c3.x}},{{c3.y}} z"/>      
        {{/triangles}}
        </g>        

      {{/hasTriangles}}

      {{#text.length}}
      <g transform="translate({{t.x}} {{t.y}})">
        <text class="points" fill="{{textColor}}">
          {{#text}}<tspan x="0" dy="3.5pt">{{.}}</tspan>{{/text}}
        </text>
      </g>
      {{/text.length}}   
      


    {{/cols}}
  {{/tileRows}}
</svg>
`;
/**
 * Works with renderBoardSVG() function by providing Mustache data for the function.
 * @param {Theme} theme theme
 * @returns {BoardTemplateMustacheData} data
 */
function createBoardData(theme) {
    /**
     * tw = triple word score
     * dw = double word score
     * tl = triple letter score
     * dl = double letter score
     * st = start
     * ee = empty
     */
    const tiles = [
        [T.tw, T.ee, T.ee, T.dl, T.ee, T.ee, T.ee, T.tw, T.ee, T.ee, T.ee, T.dl, T.ee, T.ee, T.tw],
        [T.ee, T.dw, T.ee, T.ee, T.ee, T.tl, T.ee, T.ee, T.ee, T.tl, T.ee, T.ee, T.ee, T.dw, T.ee],
        [T.ee, T.ee, T.dw, T.ee, T.ee, T.ee, T.ee, T.ee, T.ee, T.ee, T.ee, T.ee, T.dw, T.ee, T.ee],
        [T.dl, T.ee, T.ee, T.dw, T.ee, T.ee, T.ee, T.dl, T.ee, T.ee, T.ee, T.dw, T.ee, T.ee, T.dl],
        [T.ee, T.ee, T.ee, T.ee, T.dw, T.ee, T.ee, T.ee, T.ee, T.ee, T.dw, T.ee, T.ee, T.ee, T.ee],
        [T.ee, T.tl, T.ee, T.ee, T.ee, T.tl, T.ee, T.ee, T.ee, T.tl, T.ee, T.ee, T.ee, T.tl, T.ee],
        [T.ee, T.ee, T.dl, T.ee, T.ee, T.ee, T.dl, T.ee, T.dl, T.ee, T.ee, T.ee, T.dl, T.ee, T.ee],
        [T.tw, T.ee, T.ee, T.dl, T.ee, T.ee, T.ee, T.ss, T.ee, T.ee, T.ee, T.dl, T.ee, T.ee, T.tw],
        [T.ee, T.ee, T.dl, T.ee, T.ee, T.ee, T.dl, T.ee, T.dl, T.ee, T.ee, T.ee, T.dl, T.ee, T.ee],
        [T.ee, T.tl, T.ee, T.ee, T.ee, T.tl, T.ee, T.ee, T.ee, T.tl, T.ee, T.ee, T.ee, T.tl, T.ee],
        [T.ee, T.ee, T.ee, T.ee, T.dw, T.ee, T.ee, T.ee, T.ee, T.ee, T.dw, T.ee, T.ee, T.ee, T.ee],
        [T.dl, T.ee, T.ee, T.dw, T.ee, T.ee, T.ee, T.dl, T.ee, T.ee, T.ee, T.dw, T.ee, T.ee, T.dl],
        [T.ee, T.ee, T.dw, T.ee, T.ee, T.ee, T.ee, T.ee, T.ee, T.ee, T.ee, T.ee, T.dw, T.ee, T.ee],
        [T.ee, T.dw, T.ee, T.ee, T.ee, T.tl, T.ee, T.ee, T.ee, T.tl, T.ee, T.ee, T.ee, T.dw, T.ee],
        [T.tw, T.ee, T.ee, T.dl, T.ee, T.ee, T.ee, T.tw, T.ee, T.ee, T.ee, T.dl, T.ee, T.ee, T.tw],
    ];
    const tile = {
        xOffset: theme.tileOffsetX,
        yOffset: theme.tileOffsetY,
        width: theme.tileWidth,
        heigth: theme.tileHeight,
        cap: theme.tileCap,
        tileSize: theme.tileSize,
        tringleOffset: theme.tringleOffset
    };
    const rows = tiles.map((row, rowI) => {
        const cols = row.map((column, colI) => {
            const x = tile.xOffset + tile.width * colI + tile.cap * colI;
            const y = tile.yOffset + tile.heigth * rowI + tile.cap * rowI;
            let triangles = [];
            const triangleDefinition = theme[column].triangles;
            if (triangleDefinition) {
                for (let index = 0; index < triangleDefinition.amount; index++) {
                    const offset = {
                        x: triangleDefinition.gap + triangleDefinition.gap * index + triangleDefinition.width * index,
                        y: 0
                    };
                    triangles.push({
                        c: {
                            x: x + offset.x,
                            y: y + offset.y
                        },
                        c2: {
                            x: x + triangleDefinition.width + offset.x,
                            y: y + offset.y
                        },
                        c3: {
                            x: x + triangleDefinition.width / 2 + offset.x,
                            y: y - triangleDefinition.height + offset.y
                        },
                        fill: triangleDefinition.fill,
                    });
                }
            }
            return {
                background: theme[column].background,
                p: {
                    x: x,
                    y: y
                },
                p2: {
                    x: x + tile.width,
                    y: y
                },
                p3: {
                    x: x + tile.width,
                    y: y + tile.heigth
                },
                p4: {
                    x: x,
                    y: y + tile.heigth
                },
                textColor: theme[column].textColor,
                text: theme[column].text,
                t: {
                    x: x + 1.5,
                    y: y + 2
                },
                t2: {
                    x, y
                },
                triangles,
                hasTriangles: triangles.length > 0
            };
        });
        return { cols };
    });
    const data = {
        //These can be used to scale thing to final size
        svg: {
            fill: 'none',
            width: `${theme.width}mm`,
            height: `${theme.height}mm`
        },
        //Internal coordinate system, everething follows this!
        viewBox: {
            minX: 0, minY: 0,
            width: theme.width, height: theme.height
        },
        tile,
        background: {
            fill: theme.backgroud,
            p: { x: 0, y: 0 },
            p2: { x: theme.width, y: 0 },
            p3: { x: theme.width, y: theme.height },
            p4: { x: 0, y: theme.height },
        },
        triangeTransform: {
            top: { x: 0, y: tile.tringleOffset },
            right: { x: -tile.tringleOffset, y: tile.tileSize },
            bottom: { x: -(tile.tileSize), y: tile.tileSize - tile.tringleOffset },
            left: { x: -(tile.tileSize - tile.tringleOffset), y: 0 },
        },
        tileRows: rows
    };
    return data;
}
exports.createBoardData = createBoardData;
/**
 * Create Board svg icon
 * @param svgTemplate Board's svg template
 * @param mustacheData mustache data for board
 * @returns svg icon
 */
function renderBoardSVG(svgTemplate, mustacheData) {
    const html = mustache_1.default.render(svgTemplate, mustacheData, {});
    return html;
}
exports.renderBoardSVG = renderBoardSVG;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYm9hcmQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpZW50L2JvYXJkLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLHdEQUFnQztBQUVoQzs7R0FFRztBQUNILElBQVksQ0FPWDtBQVBELFdBQVksQ0FBQztJQUNYLGNBQVMsQ0FBQTtJQUNULGNBQVMsQ0FBQTtJQUNULGNBQVMsQ0FBQTtJQUNULGNBQVMsQ0FBQTtJQUNULGNBQVMsQ0FBQTtJQUNULGNBQVMsQ0FBQSxDQUFBLFlBQVk7QUFDdkIsQ0FBQyxFQVBXLENBQUMsR0FBRCxTQUFDLEtBQUQsU0FBQyxRQU9aO0FBdUVZLFFBQUEsYUFBYSxHQUFTO0lBRWpDLFNBQVMsRUFBRSxTQUFTO0lBRXBCLEtBQUssRUFBRSxHQUFHO0lBQ1YsTUFBTSxFQUFFLEdBQUc7SUFFWCxXQUFXLEVBQUUsQ0FBQztJQUNkLFdBQVcsRUFBRSxDQUFDO0lBQ2QsT0FBTyxFQUFFLENBQUM7SUFDVixVQUFVLEVBQUUsRUFBRTtJQUNkLFNBQVMsRUFBRSxFQUFFO0lBRWIsUUFBUSxFQUFFLEVBQUU7SUFDWixhQUFhLEVBQUUsSUFBSTtJQUVuQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNOLFVBQVUsRUFBRSxTQUFTO1FBQ3JCLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsU0FBUyxDQUFDO1FBQ25DLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtLQUN6RTtJQUNELENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ04sVUFBVSxFQUFFLFNBQVM7UUFDckIsU0FBUyxFQUFFLFNBQVM7UUFDcEIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUM7UUFDbEMsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO0tBQ3pFO0lBQ0QsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDTixVQUFVLEVBQUUsU0FBUztRQUNyQixTQUFTLEVBQUUsU0FBUztRQUNwQixJQUFJLEVBQUUsQ0FBQyxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsQ0FBQztRQUN0QyxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7S0FDekU7SUFDRCxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNOLFVBQVUsRUFBRSxTQUFTO1FBQ3JCLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLElBQUksRUFBRSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDO1FBQ3JDLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtLQUN6RTtJQUNELENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ04sVUFBVSxFQUFFLFNBQVM7UUFDckIsU0FBUyxFQUFFLFNBQVM7UUFDcEIsSUFBSSxFQUFFLEVBQUU7UUFDUixTQUFTLEVBQUUsU0FBUztLQUNyQjtJQUNELENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ04sVUFBVSxFQUFFLFNBQVM7UUFDckIsU0FBUyxFQUFFLFNBQVM7UUFDcEIsSUFBSSxFQUFFLEVBQUU7UUFDUixTQUFTLEVBQUUsU0FBUztLQUNyQjtDQUNGLENBQUE7QUFnRVksUUFBQSxxQkFBcUIsR0FBRzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FvRXBDLENBQUM7QUFFRjs7OztHQUlHO0FBQ0gsU0FBZ0IsZUFBZSxDQUFFLEtBQVc7SUFFMUM7Ozs7Ozs7T0FPRztJQUNGLE1BQU0sS0FBSyxHQUFHO1FBQ2IsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1FBQzVFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7UUFDNUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztRQUM1RSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBQyxDQUFDLENBQUMsRUFBRSxFQUFDLENBQUMsQ0FBQyxFQUFFLEVB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QUFBO0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBcEpELDBDQW9KQztBQUlEOzs7OztHQUtHO0FBQ0gsU0FBZ0IsY0FBYyxDQUFFLFdBQWtCLEVBQ2xCLFlBQXNDO0lBRXBFLE1BQU0sSUFBSSxHQUFHLGtCQUFRLENBQUMsTUFBTSxDQUFDLFdBQVcsRUFBRSxZQUFZLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDNUQsT0FBTyxJQUFJLENBQUM7QUFDZCxDQUFDO0FBTEQsd0NBS0MiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbXVzdGFjaGUgZnJvbSAnbXVzdGFjaGUnO1xuXG4vKipcbiAqIFRpbGUgdHlwZXNcbiAqL1xuZXhwb3J0IGVudW0gVCB7XG4gIHR3ID0gJ3R3JywvL1RyaXBsZSB3b3JkIHNjb3Jlc1xuICBkdyA9ICdkdycsLy9Eb3VibGUgd29yZCBzY29yZXNcbiAgdGwgPSAndGwnLC8vVHJpcGxlIGxldHRlciBzY29yZXNcbiAgZGwgPSAnZGwnLC8vRG91YmxlIGxldHRlciBzY29yZXNcbiAgc3MgPSAnc3MnLC8vU3RhcnQgdGlsZVxuICBlZSA9ICdlZScvL0VtcHR5IHRpbGVcbn1cblxuZXhwb3J0IGludGVyZmFjZSBQb2ludCB7XG4gIHg6bnVtYmVyO1xuICB5Om51bWJlcjtcbn1cblxuaW50ZXJmYWNlIFRyaWFuZ2xlIHtcbiAgd2lkdGg6bnVtYmVyLFxuICBoZWlnaHQ6IG51bWJlcixcbiAgZ2FwOiBudW1iZXIsXG4gIGFtb3VudDogbnVtYmVyLFxuICBmaWxsOiBzdHJpbmcgXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGhlbWUge1xuXG4gIGJhY2tncm91ZDogc3RyaW5nLFxuXG4gIC8vR2l2ZXMgU1ZHIGludGVybmFsIGFuZCBleHRlcm5hbCBkaW1lc2lvblxuICB3aWR0aDogbnVtYmVyLFxuICBoZWlnaHQ6IG51bWJlcixcblxuICB0aWxlT2Zmc2V0WDogbnVtYmVyLFxuICB0aWxlT2Zmc2V0WTogbnVtYmVyLFxuICB0aWxlQ2FwOiBudW1iZXIsXG4gIHRpbGVXaWR0aDogbnVtYmVyLFxuICB0aWxlSGVpZ2h0OiBudW1iZXIsXG4gIHRpbGVTaXplOiBudW1iZXJcbiAgdHJpbmdsZU9mZnNldDogbnVtYmVyLFxuXG4gIFtULnR3XToge1xuICAgIGJhY2tncm91bmQ6c3RyaW5nLFxuICAgIHRleHRDb2xvcjpzdHJpbmcsXG4gICAgdGV4dDogc3RyaW5nW10sXG4gICAgdHJpYW5nbGVzPzogVHJpYW5nbGVcbiAgfSxcbiAgW1QuZHddOiB7XG4gICAgYmFja2dyb3VuZDpzdHJpbmcsXG4gICAgdGV4dENvbG9yOnN0cmluZyxcbiAgICB0ZXh0OiBzdHJpbmdbXSxcbiAgICB0cmlhbmdsZXM/OiBUcmlhbmdsZVxuICB9LFxuICBbVC50bF06IHtcbiAgICBiYWNrZ3JvdW5kOnN0cmluZyxcbiAgICB0ZXh0Q29sb3I6c3RyaW5nLFxuICAgIHRleHQ6IHN0cmluZ1tdLFxuICAgIHRyaWFuZ2xlcz86IFRyaWFuZ2xlXG4gIH0sXG4gIFtULmRsXToge1xuICAgIGJhY2tncm91bmQ6c3RyaW5nLFxuICAgIHRleHRDb2xvcjpzdHJpbmcsXG4gICAgdGV4dDogc3RyaW5nW10sXG4gICAgdHJpYW5nbGVzPzogVHJpYW5nbGVcbiAgfSxcbiAgW1Quc3NdOiB7XG4gICAgYmFja2dyb3VuZDpzdHJpbmcsXG4gICAgdGV4dENvbG9yOnN0cmluZyxcbiAgICB0ZXh0OiBzdHJpbmdbXSxcbiAgICB0cmlhbmdsZXM/OiBUcmlhbmdsZVxuICB9LFxuICBbVC5lZV06IHtcbiAgICBiYWNrZ3JvdW5kOnN0cmluZyxcbiAgICB0ZXh0Q29sb3I6c3RyaW5nLFxuICAgIHRleHQ6IHN0cmluZ1tdLFxuICAgIHRyaWFuZ2xlcz86IFRyaWFuZ2xlXG4gIH0gICAgIFxufVxuXG5cblxuZXhwb3J0IGNvbnN0IERFRkFVTFRfVEhFTUU6VGhlbWUgPSB7XG5cbiAgYmFja2dyb3VkOiAnI2ZmZmZmZicsXG5cbiAgd2lkdGg6IDMxNyxcbiAgaGVpZ2h0OiAzMTcsXG5cbiAgdGlsZU9mZnNldFg6IDIsXG4gIHRpbGVPZmZzZXRZOiAyLFxuICB0aWxlQ2FwOiAyLFxuICB0aWxlSGVpZ2h0OiAxOSxcbiAgdGlsZVdpZHRoOiAxOSxcblxuICB0aWxlU2l6ZTogMTksXG4gIHRyaW5nbGVPZmZzZXQ6IDAuMjUsXG5cbiAgW1QudHddOiB7Ly9UcmlwbGUgd29yZFxuICAgIGJhY2tncm91bmQ6ICcjRjU2NTQ2JyxcbiAgICB0ZXh0Q29sb3I6ICcjMDAwMDAwJyxcbiAgICB0ZXh0OiBbJ1RSSVBMQScsICdTQU5BJywgJ1BJU1RFRVQnXSxcbiAgICB0cmlhbmdsZXM6IHsgd2lkdGg6IDUsIGhlaWdodDogMS41LCBnYXA6IDMsIGFtb3VudDogMywgZmlsbDogJyNGNTY1NDYnIH1cbiAgfSwgIFxuICBbVC5kd106IHsvL0RvdWJsZSB3b3JkXG4gICAgYmFja2dyb3VuZDogJyNGQUJBQTgnLFxuICAgIHRleHRDb2xvcjogJyMwMDAwMDAnLFxuICAgIHRleHQ6IFsnVFVQTEEnLCAnU0FOQScsICdQSVNURUVUJ10sXG4gICAgdHJpYW5nbGVzOiB7IHdpZHRoOiA1LCBoZWlnaHQ6IDEuNSwgZ2FwOiAzLCBhbW91bnQ6IDIsIGZpbGw6ICcjRkFCQUE4JyB9XG4gIH0sICBcbiAgW1QudGxdOiB7Ly9UcmlwbGUgbGV0dGVyc1xuICAgIGJhY2tncm91bmQ6ICcjNDU5REIxJyxcbiAgICB0ZXh0Q29sb3I6ICcjZmZmZmZmJyxcbiAgICB0ZXh0OiBbJ1RSSVBMQScsICdLSVJKQUlOJywgJ1BJU1RFRVQnXSxcbiAgICB0cmlhbmdsZXM6IHsgd2lkdGg6IDUsIGhlaWdodDogMS41LCBnYXA6IDMsIGFtb3VudDogMywgZmlsbDogJyM0NTlEQjEnIH1cbiAgfSxcbiAgW1QuZGxdOiB7Ly9Eb3VibGUgbGV0dGVyXG4gICAgYmFja2dyb3VuZDogJyNCOEQ2RDInLFxuICAgIHRleHRDb2xvcjogJyMwMDAwMDAnLFxuICAgIHRleHQ6IFsnVFVQTEEnLCAnS0lSSkFJTicsICdQSVNURUVUJ10sXG4gICAgdHJpYW5nbGVzOiB7IHdpZHRoOiA1LCBoZWlnaHQ6IDEuNSwgZ2FwOiAzLCBhbW91bnQ6IDIsIGZpbGw6ICcjQjhENkQyJyB9XG4gIH0sXG4gIFtULnNzXTogey8vU3RhcnRcbiAgICBiYWNrZ3JvdW5kOiAnI0ZGMDAwMCcsXG4gICAgdGV4dENvbG9yOiAnIzAwMDAwMCcsXG4gICAgdGV4dDogW10sXG4gICAgdHJpYW5nbGVzOiB1bmRlZmluZWRcbiAgfSxcbiAgW1QuZWVdOiB7Ly9FbXB0eVxuICAgIGJhY2tncm91bmQ6ICcjQzdDMEE0JyxcbiAgICB0ZXh0Q29sb3I6ICcjMDAwMDAwJyxcbiAgICB0ZXh0OiBbXSxcbiAgICB0cmlhbmdsZXM6IHVuZGVmaW5lZFxuICB9XG59XG5cbmludGVyZmFjZSBUcmlhbmdsZUNvb3JkaW5hdGVzIHtcbiAgYzogUG9pbnQsXG4gIGMyOiBQb2ludCxcbiAgYzM6IFBvaW50LFxuICBmaWxsOiBzdHJpbmdcbn1cblxuaW50ZXJmYWNlIFRpbGVDb29yZGluYXRlcyB7XG4gIGJhY2tncm91bmQ6c3RyaW5nO1xuICBwOlBvaW50LFxuICBwMjpQb2ludCxcbiAgcDM6UG9pbnQsXG4gIHA0OlBvaW50LFxuXG4gIHQ6IFBvaW50LFxuICB0MjogUG9pbnQsXG5cbiAgdGV4dENvbG9yOnN0cmluZ1xuICB0ZXh0PzpzdHJpbmdbXSwgIFxuXG4gIGhhc1RyaWFuZ2xlczogYm9vbGVhbixcbiAgdHJpYW5nbGVzPzogVHJpYW5nbGVDb29yZGluYXRlc1tdXG59XG5cbmludGVyZmFjZSBSb3cge1xuICBjb2xzOiBUaWxlQ29vcmRpbmF0ZXNbXVxufVxuXG5pbnRlcmZhY2UgQm9hcmRUZW1wbGF0ZU11c3RhY2hlRGF0YSB7XG4gIFxuICBzdmc6IHtcbiAgICB3aWR0aDpzdHJpbmcsXG4gICAgaGVpZ2h0OnN0cmluZyxcbiAgICBmaWxsOnN0cmluZ1xuICB9LFxuXG4gIHZpZXdCb3g6IHtcbiAgICBtaW5YOiBudW1iZXIsXG4gICAgbWluWTogbnVtYmVyLFxuICAgIHdpZHRoOiBudW1iZXIsXG4gICAgaGVpZ2h0OiBudW1iZXJcbiAgfSxcblxuICBiYWNrZ3JvdW5kOiB7XG4gICAgZmlsbDogc3RyaW5nLFxuICAgIHA6IFBvaW50LFxuICAgIHAyOiBQb2ludCxcbiAgICBwMzogUG9pbnQsXG4gICAgcDQ6IFBvaW50XG4gIH1cblxuICAvL1RyaWFuZ2xlcyB0YW5zZm9ybSBjb29yZGluYXRlc1xuICB0cmlhbmdlVHJhbnNmb3JtOiB7XG4gICAgdG9wOiBQb2ludCxcbiAgICBib3R0b206IFBvaW50LFxuICAgIGxlZnQ6IFBvaW50XG4gICAgcmlnaHQ6IFBvaW50LCAgXG4gIH1cblxuICB0aWxlUm93czogUm93W11cbn0gXG5cbmV4cG9ydCBjb25zdCBib2FyZE11c3RhY2hlVGVtcGxhdGUgPSBgIFxuPHN2ZyBcbiAgdmlld0JveD1cInt7dmlld0JveC5taW5YfX0ge3t2aWV3Qm94Lm1pbll9fSB7e3ZpZXdCb3gud2lkdGh9fSB7e3ZpZXdCb3guaGVpZ2h0fX1cIiBcbiAgd2lkdGg9XCJ7e3N2Zy53aWR0aH19XCJcbiAgaGVpZ2h0PVwie3tzdmcuaGVpZ2h0fX1cIlxuICBmaWxsPVwie3tzdmcuZmlsbH19XCIgXG4gIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIj5cblxuICA8c3R5bGU+XG4gICAgKiB7XG4gICAgICBmb250LXNpemU6IDIuOHB0OyAgICAgIFxuICAgICAgZm9udC1mYW1pbHk6IHNhbnMtc2VyaWY7XG4gICAgfVxuICAgIC5wb2ludHMgeyAgICAgICAgICAgICBcbiAgICAgIGZvbnQtd2VpZ2h0OiBib2xkOyAgICAgICBcbiAgICB9XG4gIDwvc3R5bGU+XG4gIFxuICA8cGF0aCBmaWxsPVwie3tiYWNrZ3JvdW5kLmZpbGx9fVwiIGQ9XCJNIHt7YmFja2dyb3VuZC5wLnh9fSx7e2JhY2tncm91bmQucC55fX0gTCB7e2JhY2tncm91bmQucDIueH19LHt7YmFja2dyb3VuZC5wMi55fX0gTCB7e2JhY2tncm91bmQucDMueH19LHt7YmFja2dyb3VuZC5wMy55fX0gTCB7e2JhY2tncm91bmQucDQueH19LHt7YmFja2dyb3VuZC5wNC55fX0gelwiLz5cblxuXG5cbiAge3sjdGlsZVJvd3N9fVxuICAgIHt7I2NvbHN9fVxuICAgICAgPHBhdGggZmlsbD1cInt7YmFja2dyb3VuZH19XCIgIGQ9XCJNIHt7cC54fX0se3twLnl9fSBMIHt7cDIueH19LHt7cDIueX19IEwge3twMy54fX0se3twMy55fX0gTCB7e3A0Lnh9fSx7e3A0Lnl9fSB6XCIvPlxuXG4gICAgICB7eyNoYXNUcmlhbmdsZXN9fVxuICAgICAgXG4gICAgICAgIFxuICAgICAgICA8ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoe3t0cmlhbmdlVHJhbnNmb3JtLnRvcC54fX0ge3t0cmlhbmdlVHJhbnNmb3JtLnRvcC55fX0pXCIgPlxuICAgICAgICB7eyN0cmlhbmdsZXN9fVxuICAgICAgICAgIDxwYXRoIGZpbGw9XCJ7e2ZpbGx9fVwiIGQ9XCJNIHt7Yy54fX0se3tjLnl9fSBMIHt7YzIueH19LHt7YzIueX19IEwge3tjMy54fX0se3tjMy55fX0gelwiLz4gICAgICBcbiAgICAgICAge3svdHJpYW5nbGVzfX1cbiAgICAgICAgPC9nPlxuXG4gICAgICAgIDxnIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSh7e3RyaWFuZ2VUcmFuc2Zvcm0ucmlnaHQueH19IHt7dHJpYW5nZVRyYW5zZm9ybS5yaWdodC55fX0pIHJvdGF0ZSg5MCB7e3AyLnh9fSB7e3AyLnl9fSlcIiA+XG4gICAgICAgIHt7I3RyaWFuZ2xlc319XG4gICAgICAgICAgPHBhdGggZmlsbD1cInt7ZmlsbH19XCIgZD1cIk0ge3tjLnh9fSx7e2MueX19IEwge3tjMi54fX0se3tjMi55fX0gTCB7e2MzLnh9fSx7e2MzLnl9fSB6XCIvPiAgICAgIFxuICAgICAgICB7ey90cmlhbmdsZXN9fVxuICAgICAgICA8L2c+XG5cbiAgICAgICAgPGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKHt7dHJpYW5nZVRyYW5zZm9ybS5ib3R0b20ueH19IHt7dHJpYW5nZVRyYW5zZm9ybS5ib3R0b20ueX19KSByb3RhdGUoMTgwIHt7cDIueH19IHt7cDIueX19KVwiID5cbiAgICAgICAge3sjdHJpYW5nbGVzfX1cbiAgICAgICAgICA8cGF0aCBmaWxsPVwie3tmaWxsfX1cIiBkPVwiTSB7e2MueH19LHt7Yy55fX0gTCB7e2MyLnh9fSx7e2MyLnl9fSBMIHt7YzMueH19LHt7YzMueX19IHpcIi8+ICAgICAgXG4gICAgICAgIHt7L3RyaWFuZ2xlc319XG4gICAgICAgIDwvZz5cblxuICAgICAgICA8ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoe3t0cmlhbmdlVHJhbnNmb3JtLmxlZnQueH19IHt7dHJpYW5nZVRyYW5zZm9ybS5sZWZ0Lnl9fSkgcm90YXRlKDI3MCB7e3AyLnh9fSB7e3AyLnl9fSlcIiA+XG4gICAgICAgIHt7I3RyaWFuZ2xlc319XG4gICAgICAgICAgPHBhdGggZmlsbD1cInt7ZmlsbH19XCIgZD1cIk0ge3tjLnh9fSx7e2MueX19IEwge3tjMi54fX0se3tjMi55fX0gTCB7e2MzLnh9fSx7e2MzLnl9fSB6XCIvPiAgICAgIFxuICAgICAgICB7ey90cmlhbmdsZXN9fVxuICAgICAgICA8L2c+ICAgICAgICBcblxuICAgICAge3svaGFzVHJpYW5nbGVzfX1cblxuICAgICAge3sjdGV4dC5sZW5ndGh9fVxuICAgICAgPGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKHt7dC54fX0ge3t0Lnl9fSlcIj5cbiAgICAgICAgPHRleHQgY2xhc3M9XCJwb2ludHNcIiBmaWxsPVwie3t0ZXh0Q29sb3J9fVwiPlxuICAgICAgICAgIHt7I3RleHR9fTx0c3BhbiB4PVwiMFwiIGR5PVwiMy41cHRcIj57ey59fTwvdHNwYW4+e3svdGV4dH19XG4gICAgICAgIDwvdGV4dD5cbiAgICAgIDwvZz5cbiAgICAgIHt7L3RleHQubGVuZ3RofX0gICBcbiAgICAgIFxuXG5cbiAgICB7ey9jb2xzfX1cbiAge3svdGlsZVJvd3N9fVxuPC9zdmc+XG5gOyAgXG5cbi8qKlxuICogV29ya3Mgd2l0aCByZW5kZXJCb2FyZFNWRygpIGZ1bmN0aW9uIGJ5IHByb3ZpZGluZyBNdXN0YWNoZSBkYXRhIGZvciB0aGUgZnVuY3Rpb24uXG4gKiBAcGFyYW0ge1RoZW1lfSB0aGVtZSB0aGVtZSBcbiAqIEByZXR1cm5zIHtCb2FyZFRlbXBsYXRlTXVzdGFjaGVEYXRhfSBkYXRhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVCb2FyZERhdGEoIHRoZW1lOlRoZW1lICk6Qm9hcmRUZW1wbGF0ZU11c3RhY2hlRGF0YSB7XG5cbiAgLyoqXG4gICAqIHR3ID0gdHJpcGxlIHdvcmQgc2NvcmVcbiAgICogZHcgPSBkb3VibGUgd29yZCBzY29yZVxuICAgKiB0bCA9IHRyaXBsZSBsZXR0ZXIgc2NvcmVcbiAgICogZGwgPSBkb3VibGUgbGV0dGVyIHNjb3JlXG4gICAqIHN0ID0gc3RhcnRcbiAgICogZWUgPSBlbXB0eVxuICAgKi9cbiAgIGNvbnN0IHRpbGVzID0gW1xuICAgIFtULnR3LFQuZWUsVC5lZSxULmRsLFQuZWUsVC5lZSxULmVlLFQudHcsVC5lZSxULmVlLFQuZWUsVC5kbCxULmVlLFQuZWUsVC50d10sXG4gICAgW1QuZWUsVC5kdyxULmVlLFQuZWUsVC5lZSxULnRsLFQuZWUsVC5lZSxULmVlLFQudGwsVC5lZSxULmVlLFQuZWUsVC5kdyxULmVlXSxcbiAgICBbVC5lZSxULmVlLFQuZHcsVC5lZSxULmVlLFQuZWUsVC5lZSxULmVlLFQuZWUsVC5lZSxULmVlLFQuZWUsVC5kdyxULmVlLFQuZWVdLFxuICAgIFtULmRsLFQuZWUsVC5lZSxULmR3LFQuZWUsVC5lZSxULmVlLFQuZGwsVC5lZSxULmVlLFQuZWUsVC5kdyxULmVlLFQuZWUsVC5kbF0sXG4gICAgW1QuZWUsVC5lZSxULmVlLFQuZWUsVC5kdyxULmVlLFQuZWUsVC5lZSxULmVlLFQuZWUsVC5kdyxULmVlLFQuZWUsVC5lZSxULmVlXSxcbiAgICBbVC5lZSxULnRsLFQuZWUsVC5lZSxULmVlLFQudGwsVC5lZSxULmVlLFQuZWUsVC50bCxULmVlLFQuZWUsVC5lZSxULnRsLFQuZWVdLFxuICAgIFtULmVlLFQuZWUsVC5kbCxULmVlLFQuZWUsVC5lZSxULmRsLFQuZWUsVC5kbCxULmVlLFQuZWUsVC5lZSxULmRsLFQuZWUsVC5lZV0sXG4gICAgW1QudHcsVC5lZSxULmVlLFQuZGwsVC5lZSxULmVlLFQuZWUsVC5zcyxULmVlLFQuZWUsVC5lZSxULmRsLFQuZWUsVC5lZSxULnR3XSwgICAgXG4gICAgW1QuZWUsVC5lZSxULmRsLFQuZWUsVC5lZSxULmVlLFQuZGwsVC5lZSxULmRsLFQuZWUsVC5lZSxULmVlLFQuZGwsVC5lZSxULmVlXSxcbiAgICBbVC5lZSxULnRsLFQuZWUsVC5lZSxULmVlLFQudGwsVC5lZSxULmVlLFQuZWUsVC50bCxULmVlLFQuZWUsVC5lZSxULnRsLFQuZWVdLCAgICBcbiAgICBbVC5lZSxULmVlLFQuZWUsVC5lZSxULmR3LFQuZWUsVC5lZSxULmVlLFQuZWUsVC5lZSxULmR3LFQuZWUsVC5lZSxULmVlLFQuZWVdLFxuICAgIFtULmRsLFQuZWUsVC5lZSxULmR3LFQuZWUsVC5lZSxULmVlLFQuZGwsVC5lZSxULmVlLFQuZWUsVC5kdyxULmVlLFQuZWUsVC5kbF0sXG4gICAgW1QuZWUsVC5lZSxULmR3LFQuZWUsVC5lZSxULmVlLFQuZWUsVC5lZSxULmVlLFQuZWUsVC5lZSxULmVlLFQuZHcsVC5lZSxULmVlXSxcbiAgICBbVC5lZSxULmR3LFQuZWUsVC5lZSxULmVlLFQudGwsVC5lZSxULmVlLFQuZWUsVC50bCxULmVlLFQuZWUsVC5lZSxULmR3LFQuZWVdLFxuICAgIFtULnR3LFQuZWUsVC5lZSxULmRsLFQuZWUsVC5lZSxULmVlLFQudHcsVC5lZSxULmVlLFQuZWUsVC5kbCxULmVlLFQuZWUsVC50d10sICAgICAgICAgICBcbiAgXVxuXG4gIGNvbnN0IHRpbGUgPSB7XG4gICAgeE9mZnNldDogdGhlbWUudGlsZU9mZnNldFgsXG4gICAgeU9mZnNldDogdGhlbWUudGlsZU9mZnNldFksXG4gICAgd2lkdGg6IHRoZW1lLnRpbGVXaWR0aCxcbiAgICBoZWlndGg6IHRoZW1lLnRpbGVIZWlnaHQsXG4gICAgY2FwOiB0aGVtZS50aWxlQ2FwLFxuXG4gICAgdGlsZVNpemU6IHRoZW1lLnRpbGVTaXplLFxuICAgIHRyaW5nbGVPZmZzZXQ6IHRoZW1lLnRyaW5nbGVPZmZzZXRcbiAgfTtcblxuICBjb25zdCByb3dzID0gdGlsZXMubWFwKCAocm93OlRbXSwgcm93STpudW1iZXIpOlJvdyA9PiB7XG4gICAgY29uc3QgY29sczpUaWxlQ29vcmRpbmF0ZXNbXSA9IHJvdy5tYXAoIChjb2x1bW46VCwgY29sSTpudW1iZXIpOlRpbGVDb29yZGluYXRlcyA9PiB7ICAgIFxuICBcbiAgICAgIGNvbnN0IHggPSB0aWxlLnhPZmZzZXQgKyB0aWxlLndpZHRoICogY29sSSArIHRpbGUuY2FwICogY29sSTtcbiAgICAgIGNvbnN0IHkgPSB0aWxlLnlPZmZzZXQgKyB0aWxlLmhlaWd0aCAqIHJvd0kgKyB0aWxlLmNhcCAqIHJvd0k7ICAgICAgICAgXG4gICAgICBcbiAgICAgIGxldCB0cmlhbmdsZXM6VHJpYW5nbGVDb29yZGluYXRlc1tdID0gW107XG4gICAgICBjb25zdCB0cmlhbmdsZURlZmluaXRpb24gPSB0aGVtZVtjb2x1bW5dLnRyaWFuZ2xlcztcblxuICAgICAgaWYoIHRyaWFuZ2xlRGVmaW5pdGlvbiApIHtcbiAgICAgICAgZm9yKCBsZXQgaW5kZXg6bnVtYmVyID0gMDsgaW5kZXggPCB0cmlhbmdsZURlZmluaXRpb24uYW1vdW50OyBpbmRleCsrICkge1xuICAgICAgICAgIGNvbnN0IG9mZnNldDpQb2ludCA9IHtcbiAgICAgICAgICAgIHg6IHRyaWFuZ2xlRGVmaW5pdGlvbi5nYXAgKyB0cmlhbmdsZURlZmluaXRpb24uZ2FwICogaW5kZXggKyB0cmlhbmdsZURlZmluaXRpb24ud2lkdGggKiBpbmRleCwgXG4gICAgICAgICAgICB5OiAwXG4gICAgICAgICAgfSAgICAgICAgICBcblxuICAgICAgICAgIHRyaWFuZ2xlcy5wdXNoKHtcbiAgICAgICAgICAgIGM6IHsgXG4gICAgICAgICAgICAgIHg6IHggKyBvZmZzZXQueCwgXG4gICAgICAgICAgICAgIHk6IHkgKyBvZmZzZXQueVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGMyOiB7IFxuICAgICAgICAgICAgICB4OiB4ICsgdHJpYW5nbGVEZWZpbml0aW9uLndpZHRoICsgb2Zmc2V0LngsIFxuICAgICAgICAgICAgICB5OiB5ICsgb2Zmc2V0LnlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjMzogeyBcbiAgICAgICAgICAgICAgeDogeCArIHRyaWFuZ2xlRGVmaW5pdGlvbi53aWR0aCAvIDIgKyBvZmZzZXQueCwgIFxuICAgICAgICAgICAgICB5OiB5IC0gdHJpYW5nbGVEZWZpbml0aW9uLmhlaWdodCArIG9mZnNldC55XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZmlsbDogdHJpYW5nbGVEZWZpbml0aW9uLmZpbGwsXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gXG4gICAgICB9ICAgICAgXG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIGJhY2tncm91bmQ6IHRoZW1lW2NvbHVtbl0uYmFja2dyb3VuZCxcbiAgICAgICAgcDogeyBcbiAgICAgICAgICB4OiB4LCBcbiAgICAgICAgICB5OiB5IFxuICAgICAgICB9LFxuICAgICAgICBwMjogeyBcbiAgICAgICAgICB4OiB4ICsgdGlsZS53aWR0aCwgXG4gICAgICAgICAgeTogeSBcbiAgICAgICAgfSxcbiAgICAgICAgcDM6IHsgXG4gICAgICAgICAgeDogeCArIHRpbGUud2lkdGgsIFxuICAgICAgICAgIHk6IHkgKyB0aWxlLmhlaWd0aCBcbiAgICAgICAgfSxcbiAgICAgICAgcDQ6IHsgXG4gICAgICAgICAgeDogeCwgXG4gICAgICAgICAgeTogeSArIHRpbGUuaGVpZ3RoXG4gICAgICAgIH0sXG4gIFxuICAgICAgICB0ZXh0Q29sb3I6IHRoZW1lW2NvbHVtbl0udGV4dENvbG9yLFxuICAgICAgICB0ZXh0OiB0aGVtZVtjb2x1bW5dLnRleHQsXG4gIFxuICAgICAgICB0OiB7XG4gICAgICAgICAgeDogeCArIDEuNSxcbiAgICAgICAgICB5OiB5ICsgMlxuICAgICAgICB9LFxuICBcbiAgICAgICAgdDI6IHtcbiAgICAgICAgICB4LCB5XG4gICAgICAgIH0sXG4gICAgICAgIFxuICAgICAgICB0cmlhbmdsZXMsXG4gICAgICAgIGhhc1RyaWFuZ2xlczogdHJpYW5nbGVzLmxlbmd0aCA+IDBcbiAgICAgIH1cbiAgICB9KTtcbiAgXG4gICAgcmV0dXJuIHsgY29scyB9O1xuICB9KTtcblxuICBjb25zdCBkYXRhID0ge1xuXG4gICAgLy9UaGVzZSBjYW4gYmUgdXNlZCB0byBzY2FsZSB0aGluZyB0byBmaW5hbCBzaXplXG4gICAgc3ZnOiB7IFxuICAgICAgZmlsbDogJ25vbmUnLFxuICAgICAgd2lkdGg6IGAke3RoZW1lLndpZHRofW1tYCxcbiAgICAgIGhlaWdodDogYCR7dGhlbWUuaGVpZ2h0fW1tYFxuICAgIH0sXG4gIFxuICAgIC8vSW50ZXJuYWwgY29vcmRpbmF0ZSBzeXN0ZW0sIGV2ZXJldGhpbmcgZm9sbG93cyB0aGlzIVxuICAgIHZpZXdCb3g6IHtcbiAgICAgIG1pblg6IDAsIG1pblk6MCxcbiAgICAgIHdpZHRoOiB0aGVtZS53aWR0aCwgaGVpZ2h0OiB0aGVtZS5oZWlnaHRcbiAgICB9LFxuXG4gICAgdGlsZSxcblxuICAgIGJhY2tncm91bmQ6IHtcbiAgICAgIGZpbGw6IHRoZW1lLmJhY2tncm91ZCxcbiAgICAgIHA6IHsgeDowLCB5OjAgfSxcbiAgICAgIHAyOiB7IHg6IHRoZW1lLndpZHRoLCB5OiAwIH0sXG4gICAgICBwMzogeyB4OiB0aGVtZS53aWR0aCwgeTogdGhlbWUuaGVpZ2h0IH0sXG4gICAgICBwNDogeyB4OiAwLCB5OiB0aGVtZS5oZWlnaHQgfSwgICAgICBcbiAgICB9LFxuXG4gICAgdHJpYW5nZVRyYW5zZm9ybToge1xuICAgICAgdG9wOiB7IHg6IDAsIHk6IHRpbGUudHJpbmdsZU9mZnNldCB9LFxuICAgICAgcmlnaHQ6IHsgeDogLXRpbGUudHJpbmdsZU9mZnNldCwgeTogdGlsZS50aWxlU2l6ZSB9LFxuICAgICAgYm90dG9tOiAgeyB4OiAtKHRpbGUudGlsZVNpemUgKSAsIHk6IHRpbGUudGlsZVNpemUgLSB0aWxlLnRyaW5nbGVPZmZzZXQgfSxcbiAgICAgIGxlZnQ6ICB7IHg6IC0odGlsZS50aWxlU2l6ZSAtIHRpbGUudHJpbmdsZU9mZnNldCksIHk6IDAgfSwgXG4gICAgfSwgXG5cbiAgICB0aWxlUm93czogcm93c1xuICB9XG5cbiAgcmV0dXJuIGRhdGE7XG59XG5cblxuXG4vKipcbiAqIENyZWF0ZSBCb2FyZCBzdmcgaWNvblxuICogQHBhcmFtIHN2Z1RlbXBsYXRlIEJvYXJkJ3Mgc3ZnIHRlbXBsYXRlXG4gKiBAcGFyYW0gbXVzdGFjaGVEYXRhIG11c3RhY2hlIGRhdGEgZm9yIGJvYXJkXG4gKiBAcmV0dXJucyBzdmcgaWNvblxuICovXG5leHBvcnQgZnVuY3Rpb24gcmVuZGVyQm9hcmRTVkcoIHN2Z1RlbXBsYXRlOnN0cmluZywgXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG11c3RhY2hlRGF0YTpCb2FyZFRlbXBsYXRlTXVzdGFjaGVEYXRhICk6c3RyaW5nIHtcbiAgXG4gIGNvbnN0IGh0bWwgPSBtdXN0YWNoZS5yZW5kZXIoc3ZnVGVtcGxhdGUsIG11c3RhY2hlRGF0YSwge30pOyAgXG4gIHJldHVybiBodG1sO1xufVxuXG4iXX0=

/***/ }),

/***/ "./src/client/helpers.ts":
/*!*******************************!*\
  !*** ./src/client/helpers.ts ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convertSVGtoCanvas = exports.toPng = exports.debounce = void 0;
function debounce(callback, timeout = 300) {
    let timer;
    function wrapper(...args) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            callback.apply(wrapper, args);
        }, timeout);
    }
    return wrapper;
}
exports.debounce = debounce;
const canvg_1 = __webpack_require__(/*! canvg */ "./node_modules/canvg/dist/index.cjs");
function toPng(data) {
    return __awaiter(this, void 0, void 0, function* () {
        const preset = canvg_1.presets.offscreen();
        const { width, height, svg } = data;
        const canvas = new OffscreenCanvas(width, height);
        const ctx = canvas.getContext('2d');
        const v = yield canvg_1.Canvg.fromString(ctx, svg, preset);
        v.resize(width, height, 'xMidYMid meet');
        // Render only first frame, ignoring animations and mouse.
        yield v.render();
        const blob = yield canvas.convertToBlob();
        const pngUrl = URL.createObjectURL(blob);
        return pngUrl;
    });
}
exports.toPng = toPng;
function convertSVGtoCanvas(data) {
    const { width, height, svg } = data;
    let canvg = null;
    window.onload = () => __awaiter(this, void 0, void 0, function* () {
        const canvas = document.querySelector('canvas');
        const ctx = canvas.getContext('2d');
        canvg = canvg_1.Canvg.fromString(ctx, svg, {});
        // Start SVG rendering with animations and mouse handling.
        canvg.start();
    });
    window.onbeforeunload = () => {
        canvg.stop();
    };
}
exports.convertSVGtoCanvas = convertSVGtoCanvas;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGVscGVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jbGllbnQvaGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7QUFBQSxTQUFnQixRQUFRLENBQUUsUUFBaUIsRUFBRSxVQUFpQixHQUFHO0lBRS9ELElBQUksS0FBUyxDQUFDO0lBRWQsU0FBUyxPQUFPLENBQUMsR0FBRyxJQUFXO1FBQzdCLFlBQVksQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUNwQixLQUFLLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUN0QixRQUFRLENBQUMsS0FBSyxDQUFFLE9BQU8sRUFBRSxJQUFJLENBQUUsQ0FBQztRQUNsQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDZCxDQUFDO0lBRUQsT0FBTyxPQUFPLENBQUM7QUFDakIsQ0FBQztBQVpELDRCQVlDO0FBRUQsaUNBQXVDO0FBU3ZDLFNBQXNCLEtBQUssQ0FBQyxJQUFpQjs7UUFFM0MsTUFBTSxNQUFNLEdBQUcsZUFBTyxDQUFDLFNBQVMsRUFBRSxDQUFBO1FBRWxDLE1BQU0sRUFDSixLQUFLLEVBQ0wsTUFBTSxFQUNOLEdBQUcsRUFDSixHQUFHLElBQUksQ0FBQztRQUVULE1BQU0sTUFBTSxHQUFHLElBQUksZUFBZSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztRQUNsRCxNQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBUSxDQUFFO1FBQzVDLE1BQU0sQ0FBQyxHQUFHLE1BQU0sYUFBSyxDQUFDLFVBQVUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxFQUFFLE1BQU0sQ0FBQyxDQUFBO1FBRWxELENBQUMsQ0FBQyxNQUFNLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxlQUFlLENBQUMsQ0FBQTtRQUV4QywwREFBMEQ7UUFDMUQsTUFBTSxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUE7UUFFaEIsTUFBTSxJQUFJLEdBQUcsTUFBTSxNQUFNLENBQUMsYUFBYSxFQUFFLENBQUE7UUFDekMsTUFBTSxNQUFNLEdBQUcsR0FBRyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQTtRQUV4QyxPQUFPLE1BQU0sQ0FBQTtJQUNmLENBQUM7Q0FBQTtBQXZCRCxzQkF1QkM7QUFFRCxTQUFnQixrQkFBa0IsQ0FBQyxJQUFpQjtJQUVsRCxNQUFNLEVBQ0osS0FBSyxFQUNMLE1BQU0sRUFDTixHQUFHLEVBQ0osR0FBRyxJQUFJLENBQUM7SUFFVCxJQUFJLEtBQUssR0FBTyxJQUFJLENBQUM7SUFFckIsTUFBTSxDQUFDLE1BQU0sR0FBRyxHQUFTLEVBQUU7UUFDekIsTUFBTSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQXNCLENBQUM7UUFDckUsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQTZCLENBQUM7UUFFaEUsS0FBSyxHQUFHLGFBQUssQ0FBQyxVQUFVLENBQUMsR0FBRyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUV2QywwREFBMEQ7UUFDMUQsS0FBSyxDQUFDLEtBQUssRUFBRSxDQUFDO0lBQ2hCLENBQUMsQ0FBQSxDQUFDO0lBRUYsTUFBTSxDQUFDLGNBQWMsR0FBRyxHQUFHLEVBQUU7UUFDM0IsS0FBSyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQ2YsQ0FBQyxDQUFDO0FBQ0osQ0FBQztBQXZCRCxnREF1QkMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZnVuY3Rpb24gZGVib3VuY2UoIGNhbGxiYWNrOkZ1bmN0aW9uLCB0aW1lb3V0Om51bWJlciA9IDMwMCApIHtcblxuICBsZXQgdGltZXI6YW55O1xuXG4gIGZ1bmN0aW9uIHdyYXBwZXIoLi4uYXJnczogYW55W10pIHtcbiAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgIHRpbWVyID0gc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICBjYWxsYmFjay5hcHBseSggd3JhcHBlciwgYXJncyApO1xuICAgIH0sIHRpbWVvdXQpO1xuICB9XG5cbiAgcmV0dXJuIHdyYXBwZXI7XG59XG5cbmltcG9ydCB7IENhbnZnLCBwcmVzZXRzIH0gZnJvbSAnY2FudmcnO1xuXG5leHBvcnQgaW50ZXJmYWNlIFRvUG5nT3B0aW9ucyB7XG4gIHdpZHRoOiBudW1iZXIsXG4gIGhlaWdodDogbnVtYmVyLFxuICBzdmc6IHN0cmluZ1xufVxuXG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiB0b1BuZyhkYXRhOlRvUG5nT3B0aW9ucykge1xuICBcbiAgY29uc3QgcHJlc2V0ID0gcHJlc2V0cy5vZmZzY3JlZW4oKVxuXG4gIGNvbnN0IHtcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgc3ZnXG4gIH0gPSBkYXRhO1xuXG4gIGNvbnN0IGNhbnZhcyA9IG5ldyBPZmZzY3JlZW5DYW52YXMod2lkdGgsIGhlaWdodCk7XG4gIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpIGFzIGFueSA7XG4gIGNvbnN0IHYgPSBhd2FpdCBDYW52Zy5mcm9tU3RyaW5nKGN0eCwgc3ZnLCBwcmVzZXQpXG4gIFxuICB2LnJlc2l6ZSh3aWR0aCwgaGVpZ2h0LCAneE1pZFlNaWQgbWVldCcpXG5cbiAgLy8gUmVuZGVyIG9ubHkgZmlyc3QgZnJhbWUsIGlnbm9yaW5nIGFuaW1hdGlvbnMgYW5kIG1vdXNlLlxuICBhd2FpdCB2LnJlbmRlcigpXG5cbiAgY29uc3QgYmxvYiA9IGF3YWl0IGNhbnZhcy5jb252ZXJ0VG9CbG9iKClcbiAgY29uc3QgcG5nVXJsID0gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKVxuXG4gIHJldHVybiBwbmdVcmxcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnZlcnRTVkd0b0NhbnZhcyhkYXRhOlRvUG5nT3B0aW9ucykge1xuXG4gIGNvbnN0IHtcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgc3ZnXG4gIH0gPSBkYXRhO1xuXG4gIGxldCBjYW52ZzphbnkgPSBudWxsOyAgXG5cbiAgd2luZG93Lm9ubG9hZCA9IGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdjYW52YXMnKSBhcyBIVE1MQ2FudmFzRWxlbWVudDtcbiAgICBjb25zdCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSBhcyBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gIFxuICAgIGNhbnZnID0gQ2FudmcuZnJvbVN0cmluZyhjdHgsIHN2Zywge30pO1xuICBcbiAgICAvLyBTdGFydCBTVkcgcmVuZGVyaW5nIHdpdGggYW5pbWF0aW9ucyBhbmQgbW91c2UgaGFuZGxpbmcuXG4gICAgY2Fudmcuc3RhcnQoKTtcbiAgfTtcbiAgXG4gIHdpbmRvdy5vbmJlZm9yZXVubG9hZCA9ICgpID0+IHtcbiAgICBjYW52Zy5zdG9wKCk7XG4gIH07XG59Il19

/***/ }),

/***/ "./src/client/index.ts":
/*!*****************************!*\
  !*** ./src/client/index.ts ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const mustache_1 = __importDefault(__webpack_require__(/*! mustache */ "./node_modules/mustache/mustache.js"));
const board_1 = __webpack_require__(/*! ./board */ "./src/client/board.ts");
const helpers_1 = __webpack_require__(/*! ./helpers */ "./src/client/helpers.ts");
const HAUSKA_THEME = Object.assign(Object.assign({}, board_1.DEFAULT_THEME), { backgroud: '#2D1D20', [board_1.T.tw]: {
        background: '#F97218',
        textColor: '#ffffff',
        text: ['TRIPLA', 'SANA', 'PISTEET'],
        triangles: { width: 5, height: 2, gap: 1, amount: 3, fill: '#F97218' }
    }, [board_1.T.dw]: {
        background: '#E4374D',
        textColor: '#ffffff',
        text: ['TUPLA', 'SANA', 'PISTEET'],
        triangles: { width: 5, height: 2, gap: 3, amount: 2, fill: '#E4374D' }
    }, [board_1.T.tl]: {
        background: '#6AAA24',
        textColor: '#ffffff',
        text: ['TRIPLA', 'KIRJAIN', 'PISTEET'],
        triangles: { width: 5, height: 2, gap: 1, amount: 3, fill: '#6AAA24' }
    }, [board_1.T.dl]: {
        background: '#4A8BC5',
        textColor: '#ffffff',
        text: ['TUPLA', 'KIRJAIN', 'PISTEET'],
        triangles: { width: 5, height: 2, gap: 3, amount: 2, fill: '#4A8BC5' }
    }, [board_1.T.ss]: {
        background: '#DD373B',
        textColor: '#ffffff',
        text: []
    }, [board_1.T.ee]: {
        background: '#ffffff',
        textColor: '#000000',
        text: []
    } });
const mustacheData = (0, board_1.createBoardData)(HAUSKA_THEME);
const svgHtml = (0, board_1.renderBoardSVG)(board_1.boardMustacheTemplate, mustacheData);
function renderDocument() {
    const documentHtml = mustache_1.default.render(`
  {{{svg}}}
  
  <style>
  a {
    font-size: 20px;
    display: none;

  }
  img {
    max-width: 100%;
    height: 100%; 
  }

  </style>  
  <img id="board" alt="Board">
  `, { svg: svgHtml });
    document.body.innerHTML = documentHtml;
    //Convert to PNG image and insert it to DOM
    (0, helpers_1.toPng)({
        width: 3000,
        height: 3000,
        svg: svgHtml
    }).then((pngUrl) => {
        const img = document.querySelector('img#board');
        img.src = pngUrl;
    });
}
renderDocument();
//convertSVGtoCanvas();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY2xpZW50L2luZGV4LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBQUEsd0RBQWdDO0FBRWhDLG1DQUEwRztBQUMxRyx1Q0FBa0M7QUFFbEMsTUFBTSxZQUFZLG1DQUViLHFCQUFhLEtBRWhCLFNBQVMsRUFBRSxTQUFTLEVBRXBCLENBQUMsU0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ04sVUFBVSxFQUFFLFNBQVM7UUFDckIsU0FBUyxFQUFFLFNBQVM7UUFDcEIsSUFBSSxFQUFFLENBQUMsUUFBUSxFQUFFLE1BQU0sRUFBRSxTQUFTLENBQUM7UUFDbkMsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO0tBQ3ZFLEVBQ0QsQ0FBQyxTQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDTixVQUFVLEVBQUUsU0FBUztRQUNyQixTQUFTLEVBQUUsU0FBUztRQUNwQixJQUFJLEVBQUUsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLFNBQVMsQ0FBQztRQUNsQyxTQUFTLEVBQUUsRUFBRSxLQUFLLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQUU7S0FDdkUsRUFDRCxDQUFDLFNBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNOLFVBQVUsRUFBRSxTQUFTO1FBQ3JCLFNBQVMsRUFBRSxTQUFTO1FBQ3BCLElBQUksRUFBRSxDQUFDLFFBQVEsRUFBRSxTQUFTLEVBQUUsU0FBUyxDQUFDO1FBQ3RDLFNBQVMsRUFBRSxFQUFFLEtBQUssRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsQ0FBQyxFQUFFLE1BQU0sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLFNBQVMsRUFBRTtLQUN2RSxFQUNELENBQUMsU0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFO1FBQ04sVUFBVSxFQUFFLFNBQVM7UUFDckIsU0FBUyxFQUFFLFNBQVM7UUFDcEIsSUFBSSxFQUFFLENBQUMsT0FBTyxFQUFFLFNBQVMsRUFBRSxTQUFTLENBQUM7UUFDckMsU0FBUyxFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsRUFBRSxNQUFNLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDLEVBQUUsTUFBTSxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFO0tBQ3ZFLEVBQ0QsQ0FBQyxTQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDTixVQUFVLEVBQUUsU0FBUztRQUNyQixTQUFTLEVBQUUsU0FBUztRQUNwQixJQUFJLEVBQUUsRUFBRTtLQUNULEVBQ0QsQ0FBQyxTQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDTixVQUFVLEVBQUUsU0FBUztRQUNyQixTQUFTLEVBQUUsU0FBUztRQUNwQixJQUFJLEVBQUUsRUFBRTtLQUNULEdBQ0YsQ0FBQTtBQUVELE1BQU0sWUFBWSxHQUFHLElBQUEsdUJBQWUsRUFBRSxZQUFZLENBQUUsQ0FBQTtBQUNwRCxNQUFNLE9BQU8sR0FBRyxJQUFBLHNCQUFjLEVBQUUsNkJBQXFCLEVBQUUsWUFBWSxDQUFFLENBQUM7QUFFdEUsU0FBUyxjQUFjO0lBQ3JCLE1BQU0sWUFBWSxHQUFVLGtCQUFRLENBQUMsTUFBTSxDQUFDOzs7Ozs7Ozs7Ozs7Ozs7O0dBZ0IzQyxFQUFFLEVBQUMsR0FBRyxFQUFFLE9BQU8sRUFBQyxDQUFDLENBQUM7SUFFbkIsUUFBUSxDQUFDLElBQUksQ0FBQyxTQUFTLEdBQUcsWUFBWSxDQUFDO0lBRXZDLDJDQUEyQztJQUMzQyxJQUFBLGVBQUssRUFBQztRQUNKLEtBQUssRUFBRSxJQUFJO1FBQ1gsTUFBTSxFQUFFLElBQUk7UUFDWixHQUFHLEVBQUUsT0FBTztLQUNiLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLEVBQUUsRUFBRTtRQUNqQixNQUFNLEdBQUcsR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFdBQVcsQ0FBcUIsQ0FBQztRQUNwRSxHQUFHLENBQUMsR0FBRyxHQUFHLE1BQU0sQ0FBQTtJQUNsQixDQUFDLENBQUMsQ0FBQTtBQUNKLENBQUM7QUFFRCxjQUFjLEVBQUUsQ0FBQztBQUdqQix1QkFBdUIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgbXVzdGFjaGUgZnJvbSAnbXVzdGFjaGUnO1xuXG5pbXBvcnQgeyBib2FyZE11c3RhY2hlVGVtcGxhdGUsIHJlbmRlckJvYXJkU1ZHLCBjcmVhdGVCb2FyZERhdGEsIERFRkFVTFRfVEhFTUUsIFRoZW1lLCBUIH0gZnJvbSAnLi9ib2FyZCc7XG5pbXBvcnQgeyB0b1BuZyB9IGZyb20gJy4vaGVscGVycyc7XG5cbmNvbnN0IEhBVVNLQV9USEVNRTpUaGVtZSA9IHtcblxuICAuLi5ERUZBVUxUX1RIRU1FLFxuXG4gIGJhY2tncm91ZDogJyMyRDFEMjAnLFxuXG4gIFtULnR3XTogey8vVHJpcGxlIHdvcmRcbiAgICBiYWNrZ3JvdW5kOiAnI0Y5NzIxOCcsXG4gICAgdGV4dENvbG9yOiAnI2ZmZmZmZicsXG4gICAgdGV4dDogWydUUklQTEEnLCAnU0FOQScsICdQSVNURUVUJ10sXG4gICAgdHJpYW5nbGVzOiB7IHdpZHRoOiA1LCBoZWlnaHQ6IDIsIGdhcDogMSwgYW1vdW50OiAzLCBmaWxsOiAnI0Y5NzIxOCcgfSAgICBcbiAgfSwgIFxuICBbVC5kd106IHsvL0RvdWJsZSB3b3JkXG4gICAgYmFja2dyb3VuZDogJyNFNDM3NEQnLFxuICAgIHRleHRDb2xvcjogJyNmZmZmZmYnLFxuICAgIHRleHQ6IFsnVFVQTEEnLCAnU0FOQScsICdQSVNURUVUJ10sXG4gICAgdHJpYW5nbGVzOiB7IHdpZHRoOiA1LCBoZWlnaHQ6IDIsIGdhcDogMywgYW1vdW50OiAyLCBmaWxsOiAnI0U0Mzc0RCcgfSAgICBcbiAgfSwgIFxuICBbVC50bF06IHsvL1RyaXBsZSBsZXR0ZXJzXG4gICAgYmFja2dyb3VuZDogJyM2QUFBMjQnLFxuICAgIHRleHRDb2xvcjogJyNmZmZmZmYnLFxuICAgIHRleHQ6IFsnVFJJUExBJywgJ0tJUkpBSU4nLCAnUElTVEVFVCddLFxuICAgIHRyaWFuZ2xlczogeyB3aWR0aDogNSwgaGVpZ2h0OiAyLCBnYXA6IDEsIGFtb3VudDogMywgZmlsbDogJyM2QUFBMjQnIH0gICAgXG4gIH0sXG4gIFtULmRsXTogey8vRG91YmxlIGxldHRlclxuICAgIGJhY2tncm91bmQ6ICcjNEE4QkM1JyxcbiAgICB0ZXh0Q29sb3I6ICcjZmZmZmZmJyxcbiAgICB0ZXh0OiBbJ1RVUExBJywgJ0tJUkpBSU4nLCAnUElTVEVFVCddLFxuICAgIHRyaWFuZ2xlczogeyB3aWR0aDogNSwgaGVpZ2h0OiAyLCBnYXA6IDMsIGFtb3VudDogMiwgZmlsbDogJyM0QThCQzUnIH0gICAgXG4gIH0sXG4gIFtULnNzXTogey8vU3RhcnRcbiAgICBiYWNrZ3JvdW5kOiAnI0REMzczQicsXG4gICAgdGV4dENvbG9yOiAnI2ZmZmZmZicsXG4gICAgdGV4dDogW11cbiAgfSxcbiAgW1QuZWVdOiB7Ly9FbXB0eVxuICAgIGJhY2tncm91bmQ6ICcjZmZmZmZmJyxcbiAgICB0ZXh0Q29sb3I6ICcjMDAwMDAwJyxcbiAgICB0ZXh0OiBbXVxuICB9XG59XG5cbmNvbnN0IG11c3RhY2hlRGF0YSA9IGNyZWF0ZUJvYXJkRGF0YSggSEFVU0tBX1RIRU1FIClcbmNvbnN0IHN2Z0h0bWwgPSByZW5kZXJCb2FyZFNWRyggYm9hcmRNdXN0YWNoZVRlbXBsYXRlLCBtdXN0YWNoZURhdGEgKTtcblxuZnVuY3Rpb24gcmVuZGVyRG9jdW1lbnQoKSB7XG4gIGNvbnN0IGRvY3VtZW50SHRtbDpzdHJpbmcgPSBtdXN0YWNoZS5yZW5kZXIoYFxuICB7e3tzdmd9fX1cbiAgXG4gIDxzdHlsZT5cbiAgYSB7XG4gICAgZm9udC1zaXplOiAyMHB4O1xuICAgIGRpc3BsYXk6IG5vbmU7XG5cbiAgfVxuICBpbWcge1xuICAgIG1heC13aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7IFxuICB9XG5cbiAgPC9zdHlsZT4gIFxuICA8aW1nIGlkPVwiYm9hcmRcIiBhbHQ9XCJCb2FyZFwiPlxuICBgLCB7c3ZnOiBzdmdIdG1sfSk7XG5cbiAgZG9jdW1lbnQuYm9keS5pbm5lckhUTUwgPSBkb2N1bWVudEh0bWw7XG5cbiAgLy9Db252ZXJ0IHRvIFBORyBpbWFnZSBhbmQgaW5zZXJ0IGl0IHRvIERPTVxuICB0b1BuZyh7XG4gICAgd2lkdGg6IDMwMDAsXG4gICAgaGVpZ2h0OiAzMDAwLFxuICAgIHN2Zzogc3ZnSHRtbFxuICB9KS50aGVuKChwbmdVcmwpID0+IHtcbiAgICBjb25zdCBpbWcgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCdpbWcjYm9hcmQnKSBhcyBIVE1MSW1hZ2VFbGVtZW50O1xuICAgIGltZy5zcmMgPSBwbmdVcmxcbiAgfSlcbn1cblxucmVuZGVyRG9jdW1lbnQoKTtcblxuXG4vL2NvbnZlcnRTVkd0b0NhbnZhcygpO1xuXG5cblxuXG5cblxuIl19

/***/ }),

/***/ "./node_modules/canvg/dist/index.cjs":
/*!*******************************************!*\
  !*** ./node_modules/canvg/dist/index.cjs ***!
  \*******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";


Object.defineProperty(exports, "__esModule", ({ value: true }));

var requestAnimationFrame = __webpack_require__(/*! raf */ "./node_modules/raf/index.js");
var RGBColor = __webpack_require__(/*! rgbcolor */ "./node_modules/rgbcolor/index.js");
var svgPathdata = __webpack_require__(/*! svg-pathdata */ "./node_modules/svg-pathdata/lib/SVGPathData.cjs");
var stackblurCanvas = __webpack_require__(/*! stackblur-canvas */ "./node_modules/stackblur-canvas/dist/stackblur-es.js");

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var requestAnimationFrame__default = /*#__PURE__*/_interopDefaultLegacy(requestAnimationFrame);
var RGBColor__default = /*#__PURE__*/_interopDefaultLegacy(RGBColor);

/**
 * Options preset for `OffscreenCanvas`.
 * @param config - Preset requirements.
 * @param config.DOMParser - XML/HTML parser from string into DOM Document.
 * @returns Preset object.
 */ function offscreen() {
    let { DOMParser: DOMParserFallback  } = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const preset = {
        window: null,
        ignoreAnimation: true,
        ignoreMouse: true,
        DOMParser: DOMParserFallback,
        createCanvas (width, height) {
            return new OffscreenCanvas(width, height);
        },
        async createImage (url) {
            const response = await fetch(url);
            const blob = await response.blob();
            const img = await createImageBitmap(blob);
            return img;
        }
    };
    if (typeof globalThis.DOMParser !== 'undefined' || typeof DOMParserFallback === 'undefined') {
        Reflect.deleteProperty(preset, 'DOMParser');
    }
    return preset;
}

/**
 * Options preset for `node-canvas`.
 * @param config - Preset requirements.
 * @param config.DOMParser - XML/HTML parser from string into DOM Document.
 * @param config.canvas - `node-canvas` exports.
 * @param config.fetch - WHATWG-compatible `fetch` function.
 * @returns Preset object.
 */ function node(param) {
    let { DOMParser , canvas , fetch  } = param;
    return {
        window: null,
        ignoreAnimation: true,
        ignoreMouse: true,
        DOMParser,
        fetch,
        createCanvas: canvas.createCanvas,
        createImage: canvas.loadImage
    };
}

var index = /*#__PURE__*/Object.freeze({
  __proto__: null,
  offscreen: offscreen,
  node: node
});

/**
 * HTML-safe compress white-spaces.
 * @param str - String to compress.
 * @returns String.
 */ function compressSpaces(str) {
    return str.replace(/(?!\u3000)\s+/gm, ' ');
}
/**
 * HTML-safe left trim.
 * @param str - String to trim.
 * @returns String.
 */ function trimLeft(str) {
    return str.replace(/^[\n \t]+/, '');
}
/**
 * HTML-safe right trim.
 * @param str - String to trim.
 * @returns String.
 */ function trimRight(str) {
    return str.replace(/[\n \t]+$/, '');
}
/**
 * String to numbers array.
 * @param str - Numbers string.
 * @returns Numbers array.
 */ function toNumbers(str) {
    const matches = str.match(/-?(\d+(?:\.\d*(?:[eE][+-]?\d+)?)?|\.\d+)(?=\D|$)/gm);
    return matches ? matches.map(parseFloat) : [];
}
/**
 * String to matrix value.
 * @param str - Numbers string.
 * @returns Matrix value.
 */ function toMatrixValue(str) {
    const numbers = toNumbers(str);
    const matrix = [
        numbers[0] || 0,
        numbers[1] || 0,
        numbers[2] || 0,
        numbers[3] || 0,
        numbers[4] || 0,
        numbers[5] || 0
    ];
    return matrix;
}
// Microsoft Edge fix
const allUppercase = /^[A-Z-]+$/;
/**
 * Normalize attribute name.
 * @param name - Attribute name.
 * @returns Normalized attribute name.
 */ function normalizeAttributeName(name) {
    if (allUppercase.test(name)) {
        return name.toLowerCase();
    }
    return name;
}
/**
 * Parse external URL.
 * @param url - CSS url string.
 * @returns Parsed URL.
 */ function parseExternalUrl(url) {
    //                      single quotes [2]
    //                      v         double quotes [3]
    //                      v         v         no quotes [4]
    //                      v         v         v
    const urlMatch = /url\(('([^']+)'|"([^"]+)"|([^'")]+))\)/.exec(url);
    if (!urlMatch) {
        return '';
    }
    return urlMatch[2] || urlMatch[3] || urlMatch[4] || '';
}
/**
 * Transform floats to integers in rgb colors.
 * @param color - Color to normalize.
 * @returns Normalized color.
 */ function normalizeColor(color) {
    if (!color.startsWith('rgb')) {
        return color;
    }
    let rgbParts = 3;
    const normalizedColor = color.replace(/\d+(\.\d+)?/g, (num, isFloat)=>(rgbParts--) && isFloat ? String(Math.round(parseFloat(num))) : num
    );
    return normalizedColor;
}

// slightly modified version of https://github.com/keeganstreet/specificity/blob/master/specificity.js
const attributeRegex = /(\[[^\]]+\])/g;
const idRegex = /(#[^\s+>~.[:]+)/g;
const classRegex = /(\.[^\s+>~.[:]+)/g;
const pseudoElementRegex = /(::[^\s+>~.[:]+|:first-line|:first-letter|:before|:after)/gi;
const pseudoClassWithBracketsRegex = /(:[\w-]+\([^)]*\))/gi;
const pseudoClassRegex = /(:[^\s+>~.[:]+)/g;
const elementRegex = /([^\s+>~.[:]+)/g;
function findSelectorMatch(selector, regex) {
    const matches = regex.exec(selector);
    if (!matches) {
        return [
            selector,
            0
        ];
    }
    return [
        selector.replace(regex, ' '),
        matches.length
    ];
}
/**
 * Measure selector specificity.
 * @param selector - Selector to measure.
 * @returns Specificity.
 */ function getSelectorSpecificity(selector) {
    const specificity = [
        0,
        0,
        0
    ];
    let currentSelector = selector.replace(/:not\(([^)]*)\)/g, '     $1 ').replace(/{[\s\S]*/gm, ' ');
    let delta = 0;
    [currentSelector, delta] = findSelectorMatch(currentSelector, attributeRegex);
    specificity[1] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, idRegex);
    specificity[0] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, classRegex);
    specificity[1] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, pseudoElementRegex);
    specificity[2] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, pseudoClassWithBracketsRegex);
    specificity[1] += delta;
    [currentSelector, delta] = findSelectorMatch(currentSelector, pseudoClassRegex);
    specificity[1] += delta;
    currentSelector = currentSelector.replace(/[*\s+>~]/g, ' ').replace(/[#.]/g, ' ');
    [currentSelector, delta] = findSelectorMatch(currentSelector, elementRegex) // lgtm [js/useless-assignment-to-local]
    ;
    specificity[2] += delta;
    return specificity.join('');
}

const PSEUDO_ZERO = 0.00000001;
/**
 * Vector magnitude.
 * @param v
 * @returns Number result.
 */ function vectorMagnitude(v) {
    return Math.sqrt(Math.pow(v[0], 2) + Math.pow(v[1], 2));
}
/**
 * Ratio between two vectors.
 * @param u
 * @param v
 * @returns Number result.
 */ function vectorsRatio(u, v) {
    return (u[0] * v[0] + u[1] * v[1]) / (vectorMagnitude(u) * vectorMagnitude(v));
}
/**
 * Angle between two vectors.
 * @param u
 * @param v
 * @returns Number result.
 */ function vectorsAngle(u, v) {
    return (u[0] * v[1] < u[1] * v[0] ? -1 : 1) * Math.acos(vectorsRatio(u, v));
}
function CB1(t) {
    return t * t * t;
}
function CB2(t) {
    return 3 * t * t * (1 - t);
}
function CB3(t) {
    return 3 * t * (1 - t) * (1 - t);
}
function CB4(t) {
    return (1 - t) * (1 - t) * (1 - t);
}
function QB1(t) {
    return t * t;
}
function QB2(t) {
    return 2 * t * (1 - t);
}
function QB3(t) {
    return (1 - t) * (1 - t);
}

class Property {
    static empty(document) {
        return new Property(document, 'EMPTY', '');
    }
    split() {
        let separator = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : ' ';
        const { document , name  } = this;
        return compressSpaces(this.getString()).trim().split(separator).map((value)=>new Property(document, name, value)
        );
    }
    hasValue(zeroIsValue) {
        const value = this.value;
        return value !== null && value !== '' && (zeroIsValue || value !== 0) && typeof value !== 'undefined';
    }
    isString(regexp) {
        const { value  } = this;
        const result = typeof value === 'string';
        if (!result || !regexp) {
            return result;
        }
        return regexp.test(value);
    }
    isUrlDefinition() {
        return this.isString(/^url\(/);
    }
    isPixels() {
        if (!this.hasValue()) {
            return false;
        }
        const asString = this.getString();
        switch(true){
            case asString.endsWith('px'):
            case /^[0-9]+$/.test(asString):
                return true;
            default:
                return false;
        }
    }
    setValue(value) {
        this.value = value;
        return this;
    }
    getValue(def) {
        if (typeof def === 'undefined' || this.hasValue()) {
            return this.value;
        }
        return def;
    }
    getNumber(def) {
        if (!this.hasValue()) {
            if (typeof def === 'undefined') {
                return 0;
            }
            // @ts-expect-error Parse unknown value.
            return parseFloat(def);
        }
        const { value  } = this;
        // @ts-expect-error Parse unknown value.
        let n = parseFloat(value);
        if (this.isString(/%$/)) {
            n /= 100;
        }
        return n;
    }
    getString(def) {
        if (typeof def === 'undefined' || this.hasValue()) {
            return typeof this.value === 'undefined' ? '' : String(this.value);
        }
        return String(def);
    }
    getColor(def) {
        let color = this.getString(def);
        if (this.isNormalizedColor) {
            return color;
        }
        this.isNormalizedColor = true;
        color = normalizeColor(color);
        this.value = color;
        return color;
    }
    getDpi() {
        return 96 // TODO: compute?
        ;
    }
    getRem() {
        return this.document.rootEmSize;
    }
    getEm() {
        return this.document.emSize;
    }
    getUnits() {
        return this.getString().replace(/[0-9.-]/g, '');
    }
    getPixels(axisOrIsFontSize) {
        let processPercent = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        if (!this.hasValue()) {
            return 0;
        }
        const [axis, isFontSize] = typeof axisOrIsFontSize === 'boolean' ? [
            undefined,
            axisOrIsFontSize
        ] : [
            axisOrIsFontSize
        ];
        const { viewPort  } = this.document.screen;
        switch(true){
            case this.isString(/vmin$/):
                return this.getNumber() / 100 * Math.min(viewPort.computeSize('x'), viewPort.computeSize('y'));
            case this.isString(/vmax$/):
                return this.getNumber() / 100 * Math.max(viewPort.computeSize('x'), viewPort.computeSize('y'));
            case this.isString(/vw$/):
                return this.getNumber() / 100 * viewPort.computeSize('x');
            case this.isString(/vh$/):
                return this.getNumber() / 100 * viewPort.computeSize('y');
            case this.isString(/rem$/):
                return this.getNumber() * this.getRem();
            case this.isString(/em$/):
                return this.getNumber() * this.getEm();
            case this.isString(/ex$/):
                return this.getNumber() * this.getEm() / 2;
            case this.isString(/px$/):
                return this.getNumber();
            case this.isString(/pt$/):
                return this.getNumber() * this.getDpi() * (1 / 72);
            case this.isString(/pc$/):
                return this.getNumber() * 15;
            case this.isString(/cm$/):
                return this.getNumber() * this.getDpi() / 2.54;
            case this.isString(/mm$/):
                return this.getNumber() * this.getDpi() / 25.4;
            case this.isString(/in$/):
                return this.getNumber() * this.getDpi();
            case this.isString(/%$/) && isFontSize:
                return this.getNumber() * this.getEm();
            case this.isString(/%$/):
                return this.getNumber() * viewPort.computeSize(axis);
            default:
                {
                    const n = this.getNumber();
                    if (processPercent && n < 1) {
                        return n * viewPort.computeSize(axis);
                    }
                    return n;
                }
        }
    }
    getMilliseconds() {
        if (!this.hasValue()) {
            return 0;
        }
        if (this.isString(/ms$/)) {
            return this.getNumber();
        }
        return this.getNumber() * 1000;
    }
    getRadians() {
        if (!this.hasValue()) {
            return 0;
        }
        switch(true){
            case this.isString(/deg$/):
                return this.getNumber() * (Math.PI / 180);
            case this.isString(/grad$/):
                return this.getNumber() * (Math.PI / 200);
            case this.isString(/rad$/):
                return this.getNumber();
            default:
                return this.getNumber() * (Math.PI / 180);
        }
    }
    getDefinition() {
        const asString = this.getString();
        const match = /#([^)'"]+)/.exec(asString);
        const name = (match === null || match === void 0 ? void 0 : match[1]) || asString;
        return this.document.definitions[name];
    }
    getFillStyleDefinition(element, opacity) {
        let def = this.getDefinition();
        if (!def) {
            return null;
        }
        // gradient
        if (typeof def.createGradient === 'function' && 'getBoundingBox' in element) {
            return def.createGradient(this.document.ctx, element, opacity);
        }
        // pattern
        if (typeof def.createPattern === 'function') {
            if (def.getHrefAttribute().hasValue()) {
                const patternTransform = def.getAttribute('patternTransform');
                def = def.getHrefAttribute().getDefinition();
                if (def && patternTransform.hasValue()) {
                    def.getAttribute('patternTransform', true).setValue(patternTransform.value);
                }
            }
            if (def) {
                return def.createPattern(this.document.ctx, element, opacity);
            }
        }
        return null;
    }
    getTextBaseline() {
        if (!this.hasValue()) {
            return null;
        }
        const key = this.getString();
        return Property.textBaselineMapping[key] || null;
    }
    addOpacity(opacity) {
        let value = this.getColor();
        const len = value.length;
        let commas = 0;
        // Simulate old RGBColor version, which can't parse rgba.
        for(let i = 0; i < len; i++){
            if (value[i] === ',') {
                commas++;
            }
            if (commas === 3) {
                break;
            }
        }
        if (opacity.hasValue() && this.isString() && commas !== 3) {
            const color = new RGBColor__default["default"](value);
            if (color.ok) {
                color.alpha = opacity.getNumber();
                value = color.toRGBA();
            }
        }
        return new Property(this.document, this.name, value);
    }
    constructor(document, name, value){
        this.document = document;
        this.name = name;
        this.value = value;
        this.isNormalizedColor = false;
    }
}
Property.textBaselineMapping = {
    'baseline': 'alphabetic',
    'before-edge': 'top',
    'text-before-edge': 'top',
    'middle': 'middle',
    'central': 'middle',
    'after-edge': 'bottom',
    'text-after-edge': 'bottom',
    'ideographic': 'ideographic',
    'alphabetic': 'alphabetic',
    'hanging': 'hanging',
    'mathematical': 'alphabetic'
};

class ViewPort {
    clear() {
        this.viewPorts = [];
    }
    setCurrent(width, height) {
        this.viewPorts.push({
            width,
            height
        });
    }
    removeCurrent() {
        this.viewPorts.pop();
    }
    getRoot() {
        const [root] = this.viewPorts;
        if (!root) {
            return getDefault();
        }
        return root;
    }
    getCurrent() {
        const { viewPorts  } = this;
        const current = viewPorts[viewPorts.length - 1];
        if (!current) {
            return getDefault();
        }
        return current;
    }
    get width() {
        return this.getCurrent().width;
    }
    get height() {
        return this.getCurrent().height;
    }
    computeSize(d) {
        if (typeof d === 'number') {
            return d;
        }
        if (d === 'x') {
            return this.width;
        }
        if (d === 'y') {
            return this.height;
        }
        return Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / Math.sqrt(2);
    }
    constructor(){
        this.viewPorts = [];
    }
}
ViewPort.DEFAULT_VIEWPORT_WIDTH = 800;
ViewPort.DEFAULT_VIEWPORT_HEIGHT = 600;
function getDefault() {
    return {
        width: ViewPort.DEFAULT_VIEWPORT_WIDTH,
        height: ViewPort.DEFAULT_VIEWPORT_HEIGHT
    };
}

class Point {
    static parse(point) {
        let defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
        const [x = defaultValue, y = defaultValue] = toNumbers(point);
        return new Point(x, y);
    }
    static parseScale(scale) {
        let defaultValue = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 1;
        const [x = defaultValue, y = x] = toNumbers(scale);
        return new Point(x, y);
    }
    static parsePath(path) {
        const points = toNumbers(path);
        const len = points.length;
        const pathPoints = [];
        for(let i = 0; i < len; i += 2){
            pathPoints.push(new Point(points[i], points[i + 1]));
        }
        return pathPoints;
    }
    angleTo(point) {
        return Math.atan2(point.y - this.y, point.x - this.x);
    }
    applyTransform(transform) {
        const { x , y  } = this;
        const xp = x * transform[0] + y * transform[2] + transform[4];
        const yp = x * transform[1] + y * transform[3] + transform[5];
        this.x = xp;
        this.y = yp;
    }
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}

class Mouse {
    isWorking() {
        return this.working;
    }
    start() {
        if (this.working) {
            return;
        }
        const { screen , onClick , onMouseMove  } = this;
        const canvas = screen.ctx.canvas;
        canvas.onclick = onClick;
        canvas.onmousemove = onMouseMove;
        this.working = true;
    }
    stop() {
        if (!this.working) {
            return;
        }
        const canvas = this.screen.ctx.canvas;
        this.working = false;
        canvas.onclick = null;
        canvas.onmousemove = null;
    }
    hasEvents() {
        return this.working && this.events.length > 0;
    }
    runEvents() {
        if (!this.working) {
            return;
        }
        const { screen: document , events , eventElements  } = this;
        const { style  } = document.ctx.canvas;
        let element;
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (style) {
            style.cursor = '';
        }
        events.forEach((param, i)=>{
            let { run  } = param;
            element = eventElements[i];
            while(element){
                run(element);
                element = element.parent;
            }
        });
        // done running, clear
        this.events = [];
        this.eventElements = [];
    }
    checkPath(element, ctx) {
        if (!this.working || !ctx) {
            return;
        }
        const { events , eventElements  } = this;
        events.forEach((param, i)=>{
            let { x , y  } = param;
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (!eventElements[i] && ctx.isPointInPath && ctx.isPointInPath(x, y)) {
                eventElements[i] = element;
            }
        });
    }
    checkBoundingBox(element, boundingBox) {
        if (!this.working || !boundingBox) {
            return;
        }
        const { events , eventElements  } = this;
        events.forEach((param, i)=>{
            let { x , y  } = param;
            if (!eventElements[i] && boundingBox.isPointInBox(x, y)) {
                eventElements[i] = element;
            }
        });
    }
    mapXY(x, y) {
        const { window , ctx  } = this.screen;
        const point = new Point(x, y);
        let element = ctx.canvas;
        while(element){
            point.x -= element.offsetLeft;
            point.y -= element.offsetTop;
            element = element.offsetParent;
        }
        if (window === null || window === void 0 ? void 0 : window.scrollX) {
            point.x += window.scrollX;
        }
        if (window === null || window === void 0 ? void 0 : window.scrollY) {
            point.y += window.scrollY;
        }
        return point;
    }
    onClick(event) {
        const { x , y  } = this.mapXY(event.clientX, event.clientY);
        this.events.push({
            type: 'onclick',
            x,
            y,
            run (eventTarget) {
                if (eventTarget.onClick) {
                    eventTarget.onClick();
                }
            }
        });
    }
    onMouseMove(event) {
        const { x , y  } = this.mapXY(event.clientX, event.clientY);
        this.events.push({
            type: 'onmousemove',
            x,
            y,
            run (eventTarget) {
                if (eventTarget.onMouseMove) {
                    eventTarget.onMouseMove();
                }
            }
        });
    }
    constructor(screen){
        this.screen = screen;
        this.working = false;
        this.events = [];
        this.eventElements = [];
        this.onClick = this.onClick.bind(this);
        this.onMouseMove = this.onMouseMove.bind(this);
    }
}

const defaultWindow = typeof window !== 'undefined' ? window : null;
const defaultFetch$1 = typeof fetch !== 'undefined' ? fetch.bind(undefined) // `fetch` depends on context: `someObject.fetch(...)` will throw error.
 : undefined;
class Screen {
    wait(checker) {
        this.waits.push(checker);
    }
    ready() {
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        if (!this.readyPromise) {
            return Promise.resolve();
        }
        return this.readyPromise;
    }
    isReady() {
        if (this.isReadyLock) {
            return true;
        }
        const isReadyLock = this.waits.every((_)=>_()
        );
        if (isReadyLock) {
            this.waits = [];
            if (this.resolveReady) {
                this.resolveReady();
            }
        }
        this.isReadyLock = isReadyLock;
        return isReadyLock;
    }
    setDefaults(ctx) {
        // initial values and defaults
        ctx.strokeStyle = 'rgba(0,0,0,0)';
        ctx.lineCap = 'butt';
        ctx.lineJoin = 'miter';
        ctx.miterLimit = 4;
    }
    setViewBox(param) {
        let { document , ctx , aspectRatio , width , desiredWidth , height , desiredHeight , minX =0 , minY =0 , refX , refY , clip =false , clipX =0 , clipY =0  } = param;
        // aspect ratio - http://www.w3.org/TR/SVG/coords.html#PreserveAspectRatioAttribute
        const cleanAspectRatio = compressSpaces(aspectRatio).replace(/^defer\s/, '') // ignore defer
        ;
        const [aspectRatioAlign, aspectRatioMeetOrSlice] = cleanAspectRatio.split(' ');
        const align = aspectRatioAlign || 'xMidYMid';
        const meetOrSlice = aspectRatioMeetOrSlice || 'meet';
        // calculate scale
        const scaleX = width / desiredWidth;
        const scaleY = height / desiredHeight;
        const scaleMin = Math.min(scaleX, scaleY);
        const scaleMax = Math.max(scaleX, scaleY);
        let finalDesiredWidth = desiredWidth;
        let finalDesiredHeight = desiredHeight;
        if (meetOrSlice === 'meet') {
            finalDesiredWidth *= scaleMin;
            finalDesiredHeight *= scaleMin;
        }
        if (meetOrSlice === 'slice') {
            finalDesiredWidth *= scaleMax;
            finalDesiredHeight *= scaleMax;
        }
        const refXProp = new Property(document, 'refX', refX);
        const refYProp = new Property(document, 'refY', refY);
        const hasRefs = refXProp.hasValue() && refYProp.hasValue();
        if (hasRefs) {
            ctx.translate(-scaleMin * refXProp.getPixels('x'), -scaleMin * refYProp.getPixels('y'));
        }
        if (clip) {
            const scaledClipX = scaleMin * clipX;
            const scaledClipY = scaleMin * clipY;
            ctx.beginPath();
            ctx.moveTo(scaledClipX, scaledClipY);
            ctx.lineTo(width, scaledClipY);
            ctx.lineTo(width, height);
            ctx.lineTo(scaledClipX, height);
            ctx.closePath();
            ctx.clip();
        }
        if (!hasRefs) {
            const isMeetMinY = meetOrSlice === 'meet' && scaleMin === scaleY;
            const isSliceMaxY = meetOrSlice === 'slice' && scaleMax === scaleY;
            const isMeetMinX = meetOrSlice === 'meet' && scaleMin === scaleX;
            const isSliceMaxX = meetOrSlice === 'slice' && scaleMax === scaleX;
            if (align.startsWith('xMid') && (isMeetMinY || isSliceMaxY)) {
                ctx.translate(width / 2 - finalDesiredWidth / 2, 0);
            }
            if (align.endsWith('YMid') && (isMeetMinX || isSliceMaxX)) {
                ctx.translate(0, height / 2 - finalDesiredHeight / 2);
            }
            if (align.startsWith('xMax') && (isMeetMinY || isSliceMaxY)) {
                ctx.translate(width - finalDesiredWidth, 0);
            }
            if (align.endsWith('YMax') && (isMeetMinX || isSliceMaxX)) {
                ctx.translate(0, height - finalDesiredHeight);
            }
        }
        // scale
        switch(true){
            case align === 'none':
                ctx.scale(scaleX, scaleY);
                break;
            case meetOrSlice === 'meet':
                ctx.scale(scaleMin, scaleMin);
                break;
            case meetOrSlice === 'slice':
                ctx.scale(scaleMax, scaleMax);
                break;
        }
        // translate
        ctx.translate(-minX, -minY);
    }
    start(element) {
        let { enableRedraw =false , ignoreMouse =false , ignoreAnimation =false , ignoreDimensions =false , ignoreClear =false , forceRedraw , scaleWidth , scaleHeight , offsetX , offsetY  } = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        const { mouse  } = this;
        const frameDuration = 1000 / Screen.FRAMERATE;
        this.frameDuration = frameDuration;
        this.readyPromise = new Promise((resolve)=>{
            this.resolveReady = resolve;
        });
        if (this.isReady()) {
            this.render(element, ignoreDimensions, ignoreClear, scaleWidth, scaleHeight, offsetX, offsetY);
        }
        if (!enableRedraw) {
            return;
        }
        let now = Date.now();
        let then = now;
        let delta = 0;
        const tick = ()=>{
            now = Date.now();
            delta = now - then;
            if (delta >= frameDuration) {
                then = now - delta % frameDuration;
                if (this.shouldUpdate(ignoreAnimation, forceRedraw)) {
                    this.render(element, ignoreDimensions, ignoreClear, scaleWidth, scaleHeight, offsetX, offsetY);
                    mouse.runEvents();
                }
            }
            this.intervalId = requestAnimationFrame__default["default"](tick);
        };
        if (!ignoreMouse) {
            mouse.start();
        }
        this.intervalId = requestAnimationFrame__default["default"](tick);
    }
    stop() {
        if (this.intervalId) {
            requestAnimationFrame__default["default"].cancel(this.intervalId);
            this.intervalId = null;
        }
        this.mouse.stop();
    }
    shouldUpdate(ignoreAnimation, forceRedraw) {
        // need update from animations?
        if (!ignoreAnimation) {
            const { frameDuration  } = this;
            const shouldUpdate1 = this.animations.reduce((shouldUpdate, animation)=>animation.update(frameDuration) || shouldUpdate
            , false);
            if (shouldUpdate1) {
                return true;
            }
        }
        // need update from redraw?
        if (typeof forceRedraw === 'function' && forceRedraw()) {
            return true;
        }
        if (!this.isReadyLock && this.isReady()) {
            return true;
        }
        // need update from mouse events?
        if (this.mouse.hasEvents()) {
            return true;
        }
        return false;
    }
    render(element, ignoreDimensions, ignoreClear, scaleWidth, scaleHeight, offsetX, offsetY) {
        const { viewPort , ctx , isFirstRender  } = this;
        const canvas = ctx.canvas;
        viewPort.clear();
        if (canvas.width && canvas.height) {
            viewPort.setCurrent(canvas.width, canvas.height);
        }
        const widthStyle = element.getStyle('width');
        const heightStyle = element.getStyle('height');
        if (!ignoreDimensions && (isFirstRender || typeof scaleWidth !== 'number' && typeof scaleHeight !== 'number')) {
            // set canvas size
            if (widthStyle.hasValue()) {
                canvas.width = widthStyle.getPixels('x');
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (canvas.style) {
                    canvas.style.width = "".concat(canvas.width, "px");
                }
            }
            if (heightStyle.hasValue()) {
                canvas.height = heightStyle.getPixels('y');
                // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
                if (canvas.style) {
                    canvas.style.height = "".concat(canvas.height, "px");
                }
            }
        }
        let cWidth = canvas.clientWidth || canvas.width;
        let cHeight = canvas.clientHeight || canvas.height;
        if (ignoreDimensions && widthStyle.hasValue() && heightStyle.hasValue()) {
            cWidth = widthStyle.getPixels('x');
            cHeight = heightStyle.getPixels('y');
        }
        viewPort.setCurrent(cWidth, cHeight);
        if (typeof offsetX === 'number') {
            element.getAttribute('x', true).setValue(offsetX);
        }
        if (typeof offsetY === 'number') {
            element.getAttribute('y', true).setValue(offsetY);
        }
        if (typeof scaleWidth === 'number' || typeof scaleHeight === 'number') {
            const viewBox = toNumbers(element.getAttribute('viewBox').getString());
            let xRatio = 0;
            let yRatio = 0;
            if (typeof scaleWidth === 'number') {
                const widthStyle = element.getStyle('width');
                if (widthStyle.hasValue()) {
                    xRatio = widthStyle.getPixels('x') / scaleWidth;
                } else if (viewBox[2] && !isNaN(viewBox[2])) {
                    xRatio = viewBox[2] / scaleWidth;
                }
            }
            if (typeof scaleHeight === 'number') {
                const heightStyle = element.getStyle('height');
                if (heightStyle.hasValue()) {
                    yRatio = heightStyle.getPixels('y') / scaleHeight;
                } else if (viewBox[3] && !isNaN(viewBox[3])) {
                    yRatio = viewBox[3] / scaleHeight;
                }
            }
            if (!xRatio) {
                xRatio = yRatio;
            }
            if (!yRatio) {
                yRatio = xRatio;
            }
            element.getAttribute('width', true).setValue(scaleWidth);
            element.getAttribute('height', true).setValue(scaleHeight);
            const transformStyle = element.getStyle('transform', true, true);
            transformStyle.setValue("".concat(transformStyle.getString(), " scale(").concat(1 / xRatio, ", ").concat(1 / yRatio, ")"));
        }
        // clear and render
        if (!ignoreClear) {
            ctx.clearRect(0, 0, cWidth, cHeight);
        }
        element.render(ctx);
        if (isFirstRender) {
            this.isFirstRender = false;
        }
    }
    constructor(ctx, { fetch =defaultFetch$1 , window =defaultWindow  } = {}){
        this.ctx = ctx;
        this.viewPort = new ViewPort();
        this.mouse = new Mouse(this);
        this.animations = [];
        this.waits = [];
        this.frameDuration = 0;
        this.isReadyLock = false;
        this.isFirstRender = true;
        this.intervalId = null;
        this.window = window;
        if (!fetch) {
            throw new Error("Can't find 'fetch' in 'globalThis', please provide it via options");
        }
        this.fetch = fetch;
    }
}
Screen.defaultWindow = defaultWindow;
Screen.defaultFetch = defaultFetch$1;
Screen.FRAMERATE = 30;
Screen.MAX_VIRTUAL_PIXELS = 30000;

const { defaultFetch  } = Screen;
const DefaultDOMParser = typeof DOMParser !== 'undefined' ? DOMParser : undefined;
class Parser {
    async parse(resource) {
        if (resource.startsWith('<')) {
            return this.parseFromString(resource);
        }
        return this.load(resource);
    }
    parseFromString(xml) {
        const parser = new this.DOMParser();
        try {
            return this.checkDocument(parser.parseFromString(xml, 'image/svg+xml'));
        } catch (err) {
            return this.checkDocument(parser.parseFromString(xml, 'text/xml'));
        }
    }
    checkDocument(document) {
        const parserError = document.getElementsByTagName('parsererror')[0];
        if (parserError) {
            throw new Error(parserError.textContent || 'Unknown parse error');
        }
        return document;
    }
    async load(url) {
        const response = await this.fetch(url);
        const xml = await response.text();
        return this.parseFromString(xml);
    }
    constructor({ fetch =defaultFetch , DOMParser =DefaultDOMParser  } = {}){
        if (!fetch) {
            throw new Error("Can't find 'fetch' in 'globalThis', please provide it via options");
        }
        if (!DOMParser) {
            throw new Error("Can't find 'DOMParser' in 'globalThis', please provide it via options");
        }
        this.fetch = fetch;
        this.DOMParser = DOMParser;
    }
}

class Translate {
    apply(ctx) {
        const { x , y  } = this.point;
        ctx.translate(x || 0, y || 0);
    }
    unapply(ctx) {
        const { x , y  } = this.point;
        ctx.translate(-1 * x || 0, -1 * y || 0);
    }
    applyToPoint(point) {
        const { x , y  } = this.point;
        point.applyTransform([
            1,
            0,
            0,
            1,
            x || 0,
            y || 0
        ]);
    }
    constructor(_, point){
        this.type = 'translate';
        this.point = Point.parse(point);
    }
}

class Rotate {
    apply(ctx) {
        const { cx , cy , originX , originY , angle  } = this;
        const tx = cx + originX.getPixels('x');
        const ty = cy + originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.rotate(angle.getRadians());
        ctx.translate(-tx, -ty);
    }
    unapply(ctx) {
        const { cx , cy , originX , originY , angle  } = this;
        const tx = cx + originX.getPixels('x');
        const ty = cy + originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.rotate(-1 * angle.getRadians());
        ctx.translate(-tx, -ty);
    }
    applyToPoint(point) {
        const { cx , cy , angle  } = this;
        const rad = angle.getRadians();
        point.applyTransform([
            1,
            0,
            0,
            1,
            cx || 0,
            cy || 0 // this.p.y
        ]);
        point.applyTransform([
            Math.cos(rad),
            Math.sin(rad),
            -Math.sin(rad),
            Math.cos(rad),
            0,
            0
        ]);
        point.applyTransform([
            1,
            0,
            0,
            1,
            -cx || 0,
            -cy || 0 // -this.p.y
        ]);
    }
    constructor(document, rotate, transformOrigin){
        this.type = 'rotate';
        const numbers = toNumbers(rotate);
        this.angle = new Property(document, 'angle', numbers[0]);
        this.originX = transformOrigin[0];
        this.originY = transformOrigin[1];
        this.cx = numbers[1] || 0;
        this.cy = numbers[2] || 0;
    }
}

class Scale {
    apply(ctx) {
        const { scale: { x , y  } , originX , originY  } = this;
        const tx = originX.getPixels('x');
        const ty = originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.scale(x, y || x);
        ctx.translate(-tx, -ty);
    }
    unapply(ctx) {
        const { scale: { x , y  } , originX , originY  } = this;
        const tx = originX.getPixels('x');
        const ty = originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.scale(1 / x, 1 / y || x);
        ctx.translate(-tx, -ty);
    }
    applyToPoint(point) {
        const { x , y  } = this.scale;
        point.applyTransform([
            x || 0,
            0,
            0,
            y || 0,
            0,
            0
        ]);
    }
    constructor(_, scale, transformOrigin){
        this.type = 'scale';
        const scaleSize = Point.parseScale(scale);
        // Workaround for node-canvas
        if (scaleSize.x === 0 || scaleSize.y === 0) {
            scaleSize.x = PSEUDO_ZERO;
            scaleSize.y = PSEUDO_ZERO;
        }
        this.scale = scaleSize;
        this.originX = transformOrigin[0];
        this.originY = transformOrigin[1];
    }
}

class Matrix {
    apply(ctx) {
        const { originX , originY , matrix  } = this;
        const tx = originX.getPixels('x');
        const ty = originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.transform(matrix[0], matrix[1], matrix[2], matrix[3], matrix[4], matrix[5]);
        ctx.translate(-tx, -ty);
    }
    unapply(ctx) {
        const { originX , originY , matrix  } = this;
        const a = matrix[0];
        const b = matrix[2];
        const c = matrix[4];
        const d = matrix[1];
        const e = matrix[3];
        const f = matrix[5];
        const g = 0;
        const h = 0;
        const i = 1;
        const det = 1 / (a * (e * i - f * h) - b * (d * i - f * g) + c * (d * h - e * g));
        const tx = originX.getPixels('x');
        const ty = originY.getPixels('y');
        ctx.translate(tx, ty);
        ctx.transform(det * (e * i - f * h), det * (f * g - d * i), det * (c * h - b * i), det * (a * i - c * g), det * (b * f - c * e), det * (c * d - a * f));
        ctx.translate(-tx, -ty);
    }
    applyToPoint(point) {
        point.applyTransform(this.matrix);
    }
    constructor(_, matrix, transformOrigin){
        this.type = 'matrix';
        this.matrix = toMatrixValue(matrix);
        this.originX = transformOrigin[0];
        this.originY = transformOrigin[1];
    }
}

class Skew extends Matrix {
    constructor(document, skew, transformOrigin){
        super(document, skew, transformOrigin);
        this.type = 'skew';
        this.angle = new Property(document, 'angle', skew);
    }
}

class SkewX extends Skew {
    constructor(document, skew, transformOrigin){
        super(document, skew, transformOrigin);
        this.type = 'skewX';
        this.matrix = [
            1,
            0,
            Math.tan(this.angle.getRadians()),
            1,
            0,
            0
        ];
    }
}

class SkewY extends Skew {
    constructor(document, skew, transformOrigin){
        super(document, skew, transformOrigin);
        this.type = 'skewY';
        this.matrix = [
            1,
            Math.tan(this.angle.getRadians()),
            0,
            1,
            0,
            0
        ];
    }
}

function parseTransforms(transform) {
    return compressSpaces(transform).trim().replace(/\)([a-zA-Z])/g, ') $1').replace(/\)(\s?,\s?)/g, ') ').split(/\s(?=[a-z])/);
}
function parseTransform(transform) {
    const [type = '', value = ''] = transform.split('(');
    return [
        type.trim(),
        value.trim().replace(')', '')
    ];
}
class Transform {
    static fromElement(document, element) {
        const transformStyle = element.getStyle('transform', false, true);
        if (transformStyle.hasValue()) {
            const [transformOriginXProperty, transformOriginYProperty = transformOriginXProperty] = element.getStyle('transform-origin', false, true).split();
            if (transformOriginXProperty && transformOriginYProperty) {
                const transformOrigin = [
                    transformOriginXProperty,
                    transformOriginYProperty
                ];
                return new Transform(document, transformStyle.getString(), transformOrigin);
            }
        }
        return null;
    }
    apply(ctx) {
        this.transforms.forEach((transform)=>transform.apply(ctx)
        );
    }
    unapply(ctx) {
        this.transforms.forEach((transform)=>transform.unapply(ctx)
        );
    }
    // TODO: applyToPoint unused ... remove?
    applyToPoint(point) {
        this.transforms.forEach((transform)=>transform.applyToPoint(point)
        );
    }
    constructor(document, transform1, transformOrigin){
        this.document = document;
        this.transforms = [];
        const data = parseTransforms(transform1);
        data.forEach((transform)=>{
            if (transform === 'none') {
                return;
            }
            const [type, value] = parseTransform(transform);
            const TransformType = Transform.transformTypes[type];
            if (TransformType) {
                this.transforms.push(new TransformType(this.document, value, transformOrigin));
            }
        });
    }
}
Transform.transformTypes = {
    translate: Translate,
    rotate: Rotate,
    scale: Scale,
    matrix: Matrix,
    skewX: SkewX,
    skewY: SkewY
};

class Element {
    getAttribute(name) {
        let createIfNotExists = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        const attr = this.attributes[name];
        if (!attr && createIfNotExists) {
            const attr = new Property(this.document, name, '');
            this.attributes[name] = attr;
            return attr;
        }
        return attr || Property.empty(this.document);
    }
    getHrefAttribute() {
        let href;
        for(const key in this.attributes){
            if (key === 'href' || key.endsWith(':href')) {
                href = this.attributes[key];
                break;
            }
        }
        return href || Property.empty(this.document);
    }
    getStyle(name) {
        let createIfNotExists = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false, skipAncestors = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        const style = this.styles[name];
        if (style) {
            return style;
        }
        const attr = this.getAttribute(name);
        if (attr.hasValue()) {
            this.styles[name] = attr // move up to me to cache
            ;
            return attr;
        }
        if (!skipAncestors) {
            const { parent  } = this;
            if (parent) {
                const parentStyle = parent.getStyle(name);
                if (parentStyle.hasValue()) {
                    return parentStyle;
                }
            }
        }
        if (createIfNotExists) {
            const style = new Property(this.document, name, '');
            this.styles[name] = style;
            return style;
        }
        return Property.empty(this.document);
    }
    render(ctx) {
        // don't render display=none
        // don't render visibility=hidden
        if (this.getStyle('display').getString() === 'none' || this.getStyle('visibility').getString() === 'hidden') {
            return;
        }
        ctx.save();
        if (this.getStyle('mask').hasValue()) {
            const mask = this.getStyle('mask').getDefinition();
            if (mask) {
                this.applyEffects(ctx);
                mask.apply(ctx, this);
            }
        } else if (this.getStyle('filter').getValue('none') !== 'none') {
            const filter = this.getStyle('filter').getDefinition();
            if (filter) {
                this.applyEffects(ctx);
                filter.apply(ctx, this);
            }
        } else {
            this.setContext(ctx);
            this.renderChildren(ctx);
            this.clearContext(ctx);
        }
        ctx.restore();
    }
    setContext(_) {
    // NO RENDER
    }
    applyEffects(ctx) {
        // transform
        const transform = Transform.fromElement(this.document, this);
        if (transform) {
            transform.apply(ctx);
        }
        // clip
        const clipPathStyleProp = this.getStyle('clip-path', false, true);
        if (clipPathStyleProp.hasValue()) {
            const clip = clipPathStyleProp.getDefinition();
            if (clip) {
                clip.apply(ctx);
            }
        }
    }
    clearContext(_) {
    // NO RENDER
    }
    renderChildren(ctx) {
        this.children.forEach((child)=>{
            child.render(ctx);
        });
    }
    addChild(childNode) {
        const child = childNode instanceof Element ? childNode : this.document.createElement(childNode);
        child.parent = this;
        if (!Element.ignoreChildTypes.includes(child.type)) {
            this.children.push(child);
        }
    }
    matchesSelector(selector) {
        var ref;
        const { node  } = this;
        if (typeof node.matches === 'function') {
            return node.matches(selector);
        }
        const styleClasses = (ref = node.getAttribute) === null || ref === void 0 ? void 0 : ref.call(node, 'class');
        if (!styleClasses || styleClasses === '') {
            return false;
        }
        return styleClasses.split(' ').some((styleClass)=>".".concat(styleClass) === selector
        );
    }
    addStylesFromStyleDefinition() {
        const { styles , stylesSpecificity  } = this.document;
        let styleProp;
        for(const selector in styles){
            if (!selector.startsWith('@') && this.matchesSelector(selector)) {
                const style = styles[selector];
                const specificity = stylesSpecificity[selector];
                if (style) {
                    for(const name in style){
                        let existingSpecificity = this.stylesSpecificity[name];
                        if (typeof existingSpecificity === 'undefined') {
                            existingSpecificity = '000';
                        }
                        if (specificity && specificity >= existingSpecificity) {
                            styleProp = style[name];
                            if (styleProp) {
                                this.styles[name] = styleProp;
                            }
                            this.stylesSpecificity[name] = specificity;
                        }
                    }
                }
            }
        }
    }
    removeStyles(element, ignoreStyles) {
        const toRestore1 = ignoreStyles.reduce((toRestore, name)=>{
            const styleProp = element.getStyle(name);
            if (!styleProp.hasValue()) {
                return toRestore;
            }
            const value = styleProp.getString();
            styleProp.setValue('');
            return [
                ...toRestore,
                [
                    name,
                    value
                ]
            ];
        }, []);
        return toRestore1;
    }
    restoreStyles(element, styles) {
        styles.forEach((param)=>{
            let [name, value] = param;
            element.getStyle(name, true).setValue(value);
        });
    }
    isFirstChild() {
        var ref;
        return ((ref = this.parent) === null || ref === void 0 ? void 0 : ref.children.indexOf(this)) === 0;
    }
    constructor(document, node, captureTextNodes = false){
        this.document = document;
        this.node = node;
        this.captureTextNodes = captureTextNodes;
        this.type = '';
        this.attributes = {};
        this.styles = {};
        this.stylesSpecificity = {};
        this.animationFrozen = false;
        this.animationFrozenValue = '';
        this.parent = null;
        this.children = [];
        if (!node || node.nodeType !== 1) {
            return;
        }
        // add attributes
        Array.from(node.attributes).forEach((attribute)=>{
            const nodeName = normalizeAttributeName(attribute.nodeName);
            this.attributes[nodeName] = new Property(document, nodeName, attribute.value);
        });
        this.addStylesFromStyleDefinition();
        // add inline styles
        if (this.getAttribute('style').hasValue()) {
            const styles = this.getAttribute('style').getString().split(';').map((_)=>_.trim()
            );
            styles.forEach((style)=>{
                if (!style) {
                    return;
                }
                const [name, value] = style.split(':').map((_)=>_.trim()
                );
                if (name) {
                    this.styles[name] = new Property(document, name, value);
                }
            });
        }
        const { definitions  } = document;
        const id = this.getAttribute('id');
        // add id
        if (id.hasValue()) {
            if (!definitions[id.getString()]) {
                definitions[id.getString()] = this;
            }
        }
        Array.from(node.childNodes).forEach((childNode)=>{
            if (childNode.nodeType === 1) {
                this.addChild(childNode) // ELEMENT_NODE
                ;
            } else if (captureTextNodes && (childNode.nodeType === 3 || childNode.nodeType === 4)) {
                const textNode = document.createTextNode(childNode);
                if (textNode.getText().length > 0) {
                    this.addChild(textNode) // TEXT_NODE
                    ;
                }
            }
        });
    }
}
Element.ignoreChildTypes = [
    'title'
];

class UnknownElement extends Element {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
    }
}

function wrapFontFamily(fontFamily) {
    const trimmed = fontFamily.trim();
    return /^('|")/.test(trimmed) ? trimmed : "\"".concat(trimmed, "\"");
}
function prepareFontFamily(fontFamily) {
    return typeof process === 'undefined' ? fontFamily : fontFamily.trim().split(',').map(wrapFontFamily).join(',');
}
/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/font-style
 * @param fontStyle
 * @returns CSS font style.
 */ function prepareFontStyle(fontStyle) {
    if (!fontStyle) {
        return '';
    }
    const targetFontStyle = fontStyle.trim().toLowerCase();
    switch(targetFontStyle){
        case 'normal':
        case 'italic':
        case 'oblique':
        case 'inherit':
        case 'initial':
        case 'unset':
            return targetFontStyle;
        default:
            if (/^oblique\s+(-|)\d+deg$/.test(targetFontStyle)) {
                return targetFontStyle;
            }
            return '';
    }
}
/**
 * https://developer.mozilla.org/en-US/docs/Web/CSS/font-weight
 * @param fontWeight
 * @returns CSS font weight.
 */ function prepareFontWeight(fontWeight) {
    if (!fontWeight) {
        return '';
    }
    const targetFontWeight = fontWeight.trim().toLowerCase();
    switch(targetFontWeight){
        case 'normal':
        case 'bold':
        case 'lighter':
        case 'bolder':
        case 'inherit':
        case 'initial':
        case 'unset':
            return targetFontWeight;
        default:
            if (/^[\d.]+$/.test(targetFontWeight)) {
                return targetFontWeight;
            }
            return '';
    }
}
class Font {
    static parse() {
        let font = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : '', inherit = arguments.length > 1 ? arguments[1] : void 0;
        let fontStyle = '';
        let fontVariant = '';
        let fontWeight = '';
        let fontSize = '';
        let fontFamily = '';
        const parts = compressSpaces(font).trim().split(' ');
        const set = {
            fontSize: false,
            fontStyle: false,
            fontWeight: false,
            fontVariant: false
        };
        parts.forEach((part)=>{
            switch(true){
                case !set.fontStyle && Font.styles.includes(part):
                    if (part !== 'inherit') {
                        fontStyle = part;
                    }
                    set.fontStyle = true;
                    break;
                case !set.fontVariant && Font.variants.includes(part):
                    if (part !== 'inherit') {
                        fontVariant = part;
                    }
                    set.fontStyle = true;
                    set.fontVariant = true;
                    break;
                case !set.fontWeight && Font.weights.includes(part):
                    if (part !== 'inherit') {
                        fontWeight = part;
                    }
                    set.fontStyle = true;
                    set.fontVariant = true;
                    set.fontWeight = true;
                    break;
                case !set.fontSize:
                    if (part !== 'inherit') {
                        fontSize = part.split('/')[0] || '';
                    }
                    set.fontStyle = true;
                    set.fontVariant = true;
                    set.fontWeight = true;
                    set.fontSize = true;
                    break;
                default:
                    if (part !== 'inherit') {
                        fontFamily += part;
                    }
            }
        });
        return new Font(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit);
    }
    toString() {
        return [
            prepareFontStyle(this.fontStyle),
            this.fontVariant,
            prepareFontWeight(this.fontWeight),
            this.fontSize,
            // Wrap fontFamily only on nodejs and only for canvas.ctx
            prepareFontFamily(this.fontFamily)
        ].join(' ').trim();
    }
    constructor(fontStyle, fontVariant, fontWeight, fontSize, fontFamily, inherit){
        const inheritFont = inherit ? typeof inherit === 'string' ? Font.parse(inherit) : inherit : {};
        this.fontFamily = fontFamily || inheritFont.fontFamily;
        this.fontSize = fontSize || inheritFont.fontSize;
        this.fontStyle = fontStyle || inheritFont.fontStyle;
        this.fontWeight = fontWeight || inheritFont.fontWeight;
        this.fontVariant = fontVariant || inheritFont.fontVariant;
    }
}
Font.styles = 'normal|italic|oblique|inherit';
Font.variants = 'normal|small-caps|inherit';
Font.weights = 'normal|bold|bolder|lighter|100|200|300|400|500|600|700|800|900|inherit';

class BoundingBox {
    get x() {
        return this.x1;
    }
    get y() {
        return this.y1;
    }
    get width() {
        return this.x2 - this.x1;
    }
    get height() {
        return this.y2 - this.y1;
    }
    addPoint(x, y) {
        if (typeof x !== 'undefined') {
            if (isNaN(this.x1) || isNaN(this.x2)) {
                this.x1 = x;
                this.x2 = x;
            }
            if (x < this.x1) {
                this.x1 = x;
            }
            if (x > this.x2) {
                this.x2 = x;
            }
        }
        if (typeof y !== 'undefined') {
            if (isNaN(this.y1) || isNaN(this.y2)) {
                this.y1 = y;
                this.y2 = y;
            }
            if (y < this.y1) {
                this.y1 = y;
            }
            if (y > this.y2) {
                this.y2 = y;
            }
        }
    }
    addX(x) {
        this.addPoint(x, 0);
    }
    addY(y) {
        this.addPoint(0, y);
    }
    addBoundingBox(boundingBox) {
        if (!boundingBox) {
            return;
        }
        const { x1 , y1 , x2 , y2  } = boundingBox;
        this.addPoint(x1, y1);
        this.addPoint(x2, y2);
    }
    sumCubic(t, p0, p1, p2, p3) {
        return Math.pow(1 - t, 3) * p0 + 3 * Math.pow(1 - t, 2) * t * p1 + 3 * (1 - t) * Math.pow(t, 2) * p2 + Math.pow(t, 3) * p3;
    }
    bezierCurveAdd(forX, p0, p1, p2, p3) {
        const b = 6 * p0 - 12 * p1 + 6 * p2;
        const a = -3 * p0 + 9 * p1 - 9 * p2 + 3 * p3;
        const c = 3 * p1 - 3 * p0;
        if (a === 0) {
            if (b === 0) {
                return;
            }
            const t = -c / b;
            if (0 < t && t < 1) {
                if (forX) {
                    this.addX(this.sumCubic(t, p0, p1, p2, p3));
                } else {
                    this.addY(this.sumCubic(t, p0, p1, p2, p3));
                }
            }
            return;
        }
        const b2ac = Math.pow(b, 2) - 4 * c * a;
        if (b2ac < 0) {
            return;
        }
        const t1 = (-b + Math.sqrt(b2ac)) / (2 * a);
        if (0 < t1 && t1 < 1) {
            if (forX) {
                this.addX(this.sumCubic(t1, p0, p1, p2, p3));
            } else {
                this.addY(this.sumCubic(t1, p0, p1, p2, p3));
            }
        }
        const t2 = (-b - Math.sqrt(b2ac)) / (2 * a);
        if (0 < t2 && t2 < 1) {
            if (forX) {
                this.addX(this.sumCubic(t2, p0, p1, p2, p3));
            } else {
                this.addY(this.sumCubic(t2, p0, p1, p2, p3));
            }
        }
    }
    // from http://blog.hackers-cafe.net/2009/06/how-to-calculate-bezier-curves-bounding.html
    addBezierCurve(p0x, p0y, p1x, p1y, p2x, p2y, p3x, p3y) {
        this.addPoint(p0x, p0y);
        this.addPoint(p3x, p3y);
        this.bezierCurveAdd(true, p0x, p1x, p2x, p3x);
        this.bezierCurveAdd(false, p0y, p1y, p2y, p3y);
    }
    addQuadraticCurve(p0x, p0y, p1x, p1y, p2x, p2y) {
        const cp1x = p0x + 2 / 3 * (p1x - p0x) // CP1 = QP0 + 2/3 *(QP1-QP0)
        ;
        const cp1y = p0y + 2 / 3 * (p1y - p0y) // CP1 = QP0 + 2/3 *(QP1-QP0)
        ;
        const cp2x = cp1x + 1 / 3 * (p2x - p0x) // CP2 = CP1 + 1/3 *(QP2-QP0)
        ;
        const cp2y = cp1y + 1 / 3 * (p2y - p0y) // CP2 = CP1 + 1/3 *(QP2-QP0)
        ;
        this.addBezierCurve(p0x, p0y, cp1x, cp2x, cp1y, cp2y, p2x, p2y);
    }
    isPointInBox(x, y) {
        const { x1 , y1 , x2 , y2  } = this;
        return x1 <= x && x <= x2 && y1 <= y && y <= y2;
    }
    constructor(x1 = Number.NaN, y1 = Number.NaN, x2 = Number.NaN, y2 = Number.NaN){
        this.x1 = x1;
        this.y1 = y1;
        this.x2 = x2;
        this.y2 = y2;
        this.addPoint(x1, y1);
        this.addPoint(x2, y2);
    }
}

class RenderedElement extends Element {
    calculateOpacity() {
        let opacity = 1;
        // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
        let element = this;
        while(element){
            const opacityStyle = element.getStyle('opacity', false, true) // no ancestors on style call
            ;
            if (opacityStyle.hasValue(true)) {
                opacity *= opacityStyle.getNumber();
            }
            element = element.parent;
        }
        return opacity;
    }
    setContext(ctx) {
        let fromMeasure = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        if (!fromMeasure) {
            // fill
            const fillStyleProp = this.getStyle('fill');
            const fillOpacityStyleProp = this.getStyle('fill-opacity');
            const strokeStyleProp = this.getStyle('stroke');
            const strokeOpacityProp = this.getStyle('stroke-opacity');
            if (fillStyleProp.isUrlDefinition()) {
                const fillStyle = fillStyleProp.getFillStyleDefinition(this, fillOpacityStyleProp);
                if (fillStyle) {
                    ctx.fillStyle = fillStyle;
                }
            } else if (fillStyleProp.hasValue()) {
                if (fillStyleProp.getString() === 'currentColor') {
                    fillStyleProp.setValue(this.getStyle('color').getColor());
                }
                const fillStyle = fillStyleProp.getColor();
                if (fillStyle !== 'inherit') {
                    ctx.fillStyle = fillStyle === 'none' ? 'rgba(0,0,0,0)' : fillStyle;
                }
            }
            if (fillOpacityStyleProp.hasValue()) {
                const fillStyle = new Property(this.document, 'fill', ctx.fillStyle).addOpacity(fillOpacityStyleProp).getColor();
                ctx.fillStyle = fillStyle;
            }
            // stroke
            if (strokeStyleProp.isUrlDefinition()) {
                const strokeStyle = strokeStyleProp.getFillStyleDefinition(this, strokeOpacityProp);
                if (strokeStyle) {
                    ctx.strokeStyle = strokeStyle;
                }
            } else if (strokeStyleProp.hasValue()) {
                if (strokeStyleProp.getString() === 'currentColor') {
                    strokeStyleProp.setValue(this.getStyle('color').getColor());
                }
                const strokeStyle = strokeStyleProp.getString();
                if (strokeStyle !== 'inherit') {
                    ctx.strokeStyle = strokeStyle === 'none' ? 'rgba(0,0,0,0)' : strokeStyle;
                }
            }
            if (strokeOpacityProp.hasValue()) {
                const strokeStyle = new Property(this.document, 'stroke', ctx.strokeStyle).addOpacity(strokeOpacityProp).getString();
                ctx.strokeStyle = strokeStyle;
            }
            const strokeWidthStyleProp = this.getStyle('stroke-width');
            if (strokeWidthStyleProp.hasValue()) {
                const newLineWidth = strokeWidthStyleProp.getPixels();
                ctx.lineWidth = !newLineWidth ? PSEUDO_ZERO // browsers don't respect 0 (or node-canvas? :-)
                 : newLineWidth;
            }
            const strokeLinecapStyleProp = this.getStyle('stroke-linecap');
            const strokeLinejoinStyleProp = this.getStyle('stroke-linejoin');
            const strokeMiterlimitProp = this.getStyle('stroke-miterlimit');
            // NEED TEST
            // const pointOrderStyleProp = this.getStyle('paint-order');
            const strokeDasharrayStyleProp = this.getStyle('stroke-dasharray');
            const strokeDashoffsetProp = this.getStyle('stroke-dashoffset');
            if (strokeLinecapStyleProp.hasValue()) {
                ctx.lineCap = strokeLinecapStyleProp.getString();
            }
            if (strokeLinejoinStyleProp.hasValue()) {
                ctx.lineJoin = strokeLinejoinStyleProp.getString();
            }
            if (strokeMiterlimitProp.hasValue()) {
                ctx.miterLimit = strokeMiterlimitProp.getNumber();
            }
            // NEED TEST
            // if (pointOrderStyleProp.hasValue()) {
            //   // ?
            //   ctx.paintOrder = pointOrderStyleProp.getValue();
            // }
            if (strokeDasharrayStyleProp.hasValue() && strokeDasharrayStyleProp.getString() !== 'none') {
                const gaps = toNumbers(strokeDasharrayStyleProp.getString());
                if (typeof ctx.setLineDash !== 'undefined') {
                    ctx.setLineDash(gaps);
                } else // @ts-expect-error Handle browser prefix.
                if (typeof ctx.webkitLineDash !== 'undefined') {
                    // @ts-expect-error Handle browser prefix.
                    ctx.webkitLineDash = gaps;
                } else // @ts-expect-error Handle browser prefix.
                if (typeof ctx.mozDash !== 'undefined' && !(gaps.length === 1 && gaps[0] === 0)) {
                    // @ts-expect-error Handle browser prefix.
                    ctx.mozDash = gaps;
                }
                const offset = strokeDashoffsetProp.getPixels();
                if (typeof ctx.lineDashOffset !== 'undefined') {
                    ctx.lineDashOffset = offset;
                } else // @ts-expect-error Handle browser prefix.
                if (typeof ctx.webkitLineDashOffset !== 'undefined') {
                    // @ts-expect-error Handle browser prefix.
                    ctx.webkitLineDashOffset = offset;
                } else // @ts-expect-error Handle browser prefix.
                if (typeof ctx.mozDashOffset !== 'undefined') {
                    // @ts-expect-error Handle browser prefix.
                    ctx.mozDashOffset = offset;
                }
            }
        }
        // font
        this.modifiedEmSizeStack = false;
        if (typeof ctx.font !== 'undefined') {
            const fontStyleProp = this.getStyle('font');
            const fontStyleStyleProp = this.getStyle('font-style');
            const fontVariantStyleProp = this.getStyle('font-variant');
            const fontWeightStyleProp = this.getStyle('font-weight');
            const fontSizeStyleProp = this.getStyle('font-size');
            const fontFamilyStyleProp = this.getStyle('font-family');
            const font = new Font(fontStyleStyleProp.getString(), fontVariantStyleProp.getString(), fontWeightStyleProp.getString(), fontSizeStyleProp.hasValue() ? "".concat(fontSizeStyleProp.getPixels(true), "px") : '', fontFamilyStyleProp.getString(), Font.parse(fontStyleProp.getString(), ctx.font));
            fontStyleStyleProp.setValue(font.fontStyle);
            fontVariantStyleProp.setValue(font.fontVariant);
            fontWeightStyleProp.setValue(font.fontWeight);
            fontSizeStyleProp.setValue(font.fontSize);
            fontFamilyStyleProp.setValue(font.fontFamily);
            ctx.font = font.toString();
            if (fontSizeStyleProp.isPixels()) {
                this.document.emSize = fontSizeStyleProp.getPixels();
                this.modifiedEmSizeStack = true;
            }
        }
        if (!fromMeasure) {
            // effects
            this.applyEffects(ctx);
            // opacity
            ctx.globalAlpha = this.calculateOpacity();
        }
    }
    clearContext(ctx) {
        super.clearContext(ctx);
        if (this.modifiedEmSizeStack) {
            this.document.popEmSize();
        }
    }
    constructor(...args){
        super(...args);
        this.modifiedEmSizeStack = false;
    }
}

class TextElement extends RenderedElement {
    setContext(ctx) {
        let fromMeasure = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
        super.setContext(ctx, fromMeasure);
        const textBaseline = this.getStyle('dominant-baseline').getTextBaseline() || this.getStyle('alignment-baseline').getTextBaseline();
        if (textBaseline) {
            ctx.textBaseline = textBaseline;
        }
    }
    initializeCoordinates() {
        this.x = 0;
        this.y = 0;
        this.leafTexts = [];
        this.textChunkStart = 0;
        this.minX = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
    }
    getBoundingBox(ctx) {
        if (this.type !== 'text') {
            return this.getTElementBoundingBox(ctx);
        }
        // first, calculate child positions
        this.initializeCoordinates();
        this.adjustChildCoordinatesRecursive(ctx);
        let boundingBox = null;
        // then calculate bounding box
        this.children.forEach((_, i)=>{
            const childBoundingBox = this.getChildBoundingBox(ctx, this, this, i);
            if (!boundingBox) {
                boundingBox = childBoundingBox;
            } else {
                boundingBox.addBoundingBox(childBoundingBox);
            }
        });
        return boundingBox;
    }
    getFontSize() {
        const { document , parent  } = this;
        const inheritFontSize = Font.parse(document.ctx.font).fontSize;
        const fontSize = parent.getStyle('font-size').getNumber(inheritFontSize);
        return fontSize;
    }
    getTElementBoundingBox(ctx) {
        const fontSize = this.getFontSize();
        return new BoundingBox(this.x, this.y - fontSize, this.x + this.measureText(ctx), this.y);
    }
    getGlyph(font, text, i) {
        const char = text[i];
        let glyph;
        if (font.isArabic) {
            var ref;
            const len = text.length;
            const prevChar = text[i - 1];
            const nextChar = text[i + 1];
            let arabicForm = 'isolated';
            if ((i === 0 || prevChar === ' ') && i < len - 1 && nextChar !== ' ') {
                arabicForm = 'terminal';
            }
            if (i > 0 && prevChar !== ' ' && i < len - 1 && nextChar !== ' ') {
                arabicForm = 'medial';
            }
            if (i > 0 && prevChar !== ' ' && (i === len - 1 || nextChar === ' ')) {
                arabicForm = 'initial';
            }
            glyph = ((ref = font.arabicGlyphs[char]) === null || ref === void 0 ? void 0 : ref[arabicForm]) || font.glyphs[char];
        } else {
            glyph = font.glyphs[char];
        }
        if (!glyph) {
            glyph = font.missingGlyph;
        }
        return glyph;
    }
    getText() {
        return '';
    }
    getTextFromNode(node) {
        const textNode = node || this.node;
        const childNodes = Array.from(textNode.parentNode.childNodes);
        const index = childNodes.indexOf(textNode);
        const lastIndex = childNodes.length - 1;
        let text = compressSpaces(// textNode.value
        // || textNode.text
        textNode.textContent || '');
        if (index === 0) {
            text = trimLeft(text);
        }
        if (index === lastIndex) {
            text = trimRight(text);
        }
        return text;
    }
    renderChildren(ctx) {
        if (this.type !== 'text') {
            this.renderTElementChildren(ctx);
            return;
        }
        // first, calculate child positions
        this.initializeCoordinates();
        this.adjustChildCoordinatesRecursive(ctx);
        // then render
        this.children.forEach((_, i)=>{
            this.renderChild(ctx, this, this, i);
        });
        const { mouse  } = this.document.screen;
        // Do not calc bounding box if mouse is not working.
        if (mouse.isWorking()) {
            mouse.checkBoundingBox(this, this.getBoundingBox(ctx));
        }
    }
    renderTElementChildren(ctx) {
        const { document , parent  } = this;
        const renderText = this.getText();
        const customFont = parent.getStyle('font-family').getDefinition();
        if (customFont) {
            const { unitsPerEm  } = customFont.fontFace;
            const ctxFont = Font.parse(document.ctx.font);
            const fontSize = parent.getStyle('font-size').getNumber(ctxFont.fontSize);
            const fontStyle = parent.getStyle('font-style').getString(ctxFont.fontStyle);
            const scale = fontSize / unitsPerEm;
            const text = customFont.isRTL ? renderText.split('').reverse().join('') : renderText;
            const dx = toNumbers(parent.getAttribute('dx').getString());
            const len = text.length;
            for(let i = 0; i < len; i++){
                const glyph = this.getGlyph(customFont, text, i);
                ctx.translate(this.x, this.y);
                ctx.scale(scale, -scale);
                const lw = ctx.lineWidth;
                ctx.lineWidth = ctx.lineWidth * unitsPerEm / fontSize;
                if (fontStyle === 'italic') {
                    ctx.transform(1, 0, 0.4, 1, 0, 0);
                }
                glyph.render(ctx);
                if (fontStyle === 'italic') {
                    ctx.transform(1, 0, -0.4, 1, 0, 0);
                }
                ctx.lineWidth = lw;
                ctx.scale(1 / scale, -1 / scale);
                ctx.translate(-this.x, -this.y);
                this.x += fontSize * (glyph.horizAdvX || customFont.horizAdvX) / unitsPerEm;
                if (typeof dx[i] !== 'undefined' && !isNaN(dx[i])) {
                    this.x += dx[i];
                }
            }
            return;
        }
        const { x , y  } = this;
        // NEED TEST
        // if (ctx.paintOrder === 'stroke') {
        //   if (ctx.strokeStyle) {
        //     ctx.strokeText(renderText, x, y);
        //   }
        //   if (ctx.fillStyle) {
        //     ctx.fillText(renderText, x, y);
        //   }
        // } else {
        if (ctx.fillStyle) {
            ctx.fillText(renderText, x, y);
        }
        if (ctx.strokeStyle) {
            ctx.strokeText(renderText, x, y);
        }
    // }
    }
    applyAnchoring() {
        if (this.textChunkStart >= this.leafTexts.length) {
            return;
        }
        // This is basically the "Apply anchoring" part of https://www.w3.org/TR/SVG2/text.html#TextLayoutAlgorithm.
        // The difference is that we apply the anchoring as soon as a chunk is finished. This saves some extra looping.
        // Vertical text is not supported.
        const firstElement = this.leafTexts[this.textChunkStart];
        const textAnchor = firstElement.getStyle('text-anchor').getString('start');
        const isRTL = false // we treat RTL like LTR
        ;
        let shift = 0;
        if (textAnchor === 'start' && !isRTL || textAnchor === 'end' && isRTL) {
            shift = firstElement.x - this.minX;
        } else if (textAnchor === 'end' && !isRTL || textAnchor === 'start' && isRTL) {
            shift = firstElement.x - this.maxX;
        } else {
            shift = firstElement.x - (this.minX + this.maxX) / 2;
        }
        for(let i = this.textChunkStart; i < this.leafTexts.length; i++){
            this.leafTexts[i].x += shift;
        }
        // start new chunk
        this.minX = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
        this.textChunkStart = this.leafTexts.length;
    }
    adjustChildCoordinatesRecursive(ctx) {
        this.children.forEach((_, i)=>{
            this.adjustChildCoordinatesRecursiveCore(ctx, this, this, i);
        });
        this.applyAnchoring();
    }
    adjustChildCoordinatesRecursiveCore(ctx, textParent, parent, i1) {
        const child = parent.children[i1];
        if (child.children.length > 0) {
            child.children.forEach((_, i)=>{
                textParent.adjustChildCoordinatesRecursiveCore(ctx, textParent, child, i);
            });
        } else {
            // only leafs are relevant
            this.adjustChildCoordinates(ctx, textParent, parent, i1);
        }
    }
    adjustChildCoordinates(ctx, textParent, parent, i) {
        const child = parent.children[i];
        if (typeof child.measureText !== 'function') {
            return child;
        }
        ctx.save();
        child.setContext(ctx, true);
        const xAttr = child.getAttribute('x');
        const yAttr = child.getAttribute('y');
        const dxAttr = child.getAttribute('dx');
        const dyAttr = child.getAttribute('dy');
        const customFont = child.getStyle('font-family').getDefinition();
        const isRTL = Boolean(customFont === null || customFont === void 0 ? void 0 : customFont.isRTL);
        if (i === 0) {
            // First children inherit attributes from parent(s). Positional attributes
            // are only inherited from a parent to it's first child.
            if (!xAttr.hasValue()) {
                xAttr.setValue(child.getInheritedAttribute('x'));
            }
            if (!yAttr.hasValue()) {
                yAttr.setValue(child.getInheritedAttribute('y'));
            }
            if (!dxAttr.hasValue()) {
                dxAttr.setValue(child.getInheritedAttribute('dx'));
            }
            if (!dyAttr.hasValue()) {
                dyAttr.setValue(child.getInheritedAttribute('dy'));
            }
        }
        const width = child.measureText(ctx);
        if (isRTL) {
            textParent.x -= width;
        }
        if (xAttr.hasValue()) {
            // an "x" attribute marks the start of a new chunk
            textParent.applyAnchoring();
            child.x = xAttr.getPixels('x');
            if (dxAttr.hasValue()) {
                child.x += dxAttr.getPixels('x');
            }
        } else {
            if (dxAttr.hasValue()) {
                textParent.x += dxAttr.getPixels('x');
            }
            child.x = textParent.x;
        }
        textParent.x = child.x;
        if (!isRTL) {
            textParent.x += width;
        }
        if (yAttr.hasValue()) {
            child.y = yAttr.getPixels('y');
            if (dyAttr.hasValue()) {
                child.y += dyAttr.getPixels('y');
            }
        } else {
            if (dyAttr.hasValue()) {
                textParent.y += dyAttr.getPixels('y');
            }
            child.y = textParent.y;
        }
        textParent.y = child.y;
        // update the current chunk and it's bounds
        textParent.leafTexts.push(child);
        textParent.minX = Math.min(textParent.minX, child.x, child.x + width);
        textParent.maxX = Math.max(textParent.maxX, child.x, child.x + width);
        child.clearContext(ctx);
        ctx.restore();
        return child;
    }
    getChildBoundingBox(ctx, textParent, parent, i2) {
        const child = parent.children[i2];
        // not a text node?
        if (typeof child.getBoundingBox !== 'function') {
            return null;
        }
        const boundingBox = child.getBoundingBox(ctx);
        if (boundingBox) {
            child.children.forEach((_, i)=>{
                const childBoundingBox = textParent.getChildBoundingBox(ctx, textParent, child, i);
                boundingBox.addBoundingBox(childBoundingBox);
            });
        }
        return boundingBox;
    }
    renderChild(ctx, textParent, parent, i3) {
        const child = parent.children[i3];
        child.render(ctx);
        child.children.forEach((_, i)=>{
            textParent.renderChild(ctx, textParent, child, i);
        });
    }
    measureText(ctx) {
        const { measureCache  } = this;
        if (~measureCache) {
            return measureCache;
        }
        const renderText = this.getText();
        const measure = this.measureTargetText(ctx, renderText);
        this.measureCache = measure;
        return measure;
    }
    measureTargetText(ctx, targetText) {
        if (!targetText.length) {
            return 0;
        }
        const { parent  } = this;
        const customFont = parent.getStyle('font-family').getDefinition();
        if (customFont) {
            const fontSize = this.getFontSize();
            const text = customFont.isRTL ? targetText.split('').reverse().join('') : targetText;
            const dx = toNumbers(parent.getAttribute('dx').getString());
            const len = text.length;
            let measure = 0;
            for(let i = 0; i < len; i++){
                const glyph = this.getGlyph(customFont, text, i);
                measure += (glyph.horizAdvX || customFont.horizAdvX) * fontSize / customFont.fontFace.unitsPerEm;
                if (typeof dx[i] !== 'undefined' && !isNaN(dx[i])) {
                    measure += dx[i];
                }
            }
            return measure;
        }
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!ctx.measureText) {
            return targetText.length * 10;
        }
        ctx.save();
        this.setContext(ctx, true);
        const { width: measure  } = ctx.measureText(targetText);
        this.clearContext(ctx);
        ctx.restore();
        return measure;
    }
    /**
   * Inherits positional attributes from {@link TextElement} parent(s). Attributes
   * are only inherited from a parent to its first child.
   * @param name - The attribute name.
   * @returns The attribute value or null.
   */ getInheritedAttribute(name) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias,consistent-this
        let current = this;
        while(current instanceof TextElement && current.isFirstChild() && current.parent){
            const parentAttr = current.parent.getAttribute(name);
            if (parentAttr.hasValue(true)) {
                return parentAttr.getString('0');
            }
            current = current.parent;
        }
        return null;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, new.target === TextElement ? true : captureTextNodes);
        this.type = 'text';
        this.x = 0;
        this.y = 0;
        this.leafTexts = [];
        this.textChunkStart = 0;
        this.minX = Number.POSITIVE_INFINITY;
        this.maxX = Number.NEGATIVE_INFINITY;
        this.measureCache = -1;
    }
}

class TSpanElement extends TextElement {
    getText() {
        return this.text;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, new.target === TSpanElement ? true : captureTextNodes);
        this.type = 'tspan';
        // if this node has children, then they own the text
        this.text = this.children.length > 0 ? '' : this.getTextFromNode();
    }
}

class TextNode extends TSpanElement {
    constructor(...args){
        super(...args);
        this.type = 'textNode';
    }
}

class PathParser extends svgPathdata.SVGPathData {
    reset() {
        this.i = -1;
        this.command = null;
        this.previousCommand = null;
        this.start = new Point(0, 0);
        this.control = new Point(0, 0);
        this.current = new Point(0, 0);
        this.points = [];
        this.angles = [];
    }
    isEnd() {
        const { i , commands  } = this;
        return i >= commands.length - 1;
    }
    next() {
        const command = this.commands[++this.i];
        this.previousCommand = this.command;
        this.command = command;
        return command;
    }
    getPoint() {
        let xProp = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 'x', yProp = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 'y';
        const point = new Point(this.command[xProp], this.command[yProp]);
        return this.makeAbsolute(point);
    }
    getAsControlPoint(xProp, yProp) {
        const point = this.getPoint(xProp, yProp);
        this.control = point;
        return point;
    }
    getAsCurrentPoint(xProp, yProp) {
        const point = this.getPoint(xProp, yProp);
        this.current = point;
        return point;
    }
    getReflectedControlPoint() {
        const previousCommand = this.previousCommand.type;
        if (previousCommand !== svgPathdata.SVGPathData.CURVE_TO && previousCommand !== svgPathdata.SVGPathData.SMOOTH_CURVE_TO && previousCommand !== svgPathdata.SVGPathData.QUAD_TO && previousCommand !== svgPathdata.SVGPathData.SMOOTH_QUAD_TO) {
            return this.current;
        }
        // reflect point
        const { current: { x: cx , y: cy  } , control: { x: ox , y: oy  }  } = this;
        const point = new Point(2 * cx - ox, 2 * cy - oy);
        return point;
    }
    makeAbsolute(point) {
        if (this.command.relative) {
            const { x , y  } = this.current;
            point.x += x;
            point.y += y;
        }
        return point;
    }
    addMarker(point, from, priorTo) {
        const { points , angles  } = this;
        // if the last angle isn't filled in because we didn't have this point yet ...
        if (priorTo && angles.length > 0 && !angles[angles.length - 1]) {
            angles[angles.length - 1] = points[points.length - 1].angleTo(priorTo);
        }
        this.addMarkerAngle(point, from ? from.angleTo(point) : null);
    }
    addMarkerAngle(point, angle) {
        this.points.push(point);
        this.angles.push(angle);
    }
    getMarkerPoints() {
        return this.points;
    }
    getMarkerAngles() {
        const { angles  } = this;
        const len = angles.length;
        for(let i = 0; i < len; i++){
            if (!angles[i]) {
                for(let j = i + 1; j < len; j++){
                    if (angles[j]) {
                        angles[i] = angles[j];
                        break;
                    }
                }
            }
        }
        return angles;
    }
    constructor(path){
        super(path// Fix spaces after signs.
        .replace(/([+\-.])\s+/gm, '$1')// Remove invalid part.
        .replace(/[^MmZzLlHhVvCcSsQqTtAae\d\s.,+-].*/g, ''));
        this.control = new Point(0, 0);
        this.start = new Point(0, 0);
        this.current = new Point(0, 0);
        this.command = null;
        this.commands = this.commands;
        this.i = -1;
        this.previousCommand = null;
        this.points = [];
        this.angles = [];
    }
}

class PathElement extends RenderedElement {
    path(ctx) {
        const { pathParser  } = this;
        const boundingBox = new BoundingBox();
        pathParser.reset();
        if (ctx) {
            ctx.beginPath();
        }
        while(!pathParser.isEnd()){
            switch(pathParser.next().type){
                case PathParser.MOVE_TO:
                    this.pathM(ctx, boundingBox);
                    break;
                case PathParser.LINE_TO:
                    this.pathL(ctx, boundingBox);
                    break;
                case PathParser.HORIZ_LINE_TO:
                    this.pathH(ctx, boundingBox);
                    break;
                case PathParser.VERT_LINE_TO:
                    this.pathV(ctx, boundingBox);
                    break;
                case PathParser.CURVE_TO:
                    this.pathC(ctx, boundingBox);
                    break;
                case PathParser.SMOOTH_CURVE_TO:
                    this.pathS(ctx, boundingBox);
                    break;
                case PathParser.QUAD_TO:
                    this.pathQ(ctx, boundingBox);
                    break;
                case PathParser.SMOOTH_QUAD_TO:
                    this.pathT(ctx, boundingBox);
                    break;
                case PathParser.ARC:
                    this.pathA(ctx, boundingBox);
                    break;
                case PathParser.CLOSE_PATH:
                    this.pathZ(ctx, boundingBox);
                    break;
            }
        }
        return boundingBox;
    }
    getBoundingBox(_ctx) {
        return this.path();
    }
    getMarkers() {
        const { pathParser  } = this;
        const points = pathParser.getMarkerPoints();
        const angles = pathParser.getMarkerAngles();
        const markers = points.map((point, i)=>[
                point,
                angles[i]
            ]
        );
        return markers;
    }
    renderChildren(ctx) {
        this.path(ctx);
        this.document.screen.mouse.checkPath(this, ctx);
        const fillRuleStyleProp = this.getStyle('fill-rule');
        if (ctx.fillStyle !== '') {
            if (fillRuleStyleProp.getString('inherit') !== 'inherit') {
                ctx.fill(fillRuleStyleProp.getString());
            } else {
                ctx.fill();
            }
        }
        if (ctx.strokeStyle !== '') {
            if (this.getAttribute('vector-effect').getString() === 'non-scaling-stroke') {
                ctx.save();
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.stroke();
                ctx.restore();
            } else {
                ctx.stroke();
            }
        }
        const markers = this.getMarkers();
        if (markers) {
            const markersLastIndex = markers.length - 1;
            const markerStartStyleProp = this.getStyle('marker-start');
            const markerMidStyleProp = this.getStyle('marker-mid');
            const markerEndStyleProp = this.getStyle('marker-end');
            if (markerStartStyleProp.isUrlDefinition()) {
                const marker = markerStartStyleProp.getDefinition();
                const [point, angle] = markers[0];
                marker.render(ctx, point, angle);
            }
            if (markerMidStyleProp.isUrlDefinition()) {
                const marker = markerMidStyleProp.getDefinition();
                for(let i = 1; i < markersLastIndex; i++){
                    const [point, angle] = markers[i];
                    marker.render(ctx, point, angle);
                }
            }
            if (markerEndStyleProp.isUrlDefinition()) {
                const marker = markerEndStyleProp.getDefinition();
                const [point, angle] = markers[markersLastIndex];
                marker.render(ctx, point, angle);
            }
        }
    }
    static pathM(pathParser) {
        const point = pathParser.getAsCurrentPoint();
        pathParser.start = pathParser.current;
        return {
            point
        };
    }
    pathM(ctx, boundingBox) {
        const { pathParser  } = this;
        const { point  } = PathElement.pathM(pathParser);
        const { x , y  } = point;
        pathParser.addMarker(point);
        boundingBox.addPoint(x, y);
        if (ctx) {
            ctx.moveTo(x, y);
        }
    }
    static pathL(pathParser) {
        const { current  } = pathParser;
        const point = pathParser.getAsCurrentPoint();
        return {
            current,
            point
        };
    }
    pathL(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point  } = PathElement.pathL(pathParser);
        const { x , y  } = point;
        pathParser.addMarker(point, current);
        boundingBox.addPoint(x, y);
        if (ctx) {
            ctx.lineTo(x, y);
        }
    }
    static pathH(pathParser) {
        const { current , command  } = pathParser;
        const point = new Point((command.relative ? current.x : 0) + command.x, current.y);
        pathParser.current = point;
        return {
            current,
            point
        };
    }
    pathH(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point  } = PathElement.pathH(pathParser);
        const { x , y  } = point;
        pathParser.addMarker(point, current);
        boundingBox.addPoint(x, y);
        if (ctx) {
            ctx.lineTo(x, y);
        }
    }
    static pathV(pathParser) {
        const { current , command  } = pathParser;
        const point = new Point(current.x, (command.relative ? current.y : 0) + command.y);
        pathParser.current = point;
        return {
            current,
            point
        };
    }
    pathV(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point  } = PathElement.pathV(pathParser);
        const { x , y  } = point;
        pathParser.addMarker(point, current);
        boundingBox.addPoint(x, y);
        if (ctx) {
            ctx.lineTo(x, y);
        }
    }
    static pathC(pathParser) {
        const { current  } = pathParser;
        const point = pathParser.getPoint('x1', 'y1');
        const controlPoint = pathParser.getAsControlPoint('x2', 'y2');
        const currentPoint = pathParser.getAsCurrentPoint();
        return {
            current,
            point,
            controlPoint,
            currentPoint
        };
    }
    pathC(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point , controlPoint , currentPoint  } = PathElement.pathC(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, point);
        boundingBox.addBezierCurve(current.x, current.y, point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if (ctx) {
            ctx.bezierCurveTo(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }
    static pathS(pathParser) {
        const { current  } = pathParser;
        const point = pathParser.getReflectedControlPoint();
        const controlPoint = pathParser.getAsControlPoint('x2', 'y2');
        const currentPoint = pathParser.getAsCurrentPoint();
        return {
            current,
            point,
            controlPoint,
            currentPoint
        };
    }
    pathS(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , point , controlPoint , currentPoint  } = PathElement.pathS(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, point);
        boundingBox.addBezierCurve(current.x, current.y, point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if (ctx) {
            ctx.bezierCurveTo(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }
    static pathQ(pathParser) {
        const { current  } = pathParser;
        const controlPoint = pathParser.getAsControlPoint('x1', 'y1');
        const currentPoint = pathParser.getAsCurrentPoint();
        return {
            current,
            controlPoint,
            currentPoint
        };
    }
    pathQ(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , controlPoint , currentPoint  } = PathElement.pathQ(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, controlPoint);
        boundingBox.addQuadraticCurve(current.x, current.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if (ctx) {
            ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }
    static pathT(pathParser) {
        const { current  } = pathParser;
        const controlPoint = pathParser.getReflectedControlPoint();
        pathParser.control = controlPoint;
        const currentPoint = pathParser.getAsCurrentPoint();
        return {
            current,
            controlPoint,
            currentPoint
        };
    }
    pathT(ctx, boundingBox) {
        const { pathParser  } = this;
        const { current , controlPoint , currentPoint  } = PathElement.pathT(pathParser);
        pathParser.addMarker(currentPoint, controlPoint, controlPoint);
        boundingBox.addQuadraticCurve(current.x, current.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        if (ctx) {
            ctx.quadraticCurveTo(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        }
    }
    static pathA(pathParser) {
        const { current , command  } = pathParser;
        let { rX , rY , xRot , lArcFlag , sweepFlag  } = command;
        const xAxisRotation = xRot * (Math.PI / 180);
        const currentPoint = pathParser.getAsCurrentPoint();
        // Conversion from endpoint to center parameterization
        // http://www.w3.org/TR/SVG11/implnote.html#ArcImplementationNotes
        // x1', y1'
        const currp = new Point(Math.cos(xAxisRotation) * (current.x - currentPoint.x) / 2 + Math.sin(xAxisRotation) * (current.y - currentPoint.y) / 2, -Math.sin(xAxisRotation) * (current.x - currentPoint.x) / 2 + Math.cos(xAxisRotation) * (current.y - currentPoint.y) / 2);
        // adjust radii
        const l = Math.pow(currp.x, 2) / Math.pow(rX, 2) + Math.pow(currp.y, 2) / Math.pow(rY, 2);
        if (l > 1) {
            rX *= Math.sqrt(l);
            rY *= Math.sqrt(l);
        }
        // cx', cy'
        let s = (lArcFlag === sweepFlag ? -1 : 1) * Math.sqrt((Math.pow(rX, 2) * Math.pow(rY, 2) - Math.pow(rX, 2) * Math.pow(currp.y, 2) - Math.pow(rY, 2) * Math.pow(currp.x, 2)) / (Math.pow(rX, 2) * Math.pow(currp.y, 2) + Math.pow(rY, 2) * Math.pow(currp.x, 2)));
        if (isNaN(s)) {
            s = 0;
        }
        const cpp = new Point(s * rX * currp.y / rY, s * -rY * currp.x / rX);
        // cx, cy
        const centp = new Point((current.x + currentPoint.x) / 2 + Math.cos(xAxisRotation) * cpp.x - Math.sin(xAxisRotation) * cpp.y, (current.y + currentPoint.y) / 2 + Math.sin(xAxisRotation) * cpp.x + Math.cos(xAxisRotation) * cpp.y);
        // initial angle
        const a1 = vectorsAngle([
            1,
            0
        ], [
            (currp.x - cpp.x) / rX,
            (currp.y - cpp.y) / rY
        ]) // θ1
        ;
        // angle delta
        const u = [
            (currp.x - cpp.x) / rX,
            (currp.y - cpp.y) / rY
        ];
        const v = [
            (-currp.x - cpp.x) / rX,
            (-currp.y - cpp.y) / rY
        ];
        let ad = vectorsAngle(u, v) // Δθ
        ;
        if (vectorsRatio(u, v) <= -1) {
            ad = Math.PI;
        }
        if (vectorsRatio(u, v) >= 1) {
            ad = 0;
        }
        return {
            currentPoint,
            rX,
            rY,
            sweepFlag,
            xAxisRotation,
            centp,
            a1,
            ad
        };
    }
    pathA(ctx, boundingBox) {
        const { pathParser  } = this;
        const { currentPoint , rX , rY , sweepFlag , xAxisRotation , centp , a1 , ad  } = PathElement.pathA(pathParser);
        // for markers
        const dir = 1 - sweepFlag ? 1 : -1;
        const ah = a1 + dir * (ad / 2);
        const halfWay = new Point(centp.x + rX * Math.cos(ah), centp.y + rY * Math.sin(ah));
        pathParser.addMarkerAngle(halfWay, ah - dir * Math.PI / 2);
        pathParser.addMarkerAngle(currentPoint, ah - dir * Math.PI);
        boundingBox.addPoint(currentPoint.x, currentPoint.y) // TODO: this is too naive, make it better
        ;
        if (ctx && !isNaN(a1) && !isNaN(ad)) {
            const r = rX > rY ? rX : rY;
            const sx = rX > rY ? 1 : rX / rY;
            const sy = rX > rY ? rY / rX : 1;
            ctx.translate(centp.x, centp.y);
            ctx.rotate(xAxisRotation);
            ctx.scale(sx, sy);
            ctx.arc(0, 0, r, a1, a1 + ad, Boolean(1 - sweepFlag));
            ctx.scale(1 / sx, 1 / sy);
            ctx.rotate(-xAxisRotation);
            ctx.translate(-centp.x, -centp.y);
        }
    }
    static pathZ(pathParser) {
        pathParser.current = pathParser.start;
    }
    pathZ(ctx, boundingBox) {
        PathElement.pathZ(this.pathParser);
        if (ctx) {
            // only close path if it is not a straight line
            if (boundingBox.x1 !== boundingBox.x2 && boundingBox.y1 !== boundingBox.y2) {
                ctx.closePath();
            }
        }
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'path';
        this.pathParser = new PathParser(this.getAttribute('d').getString());
    }
}

class SVGElement extends RenderedElement {
    setContext(ctx) {
        var ref;
        const { document  } = this;
        const { screen , window  } = document;
        const canvas = ctx.canvas;
        screen.setDefaults(ctx);
        if ('style' in canvas && typeof ctx.font !== 'undefined' && window && typeof window.getComputedStyle !== 'undefined') {
            ctx.font = window.getComputedStyle(canvas).getPropertyValue('font');
            const fontSizeProp = new Property(document, 'fontSize', Font.parse(ctx.font).fontSize);
            if (fontSizeProp.hasValue()) {
                document.rootEmSize = fontSizeProp.getPixels('y');
                document.emSize = document.rootEmSize;
            }
        }
        // create new view port
        if (!this.getAttribute('x').hasValue()) {
            this.getAttribute('x', true).setValue(0);
        }
        if (!this.getAttribute('y').hasValue()) {
            this.getAttribute('y', true).setValue(0);
        }
        let { width , height  } = screen.viewPort;
        if (!this.getStyle('width').hasValue()) {
            this.getStyle('width', true).setValue('100%');
        }
        if (!this.getStyle('height').hasValue()) {
            this.getStyle('height', true).setValue('100%');
        }
        if (!this.getStyle('color').hasValue()) {
            this.getStyle('color', true).setValue('black');
        }
        const refXAttr = this.getAttribute('refX');
        const refYAttr = this.getAttribute('refY');
        const viewBoxAttr = this.getAttribute('viewBox');
        const viewBox = viewBoxAttr.hasValue() ? toNumbers(viewBoxAttr.getString()) : null;
        const clip = !this.root && this.getStyle('overflow').getValue('hidden') !== 'visible';
        let minX = 0;
        let minY = 0;
        let clipX = 0;
        let clipY = 0;
        if (viewBox) {
            minX = viewBox[0];
            minY = viewBox[1];
        }
        if (!this.root) {
            width = this.getStyle('width').getPixels('x');
            height = this.getStyle('height').getPixels('y');
            if (this.type === 'marker') {
                clipX = minX;
                clipY = minY;
                minX = 0;
                minY = 0;
            }
        }
        screen.viewPort.setCurrent(width, height);
        // Default value of transform-origin is center only for root SVG elements
        // https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/transform-origin
        if (this.node // is not temporary SVGElement
         && (!this.parent || ((ref = this.node.parentNode) === null || ref === void 0 ? void 0 : ref.nodeName) === 'foreignObject') && this.getStyle('transform', false, true).hasValue() && !this.getStyle('transform-origin', false, true).hasValue()) {
            this.getStyle('transform-origin', true, true).setValue('50% 50%');
        }
        super.setContext(ctx);
        ctx.translate(this.getAttribute('x').getPixels('x'), this.getAttribute('y').getPixels('y'));
        if (viewBox) {
            width = viewBox[2];
            height = viewBox[3];
        }
        document.setViewBox({
            ctx,
            aspectRatio: this.getAttribute('preserveAspectRatio').getString(),
            width: screen.viewPort.width,
            desiredWidth: width,
            height: screen.viewPort.height,
            desiredHeight: height,
            minX,
            minY,
            refX: refXAttr.getValue(),
            refY: refYAttr.getValue(),
            clip,
            clipX,
            clipY
        });
        if (viewBox) {
            screen.viewPort.removeCurrent();
            screen.viewPort.setCurrent(width, height);
        }
    }
    clearContext(ctx) {
        super.clearContext(ctx);
        this.document.screen.viewPort.removeCurrent();
    }
    /**
   * Resize SVG to fit in given size.
   * @param width
   * @param height
   * @param preserveAspectRatio
   */ resize(width) {
        let height = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : width, preserveAspectRatio = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        const widthAttr = this.getAttribute('width', true);
        const heightAttr = this.getAttribute('height', true);
        const viewBoxAttr = this.getAttribute('viewBox');
        const styleAttr = this.getAttribute('style');
        const originWidth = widthAttr.getNumber(0);
        const originHeight = heightAttr.getNumber(0);
        if (preserveAspectRatio) {
            if (typeof preserveAspectRatio === 'string') {
                this.getAttribute('preserveAspectRatio', true).setValue(preserveAspectRatio);
            } else {
                const preserveAspectRatioAttr = this.getAttribute('preserveAspectRatio');
                if (preserveAspectRatioAttr.hasValue()) {
                    preserveAspectRatioAttr.setValue(preserveAspectRatioAttr.getString().replace(/^\s*(\S.*\S)\s*$/, '$1'));
                }
            }
        }
        widthAttr.setValue(width);
        heightAttr.setValue(height);
        if (!viewBoxAttr.hasValue()) {
            viewBoxAttr.setValue("0 0 ".concat(originWidth || width, " ").concat(originHeight || height));
        }
        if (styleAttr.hasValue()) {
            const widthStyle = this.getStyle('width');
            const heightStyle = this.getStyle('height');
            if (widthStyle.hasValue()) {
                widthStyle.setValue("".concat(width, "px"));
            }
            if (heightStyle.hasValue()) {
                heightStyle.setValue("".concat(height, "px"));
            }
        }
    }
    constructor(...args){
        super(...args);
        this.type = 'svg';
        this.root = false;
    }
}

class RectElement extends PathElement {
    path(ctx) {
        const x = this.getAttribute('x').getPixels('x');
        const y = this.getAttribute('y').getPixels('y');
        const width = this.getStyle('width', false, true).getPixels('x');
        const height = this.getStyle('height', false, true).getPixels('y');
        const rxAttr = this.getAttribute('rx');
        const ryAttr = this.getAttribute('ry');
        let rx = rxAttr.getPixels('x');
        let ry = ryAttr.getPixels('y');
        if (rxAttr.hasValue() && !ryAttr.hasValue()) {
            ry = rx;
        }
        if (ryAttr.hasValue() && !rxAttr.hasValue()) {
            rx = ry;
        }
        rx = Math.min(rx, width / 2);
        ry = Math.min(ry, height / 2);
        if (ctx) {
            const KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
            ctx.beginPath() // always start the path so we don't fill prior paths
            ;
            if (height > 0 && width > 0) {
                ctx.moveTo(x + rx, y);
                ctx.lineTo(x + width - rx, y);
                ctx.bezierCurveTo(x + width - rx + KAPPA * rx, y, x + width, y + ry - KAPPA * ry, x + width, y + ry);
                ctx.lineTo(x + width, y + height - ry);
                ctx.bezierCurveTo(x + width, y + height - ry + KAPPA * ry, x + width - rx + KAPPA * rx, y + height, x + width - rx, y + height);
                ctx.lineTo(x + rx, y + height);
                ctx.bezierCurveTo(x + rx - KAPPA * rx, y + height, x, y + height - ry + KAPPA * ry, x, y + height - ry);
                ctx.lineTo(x, y + ry);
                ctx.bezierCurveTo(x, y + ry - KAPPA * ry, x + rx - KAPPA * rx, y, x + rx, y);
                ctx.closePath();
            }
        }
        return new BoundingBox(x, y, x + width, y + height);
    }
    getMarkers() {
        return null;
    }
    constructor(...args){
        super(...args);
        this.type = 'rect';
    }
}

class CircleElement extends PathElement {
    path(ctx) {
        const cx = this.getAttribute('cx').getPixels('x');
        const cy = this.getAttribute('cy').getPixels('y');
        const r = this.getAttribute('r').getPixels();
        if (ctx && r > 0) {
            ctx.beginPath();
            ctx.arc(cx, cy, r, 0, Math.PI * 2, false);
            ctx.closePath();
        }
        return new BoundingBox(cx - r, cy - r, cx + r, cy + r);
    }
    getMarkers() {
        return null;
    }
    constructor(...args){
        super(...args);
        this.type = 'circle';
    }
}

class EllipseElement extends PathElement {
    path(ctx) {
        const KAPPA = 4 * ((Math.sqrt(2) - 1) / 3);
        const rx = this.getAttribute('rx').getPixels('x');
        const ry = this.getAttribute('ry').getPixels('y');
        const cx = this.getAttribute('cx').getPixels('x');
        const cy = this.getAttribute('cy').getPixels('y');
        if (ctx && rx > 0 && ry > 0) {
            ctx.beginPath();
            ctx.moveTo(cx + rx, cy);
            ctx.bezierCurveTo(cx + rx, cy + KAPPA * ry, cx + KAPPA * rx, cy + ry, cx, cy + ry);
            ctx.bezierCurveTo(cx - KAPPA * rx, cy + ry, cx - rx, cy + KAPPA * ry, cx - rx, cy);
            ctx.bezierCurveTo(cx - rx, cy - KAPPA * ry, cx - KAPPA * rx, cy - ry, cx, cy - ry);
            ctx.bezierCurveTo(cx + KAPPA * rx, cy - ry, cx + rx, cy - KAPPA * ry, cx + rx, cy);
            ctx.closePath();
        }
        return new BoundingBox(cx - rx, cy - ry, cx + rx, cy + ry);
    }
    getMarkers() {
        return null;
    }
    constructor(...args){
        super(...args);
        this.type = 'ellipse';
    }
}

class LineElement extends PathElement {
    getPoints() {
        return [
            new Point(this.getAttribute('x1').getPixels('x'), this.getAttribute('y1').getPixels('y')),
            new Point(this.getAttribute('x2').getPixels('x'), this.getAttribute('y2').getPixels('y'))
        ];
    }
    path(ctx) {
        const [{ x: x0 , y: y0  }, { x: x1 , y: y1  }] = this.getPoints();
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
            ctx.lineTo(x1, y1);
        }
        return new BoundingBox(x0, y0, x1, y1);
    }
    getMarkers() {
        const [p0, p1] = this.getPoints();
        const a = p0.angleTo(p1);
        return [
            [
                p0,
                a
            ],
            [
                p1,
                a
            ]
        ];
    }
    constructor(...args){
        super(...args);
        this.type = 'line';
    }
}

class PolylineElement extends PathElement {
    path(ctx) {
        const { points  } = this;
        const [{ x: x0 , y: y0  }] = points;
        const boundingBox = new BoundingBox(x0, y0);
        if (ctx) {
            ctx.beginPath();
            ctx.moveTo(x0, y0);
        }
        points.forEach((param)=>{
            let { x , y  } = param;
            boundingBox.addPoint(x, y);
            if (ctx) {
                ctx.lineTo(x, y);
            }
        });
        return boundingBox;
    }
    getMarkers() {
        const { points  } = this;
        const lastIndex = points.length - 1;
        const markers = [];
        points.forEach((point, i)=>{
            if (i === lastIndex) {
                return;
            }
            markers.push([
                point,
                point.angleTo(points[i + 1])
            ]);
        });
        if (markers.length > 0) {
            markers.push([
                points[points.length - 1],
                markers[markers.length - 1][1]
            ]);
        }
        return markers;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'polyline';
        this.points = [];
        this.points = Point.parsePath(this.getAttribute('points').getString());
    }
}

class PolygonElement extends PolylineElement {
    path(ctx) {
        const boundingBox = super.path(ctx);
        const [{ x , y  }] = this.points;
        if (ctx) {
            ctx.lineTo(x, y);
            ctx.closePath();
        }
        return boundingBox;
    }
    constructor(...args){
        super(...args);
        this.type = 'polygon';
    }
}

class PatternElement extends Element {
    createPattern(ctx, _, parentOpacityProp) {
        const width = this.getStyle('width').getPixels('x', true);
        const height = this.getStyle('height').getPixels('y', true);
        // render me using a temporary svg element
        const patternSvg = new SVGElement(this.document, null);
        patternSvg.attributes.viewBox = new Property(this.document, 'viewBox', this.getAttribute('viewBox').getValue());
        patternSvg.attributes.width = new Property(this.document, 'width', "".concat(width, "px"));
        patternSvg.attributes.height = new Property(this.document, 'height', "".concat(height, "px"));
        patternSvg.attributes.transform = new Property(this.document, 'transform', this.getAttribute('patternTransform').getValue());
        patternSvg.children = this.children;
        const patternCanvas = this.document.createCanvas(width, height);
        const patternCtx = patternCanvas.getContext('2d');
        const xAttr = this.getAttribute('x');
        const yAttr = this.getAttribute('y');
        if (xAttr.hasValue() && yAttr.hasValue()) {
            patternCtx.translate(xAttr.getPixels('x', true), yAttr.getPixels('y', true));
        }
        if (parentOpacityProp.hasValue()) {
            this.styles['fill-opacity'] = parentOpacityProp;
        } else {
            Reflect.deleteProperty(this.styles, 'fill-opacity');
        }
        // render 3x3 grid so when we transform there's no white space on edges
        for(let x = -1; x <= 1; x++){
            for(let y = -1; y <= 1; y++){
                patternCtx.save();
                patternSvg.attributes.x = new Property(this.document, 'x', x * patternCanvas.width);
                patternSvg.attributes.y = new Property(this.document, 'y', y * patternCanvas.height);
                patternSvg.render(patternCtx);
                patternCtx.restore();
            }
        }
        const pattern = ctx.createPattern(patternCanvas, 'repeat');
        return pattern;
    }
    constructor(...args){
        super(...args);
        this.type = 'pattern';
    }
}

class MarkerElement extends Element {
    render(ctx, point, angle) {
        if (!point) {
            return;
        }
        const { x , y  } = point;
        const orient = this.getAttribute('orient').getString('auto');
        const markerUnits = this.getAttribute('markerUnits').getString('strokeWidth');
        ctx.translate(x, y);
        if (orient === 'auto') {
            ctx.rotate(angle);
        }
        if (markerUnits === 'strokeWidth') {
            ctx.scale(ctx.lineWidth, ctx.lineWidth);
        }
        ctx.save();
        // render me using a temporary svg element
        const markerSvg = new SVGElement(this.document);
        markerSvg.type = this.type;
        markerSvg.attributes.viewBox = new Property(this.document, 'viewBox', this.getAttribute('viewBox').getValue());
        markerSvg.attributes.refX = new Property(this.document, 'refX', this.getAttribute('refX').getValue());
        markerSvg.attributes.refY = new Property(this.document, 'refY', this.getAttribute('refY').getValue());
        markerSvg.attributes.width = new Property(this.document, 'width', this.getAttribute('markerWidth').getValue());
        markerSvg.attributes.height = new Property(this.document, 'height', this.getAttribute('markerHeight').getValue());
        markerSvg.attributes.overflow = new Property(this.document, 'overflow', this.getAttribute('overflow').getValue());
        markerSvg.attributes.fill = new Property(this.document, 'fill', this.getAttribute('fill').getColor('black'));
        markerSvg.attributes.stroke = new Property(this.document, 'stroke', this.getAttribute('stroke').getValue('none'));
        markerSvg.children = this.children;
        markerSvg.render(ctx);
        ctx.restore();
        if (markerUnits === 'strokeWidth') {
            ctx.scale(1 / ctx.lineWidth, 1 / ctx.lineWidth);
        }
        if (orient === 'auto') {
            ctx.rotate(-angle);
        }
        ctx.translate(-x, -y);
    }
    constructor(...args){
        super(...args);
        this.type = 'marker';
    }
}

class DefsElement extends Element {
    render() {
    // NOOP
    }
    constructor(...args){
        super(...args);
        this.type = 'defs';
    }
}

class GElement extends RenderedElement {
    getBoundingBox(ctx) {
        const boundingBox = new BoundingBox();
        this.children.forEach((child)=>{
            boundingBox.addBoundingBox(child.getBoundingBox(ctx));
        });
        return boundingBox;
    }
    constructor(...args){
        super(...args);
        this.type = 'g';
    }
}

class GradientElement extends Element {
    getGradientUnits() {
        return this.getAttribute('gradientUnits').getString('objectBoundingBox');
    }
    createGradient(ctx, element, parentOpacityProp) {
        // eslint-disable-next-line @typescript-eslint/no-this-alias, consistent-this
        let stopsContainer = this;
        if (this.getHrefAttribute().hasValue()) {
            stopsContainer = this.getHrefAttribute().getDefinition();
            this.inheritStopContainer(stopsContainer);
        }
        const { stops  } = stopsContainer;
        const gradient = this.getGradient(ctx, element);
        if (!gradient) {
            return this.addParentOpacity(parentOpacityProp, stops[stops.length - 1].color);
        }
        stops.forEach((stop)=>{
            gradient.addColorStop(stop.offset, this.addParentOpacity(parentOpacityProp, stop.color));
        });
        if (this.getAttribute('gradientTransform').hasValue()) {
            // render as transformed pattern on temporary canvas
            const { document  } = this;
            const { MAX_VIRTUAL_PIXELS  } = Screen;
            const { viewPort  } = document.screen;
            const rootView = viewPort.getRoot();
            const rect = new RectElement(document);
            rect.attributes.x = new Property(document, 'x', -MAX_VIRTUAL_PIXELS / 3);
            rect.attributes.y = new Property(document, 'y', -MAX_VIRTUAL_PIXELS / 3);
            rect.attributes.width = new Property(document, 'width', MAX_VIRTUAL_PIXELS);
            rect.attributes.height = new Property(document, 'height', MAX_VIRTUAL_PIXELS);
            const group = new GElement(document);
            group.attributes.transform = new Property(document, 'transform', this.getAttribute('gradientTransform').getValue());
            group.children = [
                rect
            ];
            const patternSvg = new SVGElement(document);
            patternSvg.attributes.x = new Property(document, 'x', 0);
            patternSvg.attributes.y = new Property(document, 'y', 0);
            patternSvg.attributes.width = new Property(document, 'width', rootView.width);
            patternSvg.attributes.height = new Property(document, 'height', rootView.height);
            patternSvg.children = [
                group
            ];
            const patternCanvas = document.createCanvas(rootView.width, rootView.height);
            const patternCtx = patternCanvas.getContext('2d');
            patternCtx.fillStyle = gradient;
            patternSvg.render(patternCtx);
            return patternCtx.createPattern(patternCanvas, 'no-repeat');
        }
        return gradient;
    }
    inheritStopContainer(stopsContainer) {
        this.attributesToInherit.forEach((attributeToInherit)=>{
            if (!this.getAttribute(attributeToInherit).hasValue() && stopsContainer.getAttribute(attributeToInherit).hasValue()) {
                this.getAttribute(attributeToInherit, true).setValue(stopsContainer.getAttribute(attributeToInherit).getValue());
            }
        });
    }
    addParentOpacity(parentOpacityProp, color) {
        if (parentOpacityProp.hasValue()) {
            const colorProp = new Property(this.document, 'color', color);
            return colorProp.addOpacity(parentOpacityProp).getColor();
        }
        return color;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.attributesToInherit = [
            'gradientUnits'
        ];
        this.stops = [];
        const { stops , children  } = this;
        children.forEach((child)=>{
            if (child.type === 'stop') {
                stops.push(child);
            }
        });
    }
}

class LinearGradientElement extends GradientElement {
    getGradient(ctx, element) {
        const isBoundingBoxUnits = this.getGradientUnits() === 'objectBoundingBox';
        const boundingBox = isBoundingBoxUnits ? element.getBoundingBox(ctx) : null;
        if (isBoundingBoxUnits && !boundingBox) {
            return null;
        }
        if (!this.getAttribute('x1').hasValue() && !this.getAttribute('y1').hasValue() && !this.getAttribute('x2').hasValue() && !this.getAttribute('y2').hasValue()) {
            this.getAttribute('x1', true).setValue(0);
            this.getAttribute('y1', true).setValue(0);
            this.getAttribute('x2', true).setValue(1);
            this.getAttribute('y2', true).setValue(0);
        }
        const x1 = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute('x1').getNumber() : this.getAttribute('x1').getPixels('x');
        const y1 = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute('y1').getNumber() : this.getAttribute('y1').getPixels('y');
        const x2 = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute('x2').getNumber() : this.getAttribute('x2').getPixels('x');
        const y2 = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute('y2').getNumber() : this.getAttribute('y2').getPixels('y');
        if (x1 === x2 && y1 === y2) {
            return null;
        }
        return ctx.createLinearGradient(x1, y1, x2, y2);
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'linearGradient';
        this.attributesToInherit.push('x1', 'y1', 'x2', 'y2');
    }
}

class RadialGradientElement extends GradientElement {
    getGradient(ctx, element) {
        const isBoundingBoxUnits = this.getGradientUnits() === 'objectBoundingBox';
        const boundingBox = element.getBoundingBox(ctx);
        if (isBoundingBoxUnits && !boundingBox) {
            return null;
        }
        if (!this.getAttribute('cx').hasValue()) {
            this.getAttribute('cx', true).setValue('50%');
        }
        if (!this.getAttribute('cy').hasValue()) {
            this.getAttribute('cy', true).setValue('50%');
        }
        if (!this.getAttribute('r').hasValue()) {
            this.getAttribute('r', true).setValue('50%');
        }
        const cx = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute('cx').getNumber() : this.getAttribute('cx').getPixels('x');
        const cy = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute('cy').getNumber() : this.getAttribute('cy').getPixels('y');
        let fx = cx;
        let fy = cy;
        if (this.getAttribute('fx').hasValue()) {
            fx = isBoundingBoxUnits ? boundingBox.x + boundingBox.width * this.getAttribute('fx').getNumber() : this.getAttribute('fx').getPixels('x');
        }
        if (this.getAttribute('fy').hasValue()) {
            fy = isBoundingBoxUnits ? boundingBox.y + boundingBox.height * this.getAttribute('fy').getNumber() : this.getAttribute('fy').getPixels('y');
        }
        const r = isBoundingBoxUnits ? (boundingBox.width + boundingBox.height) / 2 * this.getAttribute('r').getNumber() : this.getAttribute('r').getPixels();
        const fr = this.getAttribute('fr').getPixels();
        return ctx.createRadialGradient(fx, fy, fr, cx, cy, r);
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'radialGradient';
        this.attributesToInherit.push('cx', 'cy', 'r', 'fx', 'fy', 'fr');
    }
}

class StopElement extends Element {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'stop';
        const offset = Math.max(0, Math.min(1, this.getAttribute('offset').getNumber()));
        const stopOpacity = this.getStyle('stop-opacity');
        let stopColor = this.getStyle('stop-color', true);
        if (stopColor.getString() === '') {
            stopColor.setValue('#000');
        }
        if (stopOpacity.hasValue()) {
            stopColor = stopColor.addOpacity(stopOpacity);
        }
        this.offset = offset;
        this.color = stopColor.getColor();
    }
}

class AnimateElement extends Element {
    getProperty() {
        const attributeType = this.getAttribute('attributeType').getString();
        const attributeName = this.getAttribute('attributeName').getString();
        if (attributeType === 'CSS') {
            return this.parent.getStyle(attributeName, true);
        }
        return this.parent.getAttribute(attributeName, true);
    }
    calcValue() {
        const { initialUnits  } = this;
        const { progress , from , to  } = this.getProgress();
        // tween value linearly
        let newValue = from.getNumber() + (to.getNumber() - from.getNumber()) * progress;
        if (initialUnits === '%') {
            newValue *= 100 // numValue() returns 0-1 whereas properties are 0-100
            ;
        }
        return "".concat(newValue).concat(initialUnits);
    }
    update(delta) {
        const { parent  } = this;
        const prop = this.getProperty();
        // set initial value
        if (!this.initialValue) {
            this.initialValue = prop.getString();
            this.initialUnits = prop.getUnits();
        }
        // if we're past the end time
        if (this.duration > this.maxDuration) {
            const fill = this.getAttribute('fill').getString('remove');
            // loop for indefinitely repeating animations
            if (this.getAttribute('repeatCount').getString() === 'indefinite' || this.getAttribute('repeatDur').getString() === 'indefinite') {
                this.duration = 0;
            } else if (fill === 'freeze' && !this.frozen) {
                this.frozen = true;
                if (parent && prop) {
                    parent.animationFrozen = true;
                    parent.animationFrozenValue = prop.getString();
                }
            } else if (fill === 'remove' && !this.removed) {
                this.removed = true;
                if (parent && prop) {
                    prop.setValue(parent.animationFrozen ? parent.animationFrozenValue : this.initialValue);
                }
                return true;
            }
            return false;
        }
        this.duration += delta;
        // if we're past the begin time
        let updated = false;
        if (this.begin < this.duration) {
            let newValue = this.calcValue() // tween
            ;
            const typeAttr = this.getAttribute('type');
            if (typeAttr.hasValue()) {
                // for transform, etc.
                const type = typeAttr.getString();
                newValue = "".concat(type, "(").concat(newValue, ")");
            }
            prop.setValue(newValue);
            updated = true;
        }
        return updated;
    }
    getProgress() {
        const { document , values  } = this;
        let progress = (this.duration - this.begin) / (this.maxDuration - this.begin);
        let from;
        let to;
        if (values.hasValue()) {
            const p = progress * (values.getValue().length - 1);
            const lb = Math.floor(p);
            const ub = Math.ceil(p);
            let value;
            value = values.getValue()[lb];
            from = new Property(document, 'from', value ? parseFloat(value) : 0);
            value = values.getValue()[ub];
            to = new Property(document, 'to', value ? parseFloat(value) : 0);
            progress = (p - lb) / (ub - lb);
        } else {
            from = this.from;
            to = this.to;
        }
        return {
            progress,
            from,
            to
        };
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'animate';
        this.duration = 0;
        this.initialUnits = '';
        this.removed = false;
        this.frozen = false;
        document.screen.animations.push(this);
        this.begin = this.getAttribute('begin').getMilliseconds();
        this.maxDuration = this.begin + this.getAttribute('dur').getMilliseconds();
        this.from = this.getAttribute('from');
        this.to = this.getAttribute('to');
        this.values = new Property(document, 'values', null);
        const valuesAttr = this.getAttribute('values');
        if (valuesAttr.hasValue()) {
            this.values.setValue(valuesAttr.getString().split(';'));
        }
    }
}

class AnimateColorElement extends AnimateElement {
    calcValue() {
        const { progress , from , to  } = this.getProgress();
        const colorFrom = new RGBColor__default["default"](from.getColor());
        const colorTo = new RGBColor__default["default"](to.getColor());
        if (colorFrom.ok && colorTo.ok) {
            // tween color linearly
            const r = colorFrom.r + (colorTo.r - colorFrom.r) * progress;
            const g = colorFrom.g + (colorTo.g - colorFrom.g) * progress;
            const b = colorFrom.b + (colorTo.b - colorFrom.b) * progress;
            // ? alpha
            return "rgb(".concat(Math.floor(r), ", ").concat(Math.floor(g), ", ").concat(Math.floor(b), ")");
        }
        return this.getAttribute('from').getColor();
    }
    constructor(...args){
        super(...args);
        this.type = 'animateColor';
    }
}

class AnimateTransformElement extends AnimateElement {
    calcValue() {
        const { progress , from: from1 , to: to1  } = this.getProgress();
        // tween value linearly
        const transformFrom = toNumbers(from1.getString());
        const transformTo = toNumbers(to1.getString());
        const newValue = transformFrom.map((from, i)=>{
            const to = transformTo[i];
            return from + (to - from) * progress;
        }).join(' ');
        return newValue;
    }
    constructor(...args){
        super(...args);
        this.type = 'animateTransform';
    }
}

class FontFaceElement extends Element {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'font-face';
        this.ascent = this.getAttribute('ascent').getNumber();
        this.descent = this.getAttribute('descent').getNumber();
        this.unitsPerEm = this.getAttribute('units-per-em').getNumber();
    }
}

class GlyphElement extends PathElement {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'glyph';
        this.horizAdvX = this.getAttribute('horiz-adv-x').getNumber();
        this.unicode = this.getAttribute('unicode').getString();
        this.arabicForm = this.getAttribute('arabic-form').getString();
    }
}

class MissingGlyphElement extends GlyphElement {
    constructor(...args){
        super(...args);
        this.type = 'missing-glyph';
        this.horizAdvX = 0;
    }
}

class FontElement extends Element {
    render() {
    // NO RENDER
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'font';
        this.isArabic = false;
        this.glyphs = {};
        this.arabicGlyphs = {};
        this.isRTL = false;
        this.horizAdvX = this.getAttribute('horiz-adv-x').getNumber();
        const { definitions  } = document;
        const { children  } = this;
        for (const child of children){
            if (child instanceof FontFaceElement) {
                this.fontFace = child;
                const fontFamilyStyle = child.getStyle('font-family');
                if (fontFamilyStyle.hasValue()) {
                    definitions[fontFamilyStyle.getString()] = this;
                }
            } else if (child instanceof MissingGlyphElement) {
                this.missingGlyph = child;
            } else if (child instanceof GlyphElement) {
                if (child.arabicForm) {
                    this.isRTL = true;
                    this.isArabic = true;
                    const arabicGlyph = this.arabicGlyphs[child.unicode];
                    if (typeof arabicGlyph === 'undefined') {
                        this.arabicGlyphs[child.unicode] = {
                            [child.arabicForm]: child
                        };
                    } else {
                        arabicGlyph[child.arabicForm] = child;
                    }
                } else {
                    this.glyphs[child.unicode] = child;
                }
            }
        }
    }
}

class TRefElement extends TextElement {
    getText() {
        const element = this.getHrefAttribute().getDefinition();
        if (element) {
            const firstChild = element.children[0];
            if (firstChild) {
                return firstChild.getText();
            }
        }
        return '';
    }
    constructor(...args){
        super(...args);
        this.type = 'tref';
    }
}

class AElement extends TextElement {
    getText() {
        return this.text;
    }
    renderChildren(ctx) {
        if (this.hasText) {
            // render as text element
            super.renderChildren(ctx);
            const { document , x , y  } = this;
            const { mouse  } = document.screen;
            const fontSize = new Property(document, 'fontSize', Font.parse(document.ctx.font).fontSize);
            // Do not calc bounding box if mouse is not working.
            if (mouse.isWorking()) {
                mouse.checkBoundingBox(this, new BoundingBox(x, y - fontSize.getPixels('y'), x + this.measureText(ctx), y));
            }
        } else if (this.children.length > 0) {
            // render as temporary group
            const g = new GElement(this.document);
            g.children = this.children;
            g.parent = this;
            g.render(ctx);
        }
    }
    onClick() {
        const { window  } = this.document;
        if (window) {
            window.open(this.getHrefAttribute().getString());
        }
    }
    onMouseMove() {
        const ctx = this.document.ctx;
        ctx.canvas.style.cursor = 'pointer';
    }
    constructor(document, node1, captureTextNodes){
        super(document, node1, captureTextNodes);
        this.type = 'a';
        const { childNodes  } = node1;
        const firstChild = childNodes[0];
        const hasText = childNodes.length > 0 && Array.from(childNodes).every((node)=>node.nodeType === 3
        );
        this.hasText = hasText;
        this.text = hasText ? this.getTextFromNode(firstChild) : '';
    }
}

class TextPathElement extends TextElement {
    getText() {
        return this.text;
    }
    path(ctx) {
        const { dataArray  } = this;
        if (ctx) {
            ctx.beginPath();
        }
        dataArray.forEach((param)=>{
            let { type , points  } = param;
            switch(type){
                case PathParser.LINE_TO:
                    if (ctx) {
                        ctx.lineTo(points[0], points[1]);
                    }
                    break;
                case PathParser.MOVE_TO:
                    if (ctx) {
                        ctx.moveTo(points[0], points[1]);
                    }
                    break;
                case PathParser.CURVE_TO:
                    if (ctx) {
                        ctx.bezierCurveTo(points[0], points[1], points[2], points[3], points[4], points[5]);
                    }
                    break;
                case PathParser.QUAD_TO:
                    if (ctx) {
                        ctx.quadraticCurveTo(points[0], points[1], points[2], points[3]);
                    }
                    break;
                case PathParser.ARC:
                    {
                        const [cx, cy, rx, ry, theta, dTheta, psi, fs] = points;
                        const r = rx > ry ? rx : ry;
                        const scaleX = rx > ry ? 1 : rx / ry;
                        const scaleY = rx > ry ? ry / rx : 1;
                        if (ctx) {
                            ctx.translate(cx, cy);
                            ctx.rotate(psi);
                            ctx.scale(scaleX, scaleY);
                            ctx.arc(0, 0, r, theta, theta + dTheta, Boolean(1 - fs));
                            ctx.scale(1 / scaleX, 1 / scaleY);
                            ctx.rotate(-psi);
                            ctx.translate(-cx, -cy);
                        }
                        break;
                    }
                case PathParser.CLOSE_PATH:
                    if (ctx) {
                        ctx.closePath();
                    }
                    break;
            }
        });
    }
    renderChildren(ctx) {
        this.setTextData(ctx);
        ctx.save();
        const textDecoration = this.parent.getStyle('text-decoration').getString();
        const fontSize = this.getFontSize();
        const { glyphInfo  } = this;
        const fill = ctx.fillStyle;
        if (textDecoration === 'underline') {
            ctx.beginPath();
        }
        glyphInfo.forEach((glyph, i)=>{
            const { p0 , p1 , rotation , text: partialText  } = glyph;
            ctx.save();
            ctx.translate(p0.x, p0.y);
            ctx.rotate(rotation);
            if (ctx.fillStyle) {
                ctx.fillText(partialText, 0, 0);
            }
            if (ctx.strokeStyle) {
                ctx.strokeText(partialText, 0, 0);
            }
            ctx.restore();
            if (textDecoration === 'underline') {
                if (i === 0) {
                    ctx.moveTo(p0.x, p0.y + fontSize / 8);
                }
                ctx.lineTo(p1.x, p1.y + fontSize / 5);
            }
        // // To assist with debugging visually, uncomment following
        //
        // ctx.beginPath();
        // if (i % 2)
        //   ctx.strokeStyle = 'red';
        // else
        //   ctx.strokeStyle = 'green';
        // ctx.moveTo(p0.x, p0.y);
        // ctx.lineTo(p1.x, p1.y);
        // ctx.stroke();
        // ctx.closePath();
        });
        if (textDecoration === 'underline') {
            ctx.lineWidth = fontSize / 20;
            ctx.strokeStyle = fill;
            ctx.stroke();
            ctx.closePath();
        }
        ctx.restore();
    }
    getLetterSpacingAt() {
        let idx = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : 0;
        return this.letterSpacingCache[idx] || 0;
    }
    findSegmentToFitChar(ctx, anchor, textFullWidth, fullPathWidth, spacesNumber, inputOffset, dy, c, charI) {
        let offset = inputOffset;
        let glyphWidth = this.measureText(ctx, c);
        if (c === ' ' && anchor === 'justify' && textFullWidth < fullPathWidth) {
            glyphWidth += (fullPathWidth - textFullWidth) / spacesNumber;
        }
        if (charI > -1) {
            offset += this.getLetterSpacingAt(charI);
        }
        const splineStep = this.textHeight / 20;
        const p0 = this.getEquidistantPointOnPath(offset, splineStep, 0);
        const p1 = this.getEquidistantPointOnPath(offset + glyphWidth, splineStep, 0);
        const segment = {
            p0,
            p1
        };
        const rotation = p0 && p1 ? Math.atan2(p1.y - p0.y, p1.x - p0.x) : 0;
        if (dy) {
            const dyX = Math.cos(Math.PI / 2 + rotation) * dy;
            const dyY = Math.cos(-rotation) * dy;
            segment.p0 = {
                ...p0,
                x: p0.x + dyX,
                y: p0.y + dyY
            };
            segment.p1 = {
                ...p1,
                x: p1.x + dyX,
                y: p1.y + dyY
            };
        }
        offset += glyphWidth;
        return {
            offset,
            segment,
            rotation
        };
    }
    measureText(ctx, text) {
        const { measuresCache  } = this;
        const targetText = text || this.getText();
        if (measuresCache.has(targetText)) {
            return measuresCache.get(targetText);
        }
        const measure = this.measureTargetText(ctx, targetText);
        measuresCache.set(targetText, measure);
        return measure;
    }
    // This method supposes what all custom fonts already loaded.
    // If some font will be loaded after this method call, <textPath> will not be rendered correctly.
    // You need to call this method manually to update glyphs cache.
    setTextData(ctx) {
        if (this.glyphInfo) {
            return;
        }
        const renderText = this.getText();
        const chars = renderText.split('');
        const spacesNumber = renderText.split(' ').length - 1;
        const dx = this.parent.getAttribute('dx').split().map((_)=>_.getPixels('x')
        );
        const dy = this.parent.getAttribute('dy').getPixels('y');
        const anchor = this.parent.getStyle('text-anchor').getString('start');
        const thisSpacing = this.getStyle('letter-spacing');
        const parentSpacing = this.parent.getStyle('letter-spacing');
        let letterSpacing = 0;
        if (!thisSpacing.hasValue() || thisSpacing.getValue() === 'inherit') {
            letterSpacing = parentSpacing.getPixels();
        } else if (thisSpacing.hasValue()) {
            if (thisSpacing.getValue() !== 'initial' && thisSpacing.getValue() !== 'unset') {
                letterSpacing = thisSpacing.getPixels();
            }
        }
        // fill letter-spacing cache
        const letterSpacingCache = [];
        const textLen = renderText.length;
        this.letterSpacingCache = letterSpacingCache;
        for(let i1 = 0; i1 < textLen; i1++){
            letterSpacingCache.push(typeof dx[i1] !== 'undefined' ? dx[i1] : letterSpacing);
        }
        const dxSum = letterSpacingCache.reduce((acc, cur, i)=>i === 0 ? 0 : acc + cur || 0
        , 0);
        const textWidth = this.measureText(ctx);
        const textFullWidth = Math.max(textWidth + dxSum, 0);
        this.textWidth = textWidth;
        this.textHeight = this.getFontSize();
        this.glyphInfo = [];
        const fullPathWidth = this.getPathLength();
        const startOffset = this.getStyle('startOffset').getNumber(0) * fullPathWidth;
        let offset = 0;
        if (anchor === 'middle' || anchor === 'center') {
            offset = -textFullWidth / 2;
        }
        if (anchor === 'end' || anchor === 'right') {
            offset = -textFullWidth;
        }
        offset += startOffset;
        chars.forEach((char, i)=>{
            // Find such segment what distance between p0 and p1 is approx. width of glyph
            const { offset: nextOffset , segment , rotation  } = this.findSegmentToFitChar(ctx, anchor, textFullWidth, fullPathWidth, spacesNumber, offset, dy, char, i);
            offset = nextOffset;
            if (!segment.p0 || !segment.p1) {
                return;
            }
            // const width = this.getLineLength(
            //   segment.p0.x,
            //   segment.p0.y,
            //   segment.p1.x,
            //   segment.p1.y
            // );
            // Note: Since glyphs are rendered one at a time, any kerning pair data built into the font will not be used.
            // Can foresee having a rough pair table built in that the developer can override as needed.
            // Or use "dx" attribute of the <text> node as a naive replacement
            // const kern = 0;
            // placeholder for future implementation
            // const midpoint = this.getPointOnLine(
            //   kern + width / 2.0,
            //   segment.p0.x, segment.p0.y, segment.p1.x, segment.p1.y
            // );
            this.glyphInfo.push({
                // transposeX: midpoint.x,
                // transposeY: midpoint.y,
                text: chars[i],
                p0: segment.p0,
                p1: segment.p1,
                rotation
            });
        });
    }
    parsePathData(path) {
        this.pathLength = -1 // reset path length
        ;
        if (!path) {
            return [];
        }
        const pathCommands = [];
        const { pathParser  } = path;
        pathParser.reset();
        // convert l, H, h, V, and v to L
        while(!pathParser.isEnd()){
            const { current  } = pathParser;
            const startX = current ? current.x : 0;
            const startY = current ? current.y : 0;
            const command = pathParser.next();
            let nextCommandType = command.type;
            let points = [];
            switch(command.type){
                case PathParser.MOVE_TO:
                    this.pathM(pathParser, points);
                    break;
                case PathParser.LINE_TO:
                    nextCommandType = this.pathL(pathParser, points);
                    break;
                case PathParser.HORIZ_LINE_TO:
                    nextCommandType = this.pathH(pathParser, points);
                    break;
                case PathParser.VERT_LINE_TO:
                    nextCommandType = this.pathV(pathParser, points);
                    break;
                case PathParser.CURVE_TO:
                    this.pathC(pathParser, points);
                    break;
                case PathParser.SMOOTH_CURVE_TO:
                    nextCommandType = this.pathS(pathParser, points);
                    break;
                case PathParser.QUAD_TO:
                    this.pathQ(pathParser, points);
                    break;
                case PathParser.SMOOTH_QUAD_TO:
                    nextCommandType = this.pathT(pathParser, points);
                    break;
                case PathParser.ARC:
                    points = this.pathA(pathParser);
                    break;
                case PathParser.CLOSE_PATH:
                    PathElement.pathZ(pathParser);
                    break;
            }
            if (command.type !== PathParser.CLOSE_PATH) {
                pathCommands.push({
                    type: nextCommandType,
                    points,
                    start: {
                        x: startX,
                        y: startY
                    },
                    pathLength: this.calcLength(startX, startY, nextCommandType, points)
                });
            } else {
                pathCommands.push({
                    type: PathParser.CLOSE_PATH,
                    points: [],
                    pathLength: 0
                });
            }
        }
        return pathCommands;
    }
    pathM(pathParser, points) {
        const { x , y  } = PathElement.pathM(pathParser).point;
        points.push(x, y);
    }
    pathL(pathParser, points) {
        const { x , y  } = PathElement.pathL(pathParser).point;
        points.push(x, y);
        return PathParser.LINE_TO;
    }
    pathH(pathParser, points) {
        const { x , y  } = PathElement.pathH(pathParser).point;
        points.push(x, y);
        return PathParser.LINE_TO;
    }
    pathV(pathParser, points) {
        const { x , y  } = PathElement.pathV(pathParser).point;
        points.push(x, y);
        return PathParser.LINE_TO;
    }
    pathC(pathParser, points) {
        const { point , controlPoint , currentPoint  } = PathElement.pathC(pathParser);
        points.push(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
    }
    pathS(pathParser, points) {
        const { point , controlPoint , currentPoint  } = PathElement.pathS(pathParser);
        points.push(point.x, point.y, controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        return PathParser.CURVE_TO;
    }
    pathQ(pathParser, points) {
        const { controlPoint , currentPoint  } = PathElement.pathQ(pathParser);
        points.push(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
    }
    pathT(pathParser, points) {
        const { controlPoint , currentPoint  } = PathElement.pathT(pathParser);
        points.push(controlPoint.x, controlPoint.y, currentPoint.x, currentPoint.y);
        return PathParser.QUAD_TO;
    }
    pathA(pathParser) {
        let { rX , rY , sweepFlag , xAxisRotation , centp , a1 , ad  } = PathElement.pathA(pathParser);
        if (sweepFlag === 0 && ad > 0) {
            ad -= 2 * Math.PI;
        }
        if (sweepFlag === 1 && ad < 0) {
            ad += 2 * Math.PI;
        }
        return [
            centp.x,
            centp.y,
            rX,
            rY,
            a1,
            ad,
            xAxisRotation,
            sweepFlag
        ];
    }
    calcLength(x, y, commandType, points) {
        let len = 0;
        let p1 = null;
        let p2 = null;
        let t = 0;
        switch(commandType){
            case PathParser.LINE_TO:
                return this.getLineLength(x, y, points[0], points[1]);
            case PathParser.CURVE_TO:
                // Approximates by breaking curve into 100 line segments
                len = 0;
                p1 = this.getPointOnCubicBezier(0, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                for(t = 0.01; t <= 1; t += 0.01){
                    p2 = this.getPointOnCubicBezier(t, x, y, points[0], points[1], points[2], points[3], points[4], points[5]);
                    len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case PathParser.QUAD_TO:
                // Approximates by breaking curve into 100 line segments
                len = 0;
                p1 = this.getPointOnQuadraticBezier(0, x, y, points[0], points[1], points[2], points[3]);
                for(t = 0.01; t <= 1; t += 0.01){
                    p2 = this.getPointOnQuadraticBezier(t, x, y, points[0], points[1], points[2], points[3]);
                    len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    p1 = p2;
                }
                return len;
            case PathParser.ARC:
                {
                    // Approximates by breaking curve into line segments
                    len = 0;
                    const start = points[4];
                    // 4 = theta
                    const dTheta = points[5];
                    // 5 = dTheta
                    const end = points[4] + dTheta;
                    let inc = Math.PI / 180;
                    // 1 degree resolution
                    if (Math.abs(start - end) < inc) {
                        inc = Math.abs(start - end);
                    }
                    // Note: for purpose of calculating arc length, not going to worry about rotating X-axis by angle psi
                    p1 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], start, 0);
                    if (dTheta < 0) {
                        for(t = start - inc; t > end; t -= inc){
                            p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                            len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        }
                    } else {
                        for(t = start + inc; t < end; t += inc){
                            p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], t, 0);
                            len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                            p1 = p2;
                        }
                    }
                    p2 = this.getPointOnEllipticalArc(points[0], points[1], points[2], points[3], end, 0);
                    len += this.getLineLength(p1.x, p1.y, p2.x, p2.y);
                    return len;
                }
        }
        return 0;
    }
    getPointOnLine(dist, p1x, p1y, p2x, p2y) {
        let fromX = arguments.length > 5 && arguments[5] !== void 0 ? arguments[5] : p1x, fromY = arguments.length > 6 && arguments[6] !== void 0 ? arguments[6] : p1y;
        const m = (p2y - p1y) / (p2x - p1x + PSEUDO_ZERO);
        let run = Math.sqrt(dist * dist / (1 + m * m));
        if (p2x < p1x) {
            run *= -1;
        }
        let rise = m * run;
        let pt = null;
        if (p2x === p1x) {
            pt = {
                x: fromX,
                y: fromY + rise
            };
        } else if ((fromY - p1y) / (fromX - p1x + PSEUDO_ZERO) === m) {
            pt = {
                x: fromX + run,
                y: fromY + rise
            };
        } else {
            let ix = 0;
            let iy = 0;
            const len = this.getLineLength(p1x, p1y, p2x, p2y);
            if (len < PSEUDO_ZERO) {
                return null;
            }
            let u = (fromX - p1x) * (p2x - p1x) + (fromY - p1y) * (p2y - p1y);
            u /= len * len;
            ix = p1x + u * (p2x - p1x);
            iy = p1y + u * (p2y - p1y);
            const pRise = this.getLineLength(fromX, fromY, ix, iy);
            const pRun = Math.sqrt(dist * dist - pRise * pRise);
            run = Math.sqrt(pRun * pRun / (1 + m * m));
            if (p2x < p1x) {
                run *= -1;
            }
            rise = m * run;
            pt = {
                x: ix + run,
                y: iy + rise
            };
        }
        return pt;
    }
    getPointOnPath(distance) {
        const fullLen = this.getPathLength();
        let cumulativePathLength = 0;
        let p = null;
        if (distance < -0.00005 || distance - 0.00005 > fullLen) {
            return null;
        }
        const { dataArray  } = this;
        for (const command of dataArray){
            if (command && (command.pathLength < 0.00005 || cumulativePathLength + command.pathLength + 0.00005 < distance)) {
                cumulativePathLength += command.pathLength;
                continue;
            }
            const delta = distance - cumulativePathLength;
            let currentT = 0;
            switch(command.type){
                case PathParser.LINE_TO:
                    p = this.getPointOnLine(delta, command.start.x, command.start.y, command.points[0], command.points[1], command.start.x, command.start.y);
                    break;
                case PathParser.ARC:
                    {
                        const start = command.points[4];
                        // 4 = theta
                        const dTheta = command.points[5];
                        // 5 = dTheta
                        const end = command.points[4] + dTheta;
                        currentT = start + delta / command.pathLength * dTheta;
                        if (dTheta < 0 && currentT < end || dTheta >= 0 && currentT > end) {
                            break;
                        }
                        p = this.getPointOnEllipticalArc(command.points[0], command.points[1], command.points[2], command.points[3], currentT, command.points[6]);
                        break;
                    }
                case PathParser.CURVE_TO:
                    currentT = delta / command.pathLength;
                    if (currentT > 1) {
                        currentT = 1;
                    }
                    p = this.getPointOnCubicBezier(currentT, command.start.x, command.start.y, command.points[0], command.points[1], command.points[2], command.points[3], command.points[4], command.points[5]);
                    break;
                case PathParser.QUAD_TO:
                    currentT = delta / command.pathLength;
                    if (currentT > 1) {
                        currentT = 1;
                    }
                    p = this.getPointOnQuadraticBezier(currentT, command.start.x, command.start.y, command.points[0], command.points[1], command.points[2], command.points[3]);
                    break;
            }
            if (p) {
                return p;
            }
            break;
        }
        return null;
    }
    getLineLength(x1, y1, x2, y2) {
        return Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));
    }
    getPathLength() {
        if (this.pathLength === -1) {
            this.pathLength = this.dataArray.reduce((length, command)=>command.pathLength > 0 ? length + command.pathLength : length
            , 0);
        }
        return this.pathLength;
    }
    getPointOnCubicBezier(pct, p1x, p1y, p2x, p2y, p3x, p3y, p4x, p4y) {
        const x = p4x * CB1(pct) + p3x * CB2(pct) + p2x * CB3(pct) + p1x * CB4(pct);
        const y = p4y * CB1(pct) + p3y * CB2(pct) + p2y * CB3(pct) + p1y * CB4(pct);
        return {
            x,
            y
        };
    }
    getPointOnQuadraticBezier(pct, p1x, p1y, p2x, p2y, p3x, p3y) {
        const x = p3x * QB1(pct) + p2x * QB2(pct) + p1x * QB3(pct);
        const y = p3y * QB1(pct) + p2y * QB2(pct) + p1y * QB3(pct);
        return {
            x,
            y
        };
    }
    getPointOnEllipticalArc(cx, cy, rx, ry, theta, psi) {
        const cosPsi = Math.cos(psi);
        const sinPsi = Math.sin(psi);
        const pt = {
            x: rx * Math.cos(theta),
            y: ry * Math.sin(theta)
        };
        return {
            x: cx + (pt.x * cosPsi - pt.y * sinPsi),
            y: cy + (pt.x * sinPsi + pt.y * cosPsi)
        };
    }
    // TODO need some optimisations. possibly build cache only for curved segments?
    buildEquidistantCache(inputStep, inputPrecision) {
        const fullLen = this.getPathLength();
        const precision = inputPrecision || 0.25 // accuracy vs performance
        ;
        const step = inputStep || fullLen / 100;
        if (!this.equidistantCache || this.equidistantCache.step !== step || this.equidistantCache.precision !== precision) {
            // Prepare cache
            this.equidistantCache = {
                step,
                precision,
                points: []
            };
            // Calculate points
            let s = 0;
            for(let l = 0; l <= fullLen; l += precision){
                const p0 = this.getPointOnPath(l);
                const p1 = this.getPointOnPath(l + precision);
                if (!p0 || !p1) {
                    continue;
                }
                s += this.getLineLength(p0.x, p0.y, p1.x, p1.y);
                if (s >= step) {
                    this.equidistantCache.points.push({
                        x: p0.x,
                        y: p0.y,
                        distance: l
                    });
                    s -= step;
                }
            }
        }
    }
    getEquidistantPointOnPath(targetDistance, step, precision) {
        this.buildEquidistantCache(step, precision);
        if (targetDistance < 0 || targetDistance - this.getPathLength() > 0.00005) {
            return null;
        }
        const idx = Math.round(targetDistance / this.getPathLength() * (this.equidistantCache.points.length - 1));
        return this.equidistantCache.points[idx] || null;
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'textPath';
        this.textWidth = 0;
        this.textHeight = 0;
        this.pathLength = -1;
        this.glyphInfo = null;
        this.letterSpacingCache = [];
        this.measuresCache = new Map([
            [
                '',
                0
            ]
        ]);
        const pathElement = this.getHrefAttribute().getDefinition();
        this.text = this.getTextFromNode();
        this.dataArray = this.parsePathData(pathElement);
    }
}

// groups: 1: mime-type (+ charset), 2: mime-type (w/o charset), 3: charset, 4: base64?, 5: body
const dataUriRegex = /^\s*data:(([^/,;]+\/[^/,;]+)(?:;([^,;=]+=[^,;=]+))?)?(?:;(base64))?,(.*)$/i;
class ImageElement extends RenderedElement {
    async loadImage(href) {
        try {
            const image = await this.document.createImage(href);
            this.image = image;
        } catch (err) {
            console.error("Error while loading image \"".concat(href, "\":"), err);
        }
        this.loaded = true;
    }
    async loadSvg(href) {
        const match = dataUriRegex.exec(href);
        if (match) {
            const data = match[5];
            if (data) {
                if (match[4] === 'base64') {
                    this.image = atob(data);
                } else {
                    this.image = decodeURIComponent(data);
                }
            }
        } else {
            try {
                const response = await this.document.fetch(href);
                const svg = await response.text();
                this.image = svg;
            } catch (err) {
                console.error("Error while loading image \"".concat(href, "\":"), err);
            }
        }
        this.loaded = true;
    }
    renderChildren(ctx) {
        const { document , image , loaded  } = this;
        const x = this.getAttribute('x').getPixels('x');
        const y = this.getAttribute('y').getPixels('y');
        const width = this.getStyle('width').getPixels('x');
        const height = this.getStyle('height').getPixels('y');
        if (!loaded || !image || !width || !height) {
            return;
        }
        ctx.save();
        ctx.translate(x, y);
        if (typeof image === 'string') {
            const subDocument = document.canvg.forkString(ctx, image, {
                ignoreMouse: true,
                ignoreAnimation: true,
                ignoreDimensions: true,
                ignoreClear: true,
                offsetX: 0,
                offsetY: 0,
                scaleWidth: width,
                scaleHeight: height
            });
            const { documentElement  } = subDocument.document;
            if (documentElement) {
                documentElement.parent = this;
            }
            void subDocument.render();
        } else {
            document.setViewBox({
                ctx,
                aspectRatio: this.getAttribute('preserveAspectRatio').getString(),
                width,
                desiredWidth: image.width,
                height,
                desiredHeight: image.height
            });
            if (this.loaded) {
                if (!('complete' in image) || image.complete) {
                    ctx.drawImage(image, 0, 0);
                }
            }
        }
        ctx.restore();
    }
    getBoundingBox() {
        const x = this.getAttribute('x').getPixels('x');
        const y = this.getAttribute('y').getPixels('y');
        const width = this.getStyle('width').getPixels('x');
        const height = this.getStyle('height').getPixels('y');
        return new BoundingBox(x, y, x + width, y + height);
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'image';
        this.loaded = false;
        const href = this.getHrefAttribute().getString();
        if (!href) {
            return;
        }
        const isSvg = href.endsWith('.svg') || /^\s*data:image\/svg\+xml/i.test(href);
        document.images.push(this);
        if (!isSvg) {
            void this.loadImage(href);
        } else {
            void this.loadSvg(href);
        }
    }
}

class SymbolElement extends RenderedElement {
    render(_) {
    // NO RENDER
    }
    constructor(...args){
        super(...args);
        this.type = 'symbol';
    }
}

class SVGFontLoader {
    async load(fontFamily, url) {
        try {
            const { document  } = this;
            const svgDocument = await document.canvg.parser.load(url);
            const fonts = svgDocument.getElementsByTagName('font');
            Array.from(fonts).forEach((fontNode)=>{
                const font = document.createElement(fontNode);
                document.definitions[fontFamily] = font;
            });
        } catch (err) {
            console.error("Error while loading font \"".concat(url, "\":"), err);
        }
        this.loaded = true;
    }
    constructor(document){
        this.document = document;
        this.loaded = false;
        document.fonts.push(this);
    }
}

class StyleElement extends Element {
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'style';
        const css = compressSpaces(Array.from(node.childNodes)// NEED TEST
        .map((_)=>_.textContent
        ).join('').replace(/(\/\*([^*]|[\r\n]|(\*+([^*/]|[\r\n])))*\*+\/)|(^[\s]*\/\/.*)/gm, '') // remove comments
        .replace(/@import.*;/g, '') // remove imports
        );
        const cssDefs = css.split('}');
        cssDefs.forEach((_1)=>{
            const def = _1.trim();
            if (!def) {
                return;
            }
            const cssParts = def.split('{');
            const cssClasses = cssParts[0].split(',');
            const cssProps = cssParts[1].split(';');
            cssClasses.forEach((_)=>{
                const cssClass = _.trim();
                if (!cssClass) {
                    return;
                }
                const props = document.styles[cssClass] || {};
                cssProps.forEach((cssProp)=>{
                    const prop = cssProp.indexOf(':');
                    const name = cssProp.substr(0, prop).trim();
                    const value = cssProp.substr(prop + 1, cssProp.length - prop).trim();
                    if (name && value) {
                        props[name] = new Property(document, name, value);
                    }
                });
                document.styles[cssClass] = props;
                document.stylesSpecificity[cssClass] = getSelectorSpecificity(cssClass);
                if (cssClass === '@font-face') {
                    const fontFamily = props['font-family'].getString().replace(/"|'/g, '');
                    const srcs = props.src.getString().split(',');
                    srcs.forEach((src)=>{
                        if (src.indexOf('format("svg")') > 0) {
                            const url = parseExternalUrl(src);
                            if (url) {
                                void new SVGFontLoader(document).load(fontFamily, url);
                            }
                        }
                    });
                }
            });
        });
    }
}
StyleElement.parseExternalUrl = parseExternalUrl;

class UseElement extends RenderedElement {
    setContext(ctx) {
        super.setContext(ctx);
        const xAttr = this.getAttribute('x');
        const yAttr = this.getAttribute('y');
        if (xAttr.hasValue()) {
            ctx.translate(xAttr.getPixels('x'), 0);
        }
        if (yAttr.hasValue()) {
            ctx.translate(0, yAttr.getPixels('y'));
        }
    }
    path(ctx) {
        const { element  } = this;
        if (element) {
            element.path(ctx);
        }
    }
    renderChildren(ctx) {
        const { document , element  } = this;
        if (element) {
            let tempSvg = element;
            if (element.type === 'symbol') {
                // render me using a temporary svg element in symbol cases (http://www.w3.org/TR/SVG/struct.html#UseElement)
                tempSvg = new SVGElement(document);
                tempSvg.attributes.viewBox = new Property(document, 'viewBox', element.getAttribute('viewBox').getString());
                tempSvg.attributes.preserveAspectRatio = new Property(document, 'preserveAspectRatio', element.getAttribute('preserveAspectRatio').getString());
                tempSvg.attributes.overflow = new Property(document, 'overflow', element.getAttribute('overflow').getString());
                tempSvg.children = element.children;
                // element is still the parent of the children
                element.styles.opacity = new Property(document, 'opacity', this.calculateOpacity());
            }
            if (tempSvg.type === 'svg') {
                const widthStyle = this.getStyle('width', false, true);
                const heightStyle = this.getStyle('height', false, true);
                // if symbol or svg, inherit width/height from me
                if (widthStyle.hasValue()) {
                    tempSvg.attributes.width = new Property(document, 'width', widthStyle.getString());
                }
                if (heightStyle.hasValue()) {
                    tempSvg.attributes.height = new Property(document, 'height', heightStyle.getString());
                }
            }
            const oldParent = tempSvg.parent;
            tempSvg.parent = this;
            tempSvg.render(ctx);
            tempSvg.parent = oldParent;
        }
    }
    getBoundingBox(ctx) {
        const { element  } = this;
        if (element) {
            return element.getBoundingBox(ctx);
        }
        return null;
    }
    elementTransform() {
        const { document , element  } = this;
        if (!element) {
            return null;
        }
        return Transform.fromElement(document, element);
    }
    get element() {
        if (!this.cachedElement) {
            this.cachedElement = this.getHrefAttribute().getDefinition();
        }
        return this.cachedElement;
    }
    constructor(...args){
        super(...args);
        this.type = 'use';
    }
}

function imGet(img, x, y, width, _height, rgba) {
    return img[y * width * 4 + x * 4 + rgba];
}
function imSet(img, x, y, width, _height, rgba, val) {
    img[y * width * 4 + x * 4 + rgba] = val;
}
function m(matrix, i, v) {
    const mi = matrix[i];
    return mi * v;
}
function c(a, m1, m2, m3) {
    return m1 + Math.cos(a) * m2 + Math.sin(a) * m3;
}
class FeColorMatrixElement extends Element {
    apply(ctx, _x, _y, width, height) {
        // assuming x==0 && y==0 for now
        const { includeOpacity , matrix  } = this;
        const srcData = ctx.getImageData(0, 0, width, height);
        for(let y = 0; y < height; y++){
            for(let x = 0; x < width; x++){
                const r = imGet(srcData.data, x, y, width, height, 0);
                const g = imGet(srcData.data, x, y, width, height, 1);
                const b = imGet(srcData.data, x, y, width, height, 2);
                const a = imGet(srcData.data, x, y, width, height, 3);
                let nr = m(matrix, 0, r) + m(matrix, 1, g) + m(matrix, 2, b) + m(matrix, 3, a) + m(matrix, 4, 1);
                let ng = m(matrix, 5, r) + m(matrix, 6, g) + m(matrix, 7, b) + m(matrix, 8, a) + m(matrix, 9, 1);
                let nb = m(matrix, 10, r) + m(matrix, 11, g) + m(matrix, 12, b) + m(matrix, 13, a) + m(matrix, 14, 1);
                let na = m(matrix, 15, r) + m(matrix, 16, g) + m(matrix, 17, b) + m(matrix, 18, a) + m(matrix, 19, 1);
                if (includeOpacity) {
                    nr = 0;
                    ng = 0;
                    nb = 0;
                    na *= a / 255;
                }
                imSet(srcData.data, x, y, width, height, 0, nr);
                imSet(srcData.data, x, y, width, height, 1, ng);
                imSet(srcData.data, x, y, width, height, 2, nb);
                imSet(srcData.data, x, y, width, height, 3, na);
            }
        }
        ctx.clearRect(0, 0, width, height);
        ctx.putImageData(srcData, 0, 0);
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'feColorMatrix';
        let matrix = toNumbers(this.getAttribute('values').getString());
        switch(this.getAttribute('type').getString('matrix')){
            case 'saturate':
                {
                    const s = matrix[0];
                    /* eslint-disable array-element-newline */ matrix = [
                        0.213 + 0.787 * s,
                        0.715 - 0.715 * s,
                        0.072 - 0.072 * s,
                        0,
                        0,
                        0.213 - 0.213 * s,
                        0.715 + 0.285 * s,
                        0.072 - 0.072 * s,
                        0,
                        0,
                        0.213 - 0.213 * s,
                        0.715 - 0.715 * s,
                        0.072 + 0.928 * s,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1
                    ];
                    break;
                }
            case 'hueRotate':
                {
                    const a = matrix[0] * Math.PI / 180;
                    /* eslint-disable array-element-newline */ matrix = [
                        c(a, 0.213, 0.787, -0.213),
                        c(a, 0.715, -0.715, -0.715),
                        c(a, 0.072, -0.072, 0.928),
                        0,
                        0,
                        c(a, 0.213, -0.213, 0.143),
                        c(a, 0.715, 0.285, 0.14),
                        c(a, 0.072, -0.072, -0.283),
                        0,
                        0,
                        c(a, 0.213, -0.213, -0.787),
                        c(a, 0.715, -0.715, 0.715),
                        c(a, 0.072, 0.928, 0.072),
                        0,
                        0,
                        0,
                        0,
                        0,
                        1,
                        0,
                        0,
                        0,
                        0,
                        0,
                        1
                    ];
                    break;
                }
            case 'luminanceToAlpha':
                /* eslint-disable array-element-newline */ matrix = [
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0.2125,
                    0.7154,
                    0.0721,
                    0,
                    0,
                    0,
                    0,
                    0,
                    0,
                    1
                ];
                break;
        }
        this.matrix = matrix;
        this.includeOpacity = this.getAttribute('includeOpacity').hasValue();
    }
}

class MaskElement extends Element {
    apply(ctx, element) {
        const { document  } = this;
        // render as temp svg
        let x = this.getAttribute('x').getPixels('x');
        let y = this.getAttribute('y').getPixels('y');
        let width = this.getStyle('width').getPixels('x');
        let height = this.getStyle('height').getPixels('y');
        if (!width && !height) {
            const boundingBox = new BoundingBox();
            this.children.forEach((child)=>{
                boundingBox.addBoundingBox(child.getBoundingBox(ctx));
            });
            x = Math.floor(boundingBox.x1);
            y = Math.floor(boundingBox.y1);
            width = Math.floor(boundingBox.width);
            height = Math.floor(boundingBox.height);
        }
        const ignoredStyles = this.removeStyles(element, MaskElement.ignoreStyles);
        const maskCanvas = document.createCanvas(x + width, y + height);
        const maskCtx = maskCanvas.getContext('2d');
        document.screen.setDefaults(maskCtx);
        this.renderChildren(maskCtx);
        // convert mask to alpha with a fake node
        // TODO: refactor out apply from feColorMatrix
        new FeColorMatrixElement(document, {
            nodeType: 1,
            childNodes: [],
            attributes: [
                {
                    nodeName: 'type',
                    value: 'luminanceToAlpha'
                },
                {
                    nodeName: 'includeOpacity',
                    value: 'true'
                }
            ]
        }).apply(maskCtx, 0, 0, x + width, y + height);
        const tmpCanvas = document.createCanvas(x + width, y + height);
        const tmpCtx = tmpCanvas.getContext('2d');
        document.screen.setDefaults(tmpCtx);
        element.render(tmpCtx);
        tmpCtx.globalCompositeOperation = 'destination-in';
        tmpCtx.fillStyle = maskCtx.createPattern(maskCanvas, 'no-repeat');
        tmpCtx.fillRect(0, 0, x + width, y + height);
        ctx.fillStyle = tmpCtx.createPattern(tmpCanvas, 'no-repeat');
        ctx.fillRect(0, 0, x + width, y + height);
        // reassign mask
        this.restoreStyles(element, ignoredStyles);
    }
    render(_) {
    // NO RENDER
    }
    constructor(...args){
        super(...args);
        this.type = 'mask';
    }
}
MaskElement.ignoreStyles = [
    'mask',
    'transform',
    'clip-path'
];

const noop = ()=>{
// NOOP
};
class ClipPathElement extends Element {
    apply(ctx) {
        const { document  } = this;
        const contextProto = Reflect.getPrototypeOf(ctx);
        const { beginPath , closePath  } = ctx;
        if (contextProto) {
            contextProto.beginPath = noop;
            contextProto.closePath = noop;
        }
        Reflect.apply(beginPath, ctx, []);
        this.children.forEach((child)=>{
            if (!('path' in child)) {
                return;
            }
            let transform = 'elementTransform' in child ? child.elementTransform() : null // handle <use />
            ;
            if (!transform) {
                transform = Transform.fromElement(document, child);
            }
            if (transform) {
                transform.apply(ctx);
            }
            child.path(ctx);
            if (contextProto) {
                contextProto.closePath = closePath;
            }
            if (transform) {
                transform.unapply(ctx);
            }
        });
        Reflect.apply(closePath, ctx, []);
        ctx.clip();
        if (contextProto) {
            contextProto.beginPath = beginPath;
            contextProto.closePath = closePath;
        }
    }
    render(_) {
    // NO RENDER
    }
    constructor(...args){
        super(...args);
        this.type = 'clipPath';
    }
}

class FilterElement extends Element {
    apply(ctx, element) {
        // render as temp svg
        const { document , children  } = this;
        const boundingBox = 'getBoundingBox' in element ? element.getBoundingBox(ctx) : null;
        if (!boundingBox) {
            return;
        }
        let px = 0;
        let py = 0;
        children.forEach((child)=>{
            const efd = child.extraFilterDistance || 0;
            px = Math.max(px, efd);
            py = Math.max(py, efd);
        });
        const width = Math.floor(boundingBox.width);
        const height = Math.floor(boundingBox.height);
        const tmpCanvasWidth = width + 2 * px;
        const tmpCanvasHeight = height + 2 * py;
        if (tmpCanvasWidth < 1 || tmpCanvasHeight < 1) {
            return;
        }
        const x = Math.floor(boundingBox.x);
        const y = Math.floor(boundingBox.y);
        const ignoredStyles = this.removeStyles(element, FilterElement.ignoreStyles);
        const tmpCanvas = document.createCanvas(tmpCanvasWidth, tmpCanvasHeight);
        const tmpCtx = tmpCanvas.getContext('2d');
        document.screen.setDefaults(tmpCtx);
        tmpCtx.translate(-x + px, -y + py);
        element.render(tmpCtx);
        // apply filters
        children.forEach((child)=>{
            if (typeof child.apply === 'function') {
                child.apply(tmpCtx, 0, 0, tmpCanvasWidth, tmpCanvasHeight);
            }
        });
        // render on me
        ctx.drawImage(tmpCanvas, 0, 0, tmpCanvasWidth, tmpCanvasHeight, x - px, y - py, tmpCanvasWidth, tmpCanvasHeight);
        this.restoreStyles(element, ignoredStyles);
    }
    render(_) {
    // NO RENDER
    }
    constructor(...args){
        super(...args);
        this.type = 'filter';
    }
}
FilterElement.ignoreStyles = [
    'filter',
    'transform',
    'clip-path'
];

class FeDropShadowElement extends Element {
    apply(_, _x, _y, _width, _height) {
    // TODO: implement
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'feDropShadow';
        this.addStylesFromStyleDefinition();
    }
}

class FeMorphologyElement extends Element {
    apply(_, _x, _y, _width, _height) {
    // TODO: implement
    }
    constructor(...args){
        super(...args);
        this.type = 'feMorphology';
    }
}

class FeCompositeElement extends Element {
    apply(_, _x, _y, _width, _height) {
    // TODO: implement
    }
    constructor(...args){
        super(...args);
        this.type = 'feComposite';
    }
}

class FeGaussianBlurElement extends Element {
    apply(ctx, x, y, width, height) {
        const { document , blurRadius  } = this;
        const body = document.window ? document.window.document.body : null;
        const canvas = ctx.canvas;
        // StackBlur requires canvas be on document
        canvas.id = document.getUniqueId();
        if (body) {
            canvas.style.display = 'none';
            body.appendChild(canvas);
        }
        stackblurCanvas.canvasRGBA(canvas, x, y, width, height, blurRadius);
        if (body) {
            body.removeChild(canvas);
        }
    }
    constructor(document, node, captureTextNodes){
        super(document, node, captureTextNodes);
        this.type = 'feGaussianBlur';
        this.blurRadius = Math.floor(this.getAttribute('stdDeviation').getNumber());
        this.extraFilterDistance = this.blurRadius;
    }
}

class TitleElement extends Element {
    constructor(...args){
        super(...args);
        this.type = 'title';
    }
}

class DescElement extends Element {
    constructor(...args){
        super(...args);
        this.type = 'desc';
    }
}

const elements = {
    'svg': SVGElement,
    'rect': RectElement,
    'circle': CircleElement,
    'ellipse': EllipseElement,
    'line': LineElement,
    'polyline': PolylineElement,
    'polygon': PolygonElement,
    'path': PathElement,
    'pattern': PatternElement,
    'marker': MarkerElement,
    'defs': DefsElement,
    'linearGradient': LinearGradientElement,
    'radialGradient': RadialGradientElement,
    'stop': StopElement,
    'animate': AnimateElement,
    'animateColor': AnimateColorElement,
    'animateTransform': AnimateTransformElement,
    'font': FontElement,
    'font-face': FontFaceElement,
    'missing-glyph': MissingGlyphElement,
    'glyph': GlyphElement,
    'text': TextElement,
    'tspan': TSpanElement,
    'tref': TRefElement,
    'a': AElement,
    'textPath': TextPathElement,
    'image': ImageElement,
    'g': GElement,
    'symbol': SymbolElement,
    'style': StyleElement,
    'use': UseElement,
    'mask': MaskElement,
    'clipPath': ClipPathElement,
    'filter': FilterElement,
    'feDropShadow': FeDropShadowElement,
    'feMorphology': FeMorphologyElement,
    'feComposite': FeCompositeElement,
    'feColorMatrix': FeColorMatrixElement,
    'feGaussianBlur': FeGaussianBlurElement,
    'title': TitleElement,
    'desc': DescElement
};

function createCanvas(width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
}
async function createImage(src) {
    let anonymousCrossOrigin = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    const image = document.createElement('img');
    if (anonymousCrossOrigin) {
        image.crossOrigin = 'Anonymous';
    }
    return new Promise((resolve, reject)=>{
        image.onload = ()=>{
            resolve(image);
        };
        image.onerror = (_event, _source, _lineno, _colno, error)=>{
            reject(error);
        };
        image.src = src;
    });
}
const DEFAULT_EM_SIZE = 12;
class Document {
    bindCreateImage(createImage1, anonymousCrossOrigin) {
        if (typeof anonymousCrossOrigin === 'boolean') {
            return (source, forceAnonymousCrossOrigin)=>createImage1(source, typeof forceAnonymousCrossOrigin === 'boolean' ? forceAnonymousCrossOrigin : anonymousCrossOrigin)
            ;
        }
        return createImage1;
    }
    get window() {
        return this.screen.window;
    }
    get fetch() {
        return this.screen.fetch;
    }
    get ctx() {
        return this.screen.ctx;
    }
    get emSize() {
        const { emSizeStack  } = this;
        return emSizeStack[emSizeStack.length - 1] || DEFAULT_EM_SIZE;
    }
    set emSize(value) {
        const { emSizeStack  } = this;
        emSizeStack.push(value);
    }
    popEmSize() {
        const { emSizeStack  } = this;
        emSizeStack.pop();
    }
    getUniqueId() {
        return "canvg".concat(++this.uniqueId);
    }
    isImagesLoaded() {
        return this.images.every((_)=>_.loaded
        );
    }
    isFontsLoaded() {
        return this.fonts.every((_)=>_.loaded
        );
    }
    createDocumentElement(document) {
        const documentElement = this.createElement(document.documentElement);
        documentElement.root = true;
        documentElement.addStylesFromStyleDefinition();
        this.documentElement = documentElement;
        return documentElement;
    }
    createElement(node) {
        const elementType = node.nodeName.replace(/^[^:]+:/, '');
        const ElementType = Document.elementTypes[elementType];
        if (ElementType) {
            return new ElementType(this, node);
        }
        return new UnknownElement(this, node);
    }
    createTextNode(node) {
        return new TextNode(this, node);
    }
    setViewBox(config) {
        this.screen.setViewBox({
            document: this,
            ...config
        });
    }
    constructor(canvg, { rootEmSize =DEFAULT_EM_SIZE , emSize =DEFAULT_EM_SIZE , createCanvas: createCanvas1 = Document.createCanvas , createImage: createImage2 = Document.createImage , anonymousCrossOrigin  } = {}){
        this.canvg = canvg;
        this.definitions = {};
        this.styles = {};
        this.stylesSpecificity = {};
        this.images = [];
        this.fonts = [];
        this.emSizeStack = [];
        this.uniqueId = 0;
        this.screen = canvg.screen;
        this.rootEmSize = rootEmSize;
        this.emSize = emSize;
        this.createCanvas = createCanvas1;
        this.createImage = this.bindCreateImage(createImage2, anonymousCrossOrigin);
        this.screen.wait(()=>this.isImagesLoaded()
        );
        this.screen.wait(()=>this.isFontsLoaded()
        );
    }
}
Document.createCanvas = createCanvas;
Document.createImage = createImage;
Document.elementTypes = elements;

/**
 * SVG renderer on canvas.
 */ class Canvg {
    /**
   * Create Canvg instance from SVG source string or URL.
   * @param ctx - Rendering context.
   * @param svg - SVG source string or URL.
   * @param options - Rendering options.
   * @returns Canvg instance.
   */ static async from(ctx, svg) {
        let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        const parser = new Parser(options);
        const svgDocument = await parser.parse(svg);
        return new Canvg(ctx, svgDocument, options);
    }
    /**
   * Create Canvg instance from SVG source string.
   * @param ctx - Rendering context.
   * @param svg - SVG source string.
   * @param options - Rendering options.
   * @returns Canvg instance.
   */ static fromString(ctx, svg) {
        let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        const parser = new Parser(options);
        const svgDocument = parser.parseFromString(svg);
        return new Canvg(ctx, svgDocument, options);
    }
    /**
   * Create new Canvg instance with inherited options.
   * @param ctx - Rendering context.
   * @param svg - SVG source string or URL.
   * @param options - Rendering options.
   * @returns Canvg instance.
   */ fork(ctx, svg) {
        let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        return Canvg.from(ctx, svg, {
            ...this.options,
            ...options
        });
    }
    /**
   * Create new Canvg instance with inherited options.
   * @param ctx - Rendering context.
   * @param svg - SVG source string.
   * @param options - Rendering options.
   * @returns Canvg instance.
   */ forkString(ctx, svg) {
        let options = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
        return Canvg.fromString(ctx, svg, {
            ...this.options,
            ...options
        });
    }
    /**
   * Document is ready promise.
   * @returns Ready promise.
   */ ready() {
        return this.screen.ready();
    }
    /**
   * Document is ready value.
   * @returns Is ready or not.
   */ isReady() {
        return this.screen.isReady();
    }
    /**
   * Render only first frame, ignoring animations and mouse.
   * @param options - Rendering options.
   */ async render() {
        let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        this.start({
            enableRedraw: true,
            ignoreAnimation: true,
            ignoreMouse: true,
            ...options
        });
        await this.ready();
        this.stop();
    }
    /**
   * Start rendering.
   * @param options - Render options.
   */ start() {
        let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
        const { documentElement , screen , options: baseOptions  } = this;
        screen.start(documentElement, {
            enableRedraw: true,
            ...baseOptions,
            ...options
        });
    }
    /**
   * Stop rendering.
   */ stop() {
        this.screen.stop();
    }
    /**
   * Resize SVG to fit in given size.
   * @param width
   * @param height
   * @param preserveAspectRatio
   */ resize(width) {
        let height = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : width, preserveAspectRatio = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
        this.documentElement.resize(width, height, preserveAspectRatio);
    }
    /**
   * Main constructor.
   * @param ctx - Rendering context.
   * @param svg - SVG Document.
   * @param options - Rendering options.
   */ constructor(ctx, svg, options = {}){
        this.parser = new Parser(options);
        this.screen = new Screen(ctx, options);
        this.options = options;
        const document = new Document(this, options);
        const documentElement = document.createDocumentElement(svg);
        this.document = document;
        this.documentElement = documentElement;
    }
}

exports.AElement = AElement;
exports.AnimateColorElement = AnimateColorElement;
exports.AnimateElement = AnimateElement;
exports.AnimateTransformElement = AnimateTransformElement;
exports.BoundingBox = BoundingBox;
exports.CB1 = CB1;
exports.CB2 = CB2;
exports.CB3 = CB3;
exports.CB4 = CB4;
exports.Canvg = Canvg;
exports.CircleElement = CircleElement;
exports.ClipPathElement = ClipPathElement;
exports.DefsElement = DefsElement;
exports.DescElement = DescElement;
exports.Document = Document;
exports.Element = Element;
exports.EllipseElement = EllipseElement;
exports.FeColorMatrixElement = FeColorMatrixElement;
exports.FeCompositeElement = FeCompositeElement;
exports.FeDropShadowElement = FeDropShadowElement;
exports.FeGaussianBlurElement = FeGaussianBlurElement;
exports.FeMorphologyElement = FeMorphologyElement;
exports.FilterElement = FilterElement;
exports.Font = Font;
exports.FontElement = FontElement;
exports.FontFaceElement = FontFaceElement;
exports.GElement = GElement;
exports.GlyphElement = GlyphElement;
exports.GradientElement = GradientElement;
exports.ImageElement = ImageElement;
exports.LineElement = LineElement;
exports.LinearGradientElement = LinearGradientElement;
exports.MarkerElement = MarkerElement;
exports.MaskElement = MaskElement;
exports.Matrix = Matrix;
exports.MissingGlyphElement = MissingGlyphElement;
exports.Mouse = Mouse;
exports.PSEUDO_ZERO = PSEUDO_ZERO;
exports.Parser = Parser;
exports.PathElement = PathElement;
exports.PathParser = PathParser;
exports.PatternElement = PatternElement;
exports.Point = Point;
exports.PolygonElement = PolygonElement;
exports.PolylineElement = PolylineElement;
exports.Property = Property;
exports.QB1 = QB1;
exports.QB2 = QB2;
exports.QB3 = QB3;
exports.RadialGradientElement = RadialGradientElement;
exports.RectElement = RectElement;
exports.RenderedElement = RenderedElement;
exports.Rotate = Rotate;
exports.SVGElement = SVGElement;
exports.SVGFontLoader = SVGFontLoader;
exports.Scale = Scale;
exports.Screen = Screen;
exports.Skew = Skew;
exports.SkewX = SkewX;
exports.SkewY = SkewY;
exports.StopElement = StopElement;
exports.StyleElement = StyleElement;
exports.SymbolElement = SymbolElement;
exports.TRefElement = TRefElement;
exports.TSpanElement = TSpanElement;
exports.TextElement = TextElement;
exports.TextPathElement = TextPathElement;
exports.TitleElement = TitleElement;
exports.Transform = Transform;
exports.Translate = Translate;
exports.UnknownElement = UnknownElement;
exports.UseElement = UseElement;
exports.ViewPort = ViewPort;
exports.compressSpaces = compressSpaces;
exports.elements = elements;
exports.getSelectorSpecificity = getSelectorSpecificity;
exports.normalizeAttributeName = normalizeAttributeName;
exports.normalizeColor = normalizeColor;
exports.parseExternalUrl = parseExternalUrl;
exports.presets = index;
exports.toMatrixValue = toMatrixValue;
exports.toNumbers = toNumbers;
exports.trimLeft = trimLeft;
exports.trimRight = trimRight;
exports.vectorMagnitude = vectorMagnitude;
exports.vectorsAngle = vectorsAngle;
exports.vectorsRatio = vectorsRatio;
//# sourceMappingURL=index.cjs.map


/***/ }),

/***/ "./node_modules/svg-pathdata/lib/SVGPathData.cjs":
/*!*******************************************************!*\
  !*** ./node_modules/svg-pathdata/lib/SVGPathData.cjs ***!
  \*******************************************************/
/***/ (function(__unused_webpack_module, exports) {

!function(t,r){ true?r(exports):0}(this,(function(t){"use strict";
/*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */var r=function(t,e){return(r=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(t,r){t.__proto__=r}||function(t,r){for(var e in r)Object.prototype.hasOwnProperty.call(r,e)&&(t[e]=r[e])})(t,e)};function e(t,e){if("function"!=typeof e&&null!==e)throw new TypeError("Class extends value "+String(e)+" is not a constructor or null");function a(){this.constructor=t}r(t,e),t.prototype=null===e?Object.create(e):(a.prototype=e.prototype,new a)}var a=" ";function i(t){var r="";Array.isArray(t)||(t=[t]);for(var e=0;e<t.length;e++){var i=t[e];if(i.type===N.CLOSE_PATH)r+="z";else if(i.type===N.HORIZ_LINE_TO)r+=(i.relative?"h":"H")+i.x;else if(i.type===N.VERT_LINE_TO)r+=(i.relative?"v":"V")+i.y;else if(i.type===N.MOVE_TO)r+=(i.relative?"m":"M")+i.x+a+i.y;else if(i.type===N.LINE_TO)r+=(i.relative?"l":"L")+i.x+a+i.y;else if(i.type===N.CURVE_TO)r+=(i.relative?"c":"C")+i.x1+a+i.y1+a+i.x2+a+i.y2+a+i.x+a+i.y;else if(i.type===N.SMOOTH_CURVE_TO)r+=(i.relative?"s":"S")+i.x2+a+i.y2+a+i.x+a+i.y;else if(i.type===N.QUAD_TO)r+=(i.relative?"q":"Q")+i.x1+a+i.y1+a+i.x+a+i.y;else if(i.type===N.SMOOTH_QUAD_TO)r+=(i.relative?"t":"T")+i.x+a+i.y;else{if(i.type!==N.ARC)throw new Error('Unexpected command type "'+i.type+'" at index '+e+".");r+=(i.relative?"a":"A")+i.rX+a+i.rY+a+i.xRot+a+ +i.lArcFlag+a+ +i.sweepFlag+a+i.x+a+i.y}}return r}function n(t,r){var e=t[0],a=t[1];return[e*Math.cos(r)-a*Math.sin(r),e*Math.sin(r)+a*Math.cos(r)]}function o(){for(var t=[],r=0;r<arguments.length;r++)t[r]=arguments[r];for(var e=0;e<t.length;e++)if("number"!=typeof t[e])throw new Error("assertNumbers arguments["+e+"] is not a number. "+typeof t[e]+" == typeof "+t[e]);return!0}var s=Math.PI;function u(t,r,e){t.lArcFlag=0===t.lArcFlag?0:1,t.sweepFlag=0===t.sweepFlag?0:1;var a=t.rX,i=t.rY,o=t.x,u=t.y;a=Math.abs(t.rX),i=Math.abs(t.rY);var h=n([(r-o)/2,(e-u)/2],-t.xRot/180*s),c=h[0],m=h[1],y=Math.pow(c,2)/Math.pow(a,2)+Math.pow(m,2)/Math.pow(i,2);1<y&&(a*=Math.sqrt(y),i*=Math.sqrt(y)),t.rX=a,t.rY=i;var p=Math.pow(a,2)*Math.pow(m,2)+Math.pow(i,2)*Math.pow(c,2),f=(t.lArcFlag!==t.sweepFlag?1:-1)*Math.sqrt(Math.max(0,(Math.pow(a,2)*Math.pow(i,2)-p)/p)),T=a*m/i*f,O=-i*c/a*f,l=n([T,O],t.xRot/180*s);t.cX=l[0]+(r+o)/2,t.cY=l[1]+(e+u)/2,t.phi1=Math.atan2((m-O)/i,(c-T)/a),t.phi2=Math.atan2((-m-O)/i,(-c-T)/a),0===t.sweepFlag&&t.phi2>t.phi1&&(t.phi2-=2*s),1===t.sweepFlag&&t.phi2<t.phi1&&(t.phi2+=2*s),t.phi1*=180/s,t.phi2*=180/s}function h(t,r,e){o(t,r,e);var a=t*t+r*r-e*e;if(0>a)return[];if(0===a)return[[t*e/(t*t+r*r),r*e/(t*t+r*r)]];var i=Math.sqrt(a);return[[(t*e+r*i)/(t*t+r*r),(r*e-t*i)/(t*t+r*r)],[(t*e-r*i)/(t*t+r*r),(r*e+t*i)/(t*t+r*r)]]}var c=Math.PI/180;function m(t,r,e){return(1-e)*t+e*r}function y(t,r,e,a){return t+Math.cos(a/180*s)*r+Math.sin(a/180*s)*e}function p(t,r,e,a){var i=1e-6,n=r-t,o=e-r,s=3*n+3*(a-e)-6*o,u=6*(o-n),h=3*n;return Math.abs(s)<i?[-h/u]:function(t,r,e){void 0===e&&(e=1e-6);var a=t*t/4-r;if(a<-e)return[];if(a<=e)return[-t/2];var i=Math.sqrt(a);return[-t/2-i,-t/2+i]}(u/s,h/s,i)}function f(t,r,e,a,i){var n=1-i;return t*(n*n*n)+r*(3*n*n*i)+e*(3*n*i*i)+a*(i*i*i)}t.SVGPathDataTransformer=void 0,function(t){function r(){return i((function(t,r,e){return t.relative&&(void 0!==t.x1&&(t.x1+=r),void 0!==t.y1&&(t.y1+=e),void 0!==t.x2&&(t.x2+=r),void 0!==t.y2&&(t.y2+=e),void 0!==t.x&&(t.x+=r),void 0!==t.y&&(t.y+=e),t.relative=!1),t}))}function e(){var t=NaN,r=NaN,e=NaN,a=NaN;return i((function(i,n,o){return i.type&N.SMOOTH_CURVE_TO&&(i.type=N.CURVE_TO,t=isNaN(t)?n:t,r=isNaN(r)?o:r,i.x1=i.relative?n-t:2*n-t,i.y1=i.relative?o-r:2*o-r),i.type&N.CURVE_TO?(t=i.relative?n+i.x2:i.x2,r=i.relative?o+i.y2:i.y2):(t=NaN,r=NaN),i.type&N.SMOOTH_QUAD_TO&&(i.type=N.QUAD_TO,e=isNaN(e)?n:e,a=isNaN(a)?o:a,i.x1=i.relative?n-e:2*n-e,i.y1=i.relative?o-a:2*o-a),i.type&N.QUAD_TO?(e=i.relative?n+i.x1:i.x1,a=i.relative?o+i.y1:i.y1):(e=NaN,a=NaN),i}))}function a(){var t=NaN,r=NaN;return i((function(e,a,i){if(e.type&N.SMOOTH_QUAD_TO&&(e.type=N.QUAD_TO,t=isNaN(t)?a:t,r=isNaN(r)?i:r,e.x1=e.relative?a-t:2*a-t,e.y1=e.relative?i-r:2*i-r),e.type&N.QUAD_TO){t=e.relative?a+e.x1:e.x1,r=e.relative?i+e.y1:e.y1;var n=e.x1,o=e.y1;e.type=N.CURVE_TO,e.x1=((e.relative?0:a)+2*n)/3,e.y1=((e.relative?0:i)+2*o)/3,e.x2=(e.x+2*n)/3,e.y2=(e.y+2*o)/3}else t=NaN,r=NaN;return e}))}function i(t){var r=0,e=0,a=NaN,i=NaN;return function(n){if(isNaN(a)&&!(n.type&N.MOVE_TO))throw new Error("path must start with moveto");var o=t(n,r,e,a,i);return n.type&N.CLOSE_PATH&&(r=a,e=i),void 0!==n.x&&(r=n.relative?r+n.x:n.x),void 0!==n.y&&(e=n.relative?e+n.y:n.y),n.type&N.MOVE_TO&&(a=r,i=e),o}}function s(t,r,e,a,n,s){return o(t,r,e,a,n,s),i((function(i,o,u,h){var c=i.x1,m=i.x2,y=i.relative&&!isNaN(h),p=void 0!==i.x?i.x:y?0:o,f=void 0!==i.y?i.y:y?0:u;function T(t){return t*t}i.type&N.HORIZ_LINE_TO&&0!==r&&(i.type=N.LINE_TO,i.y=i.relative?0:u),i.type&N.VERT_LINE_TO&&0!==e&&(i.type=N.LINE_TO,i.x=i.relative?0:o),void 0!==i.x&&(i.x=i.x*t+f*e+(y?0:n)),void 0!==i.y&&(i.y=p*r+i.y*a+(y?0:s)),void 0!==i.x1&&(i.x1=i.x1*t+i.y1*e+(y?0:n)),void 0!==i.y1&&(i.y1=c*r+i.y1*a+(y?0:s)),void 0!==i.x2&&(i.x2=i.x2*t+i.y2*e+(y?0:n)),void 0!==i.y2&&(i.y2=m*r+i.y2*a+(y?0:s));var O=t*a-r*e;if(void 0!==i.xRot&&(1!==t||0!==r||0!==e||1!==a))if(0===O)delete i.rX,delete i.rY,delete i.xRot,delete i.lArcFlag,delete i.sweepFlag,i.type=N.LINE_TO;else{var l=i.xRot*Math.PI/180,v=Math.sin(l),_=Math.cos(l),d=1/T(i.rX),x=1/T(i.rY),A=T(_)*d+T(v)*x,E=2*v*_*(d-x),C=T(v)*d+T(_)*x,M=A*a*a-E*r*a+C*r*r,R=E*(t*a+r*e)-2*(A*e*a+C*t*r),S=A*e*e-E*t*e+C*t*t,g=(Math.atan2(R,M-S)+Math.PI)%Math.PI/2,I=Math.sin(g),V=Math.cos(g);i.rX=Math.abs(O)/Math.sqrt(M*T(V)+R*I*V+S*T(I)),i.rY=Math.abs(O)/Math.sqrt(M*T(I)-R*I*V+S*T(V)),i.xRot=180*g/Math.PI}return void 0!==i.sweepFlag&&0>O&&(i.sweepFlag=+!i.sweepFlag),i}))}function T(){return function(t){var r={};for(var e in t)r[e]=t[e];return r}}t.ROUND=function(t){function r(r){return Math.round(r*t)/t}return void 0===t&&(t=1e13),o(t),function(t){return void 0!==t.x1&&(t.x1=r(t.x1)),void 0!==t.y1&&(t.y1=r(t.y1)),void 0!==t.x2&&(t.x2=r(t.x2)),void 0!==t.y2&&(t.y2=r(t.y2)),void 0!==t.x&&(t.x=r(t.x)),void 0!==t.y&&(t.y=r(t.y)),void 0!==t.rX&&(t.rX=r(t.rX)),void 0!==t.rY&&(t.rY=r(t.rY)),t}},t.TO_ABS=r,t.TO_REL=function(){return i((function(t,r,e){return t.relative||(void 0!==t.x1&&(t.x1-=r),void 0!==t.y1&&(t.y1-=e),void 0!==t.x2&&(t.x2-=r),void 0!==t.y2&&(t.y2-=e),void 0!==t.x&&(t.x-=r),void 0!==t.y&&(t.y-=e),t.relative=!0),t}))},t.NORMALIZE_HVZ=function(t,r,e){return void 0===t&&(t=!0),void 0===r&&(r=!0),void 0===e&&(e=!0),i((function(a,i,n,o,s){if(isNaN(o)&&!(a.type&N.MOVE_TO))throw new Error("path must start with moveto");return r&&a.type&N.HORIZ_LINE_TO&&(a.type=N.LINE_TO,a.y=a.relative?0:n),e&&a.type&N.VERT_LINE_TO&&(a.type=N.LINE_TO,a.x=a.relative?0:i),t&&a.type&N.CLOSE_PATH&&(a.type=N.LINE_TO,a.x=a.relative?o-i:o,a.y=a.relative?s-n:s),a.type&N.ARC&&(0===a.rX||0===a.rY)&&(a.type=N.LINE_TO,delete a.rX,delete a.rY,delete a.xRot,delete a.lArcFlag,delete a.sweepFlag),a}))},t.NORMALIZE_ST=e,t.QT_TO_C=a,t.INFO=i,t.SANITIZE=function(t){void 0===t&&(t=0),o(t);var r=NaN,e=NaN,a=NaN,n=NaN;return i((function(i,o,s,u,h){var c=Math.abs,m=!1,y=0,p=0;if(i.type&N.SMOOTH_CURVE_TO&&(y=isNaN(r)?0:o-r,p=isNaN(e)?0:s-e),i.type&(N.CURVE_TO|N.SMOOTH_CURVE_TO)?(r=i.relative?o+i.x2:i.x2,e=i.relative?s+i.y2:i.y2):(r=NaN,e=NaN),i.type&N.SMOOTH_QUAD_TO?(a=isNaN(a)?o:2*o-a,n=isNaN(n)?s:2*s-n):i.type&N.QUAD_TO?(a=i.relative?o+i.x1:i.x1,n=i.relative?s+i.y1:i.y2):(a=NaN,n=NaN),i.type&N.LINE_COMMANDS||i.type&N.ARC&&(0===i.rX||0===i.rY||!i.lArcFlag)||i.type&N.CURVE_TO||i.type&N.SMOOTH_CURVE_TO||i.type&N.QUAD_TO||i.type&N.SMOOTH_QUAD_TO){var f=void 0===i.x?0:i.relative?i.x:i.x-o,T=void 0===i.y?0:i.relative?i.y:i.y-s;y=isNaN(a)?void 0===i.x1?y:i.relative?i.x:i.x1-o:a-o,p=isNaN(n)?void 0===i.y1?p:i.relative?i.y:i.y1-s:n-s;var O=void 0===i.x2?0:i.relative?i.x:i.x2-o,l=void 0===i.y2?0:i.relative?i.y:i.y2-s;c(f)<=t&&c(T)<=t&&c(y)<=t&&c(p)<=t&&c(O)<=t&&c(l)<=t&&(m=!0)}return i.type&N.CLOSE_PATH&&c(o-u)<=t&&c(s-h)<=t&&(m=!0),m?[]:i}))},t.MATRIX=s,t.ROTATE=function(t,r,e){void 0===r&&(r=0),void 0===e&&(e=0),o(t,r,e);var a=Math.sin(t),i=Math.cos(t);return s(i,a,-a,i,r-r*i+e*a,e-r*a-e*i)},t.TRANSLATE=function(t,r){return void 0===r&&(r=0),o(t,r),s(1,0,0,1,t,r)},t.SCALE=function(t,r){return void 0===r&&(r=t),o(t,r),s(t,0,0,r,0,0)},t.SKEW_X=function(t){return o(t),s(1,0,Math.atan(t),1,0,0)},t.SKEW_Y=function(t){return o(t),s(1,Math.atan(t),0,1,0,0)},t.X_AXIS_SYMMETRY=function(t){return void 0===t&&(t=0),o(t),s(-1,0,0,1,t,0)},t.Y_AXIS_SYMMETRY=function(t){return void 0===t&&(t=0),o(t),s(1,0,0,-1,0,t)},t.A_TO_C=function(){return i((function(t,r,e){return N.ARC===t.type?function(t,r,e){var a,i,o,s;t.cX||u(t,r,e);for(var h=Math.min(t.phi1,t.phi2),y=Math.max(t.phi1,t.phi2)-h,p=Math.ceil(y/90),f=new Array(p),T=r,O=e,l=0;l<p;l++){var v=m(t.phi1,t.phi2,l/p),_=m(t.phi1,t.phi2,(l+1)/p),d=_-v,x=4/3*Math.tan(d*c/4),A=[Math.cos(v*c)-x*Math.sin(v*c),Math.sin(v*c)+x*Math.cos(v*c)],E=A[0],C=A[1],M=[Math.cos(_*c),Math.sin(_*c)],R=M[0],S=M[1],g=[R+x*Math.sin(_*c),S-x*Math.cos(_*c)],I=g[0],V=g[1];f[l]={relative:t.relative,type:N.CURVE_TO};var D=function(r,e){var a=n([r*t.rX,e*t.rY],t.xRot),i=a[0],o=a[1];return[t.cX+i,t.cY+o]};a=D(E,C),f[l].x1=a[0],f[l].y1=a[1],i=D(I,V),f[l].x2=i[0],f[l].y2=i[1],o=D(R,S),f[l].x=o[0],f[l].y=o[1],t.relative&&(f[l].x1-=T,f[l].y1-=O,f[l].x2-=T,f[l].y2-=O,f[l].x-=T,f[l].y-=O),T=(s=[f[l].x,f[l].y])[0],O=s[1]}return f}(t,t.relative?0:r,t.relative?0:e):t}))},t.ANNOTATE_ARCS=function(){return i((function(t,r,e){return t.relative&&(r=0,e=0),N.ARC===t.type&&u(t,r,e),t}))},t.CLONE=T,t.CALCULATE_BOUNDS=function(){var t=function(t){var r={};for(var e in t)r[e]=t[e];return r},n=r(),o=a(),s=e(),c=i((function(r,e,a){var i=s(o(n(t(r))));function m(t){t>c.maxX&&(c.maxX=t),t<c.minX&&(c.minX=t)}function T(t){t>c.maxY&&(c.maxY=t),t<c.minY&&(c.minY=t)}if(i.type&N.DRAWING_COMMANDS&&(m(e),T(a)),i.type&N.HORIZ_LINE_TO&&m(i.x),i.type&N.VERT_LINE_TO&&T(i.y),i.type&N.LINE_TO&&(m(i.x),T(i.y)),i.type&N.CURVE_TO){m(i.x),T(i.y);for(var O=0,l=p(e,i.x1,i.x2,i.x);O<l.length;O++){0<(H=l[O])&&1>H&&m(f(e,i.x1,i.x2,i.x,H))}for(var v=0,_=p(a,i.y1,i.y2,i.y);v<_.length;v++){0<(H=_[v])&&1>H&&T(f(a,i.y1,i.y2,i.y,H))}}if(i.type&N.ARC){m(i.x),T(i.y),u(i,e,a);for(var d=i.xRot/180*Math.PI,x=Math.cos(d)*i.rX,A=Math.sin(d)*i.rX,E=-Math.sin(d)*i.rY,C=Math.cos(d)*i.rY,M=i.phi1<i.phi2?[i.phi1,i.phi2]:-180>i.phi2?[i.phi2+360,i.phi1+360]:[i.phi2,i.phi1],R=M[0],S=M[1],g=function(t){var r=t[0],e=t[1],a=180*Math.atan2(e,r)/Math.PI;return a<R?a+360:a},I=0,V=h(E,-x,0).map(g);I<V.length;I++){(H=V[I])>R&&H<S&&m(y(i.cX,x,E,H))}for(var D=0,L=h(C,-A,0).map(g);D<L.length;D++){var H;(H=L[D])>R&&H<S&&T(y(i.cY,A,C,H))}}return r}));return c.minX=1/0,c.maxX=-1/0,c.minY=1/0,c.maxY=-1/0,c}}(t.SVGPathDataTransformer||(t.SVGPathDataTransformer={}));var T,O=function(){function r(){}return r.prototype.round=function(r){return this.transform(t.SVGPathDataTransformer.ROUND(r))},r.prototype.toAbs=function(){return this.transform(t.SVGPathDataTransformer.TO_ABS())},r.prototype.toRel=function(){return this.transform(t.SVGPathDataTransformer.TO_REL())},r.prototype.normalizeHVZ=function(r,e,a){return this.transform(t.SVGPathDataTransformer.NORMALIZE_HVZ(r,e,a))},r.prototype.normalizeST=function(){return this.transform(t.SVGPathDataTransformer.NORMALIZE_ST())},r.prototype.qtToC=function(){return this.transform(t.SVGPathDataTransformer.QT_TO_C())},r.prototype.aToC=function(){return this.transform(t.SVGPathDataTransformer.A_TO_C())},r.prototype.sanitize=function(r){return this.transform(t.SVGPathDataTransformer.SANITIZE(r))},r.prototype.translate=function(r,e){return this.transform(t.SVGPathDataTransformer.TRANSLATE(r,e))},r.prototype.scale=function(r,e){return this.transform(t.SVGPathDataTransformer.SCALE(r,e))},r.prototype.rotate=function(r,e,a){return this.transform(t.SVGPathDataTransformer.ROTATE(r,e,a))},r.prototype.matrix=function(r,e,a,i,n,o){return this.transform(t.SVGPathDataTransformer.MATRIX(r,e,a,i,n,o))},r.prototype.skewX=function(r){return this.transform(t.SVGPathDataTransformer.SKEW_X(r))},r.prototype.skewY=function(r){return this.transform(t.SVGPathDataTransformer.SKEW_Y(r))},r.prototype.xSymmetry=function(r){return this.transform(t.SVGPathDataTransformer.X_AXIS_SYMMETRY(r))},r.prototype.ySymmetry=function(r){return this.transform(t.SVGPathDataTransformer.Y_AXIS_SYMMETRY(r))},r.prototype.annotateArcs=function(){return this.transform(t.SVGPathDataTransformer.ANNOTATE_ARCS())},r}(),l=function(t){return" "===t||"\t"===t||"\r"===t||"\n"===t},v=function(t){return"0".charCodeAt(0)<=t.charCodeAt(0)&&t.charCodeAt(0)<="9".charCodeAt(0)},_=function(t){function r(){var r=t.call(this)||this;return r.curNumber="",r.curCommandType=-1,r.curCommandRelative=!1,r.canParseCommandOrComma=!0,r.curNumberHasExp=!1,r.curNumberHasExpDigits=!1,r.curNumberHasDecimal=!1,r.curArgs=[],r}return e(r,t),r.prototype.finish=function(t){if(void 0===t&&(t=[]),this.parse(" ",t),0!==this.curArgs.length||!this.canParseCommandOrComma)throw new SyntaxError("Unterminated command at the path end.");return t},r.prototype.parse=function(t,r){var e=this;void 0===r&&(r=[]);for(var a=function(t){r.push(t),e.curArgs.length=0,e.canParseCommandOrComma=!0},i=0;i<t.length;i++){var n=t[i],o=!(this.curCommandType!==N.ARC||3!==this.curArgs.length&&4!==this.curArgs.length||1!==this.curNumber.length||"0"!==this.curNumber&&"1"!==this.curNumber),s=v(n)&&("0"===this.curNumber&&"0"===n||o);if(!v(n)||s)if("e"!==n&&"E"!==n)if("-"!==n&&"+"!==n||!this.curNumberHasExp||this.curNumberHasExpDigits)if("."!==n||this.curNumberHasExp||this.curNumberHasDecimal||o){if(this.curNumber&&-1!==this.curCommandType){var u=Number(this.curNumber);if(isNaN(u))throw new SyntaxError("Invalid number ending at "+i);if(this.curCommandType===N.ARC)if(0===this.curArgs.length||1===this.curArgs.length){if(0>u)throw new SyntaxError('Expected positive number, got "'+u+'" at index "'+i+'"')}else if((3===this.curArgs.length||4===this.curArgs.length)&&"0"!==this.curNumber&&"1"!==this.curNumber)throw new SyntaxError('Expected a flag, got "'+this.curNumber+'" at index "'+i+'"');this.curArgs.push(u),this.curArgs.length===d[this.curCommandType]&&(N.HORIZ_LINE_TO===this.curCommandType?a({type:N.HORIZ_LINE_TO,relative:this.curCommandRelative,x:u}):N.VERT_LINE_TO===this.curCommandType?a({type:N.VERT_LINE_TO,relative:this.curCommandRelative,y:u}):this.curCommandType===N.MOVE_TO||this.curCommandType===N.LINE_TO||this.curCommandType===N.SMOOTH_QUAD_TO?(a({type:this.curCommandType,relative:this.curCommandRelative,x:this.curArgs[0],y:this.curArgs[1]}),N.MOVE_TO===this.curCommandType&&(this.curCommandType=N.LINE_TO)):this.curCommandType===N.CURVE_TO?a({type:N.CURVE_TO,relative:this.curCommandRelative,x1:this.curArgs[0],y1:this.curArgs[1],x2:this.curArgs[2],y2:this.curArgs[3],x:this.curArgs[4],y:this.curArgs[5]}):this.curCommandType===N.SMOOTH_CURVE_TO?a({type:N.SMOOTH_CURVE_TO,relative:this.curCommandRelative,x2:this.curArgs[0],y2:this.curArgs[1],x:this.curArgs[2],y:this.curArgs[3]}):this.curCommandType===N.QUAD_TO?a({type:N.QUAD_TO,relative:this.curCommandRelative,x1:this.curArgs[0],y1:this.curArgs[1],x:this.curArgs[2],y:this.curArgs[3]}):this.curCommandType===N.ARC&&a({type:N.ARC,relative:this.curCommandRelative,rX:this.curArgs[0],rY:this.curArgs[1],xRot:this.curArgs[2],lArcFlag:this.curArgs[3],sweepFlag:this.curArgs[4],x:this.curArgs[5],y:this.curArgs[6]})),this.curNumber="",this.curNumberHasExpDigits=!1,this.curNumberHasExp=!1,this.curNumberHasDecimal=!1,this.canParseCommandOrComma=!0}if(!l(n))if(","===n&&this.canParseCommandOrComma)this.canParseCommandOrComma=!1;else if("+"!==n&&"-"!==n&&"."!==n)if(s)this.curNumber=n,this.curNumberHasDecimal=!1;else{if(0!==this.curArgs.length)throw new SyntaxError("Unterminated command at index "+i+".");if(!this.canParseCommandOrComma)throw new SyntaxError('Unexpected character "'+n+'" at index '+i+". Command cannot follow comma");if(this.canParseCommandOrComma=!1,"z"!==n&&"Z"!==n)if("h"===n||"H"===n)this.curCommandType=N.HORIZ_LINE_TO,this.curCommandRelative="h"===n;else if("v"===n||"V"===n)this.curCommandType=N.VERT_LINE_TO,this.curCommandRelative="v"===n;else if("m"===n||"M"===n)this.curCommandType=N.MOVE_TO,this.curCommandRelative="m"===n;else if("l"===n||"L"===n)this.curCommandType=N.LINE_TO,this.curCommandRelative="l"===n;else if("c"===n||"C"===n)this.curCommandType=N.CURVE_TO,this.curCommandRelative="c"===n;else if("s"===n||"S"===n)this.curCommandType=N.SMOOTH_CURVE_TO,this.curCommandRelative="s"===n;else if("q"===n||"Q"===n)this.curCommandType=N.QUAD_TO,this.curCommandRelative="q"===n;else if("t"===n||"T"===n)this.curCommandType=N.SMOOTH_QUAD_TO,this.curCommandRelative="t"===n;else{if("a"!==n&&"A"!==n)throw new SyntaxError('Unexpected character "'+n+'" at index '+i+".");this.curCommandType=N.ARC,this.curCommandRelative="a"===n}else r.push({type:N.CLOSE_PATH}),this.canParseCommandOrComma=!0,this.curCommandType=-1}else this.curNumber=n,this.curNumberHasDecimal="."===n}else this.curNumber+=n,this.curNumberHasDecimal=!0;else this.curNumber+=n;else this.curNumber+=n,this.curNumberHasExp=!0;else this.curNumber+=n,this.curNumberHasExpDigits=this.curNumberHasExp}return r},r.prototype.transform=function(t){return Object.create(this,{parse:{value:function(r,e){void 0===e&&(e=[]);for(var a=0,i=Object.getPrototypeOf(this).parse.call(this,r);a<i.length;a++){var n=i[a],o=t(n);Array.isArray(o)?e.push.apply(e,o):e.push(o)}return e}}})},r}(O),N=function(r){function a(t){var e=r.call(this)||this;return e.commands="string"==typeof t?a.parse(t):t,e}return e(a,r),a.prototype.encode=function(){return a.encode(this.commands)},a.prototype.getBounds=function(){var r=t.SVGPathDataTransformer.CALCULATE_BOUNDS();return this.transform(r),r},a.prototype.transform=function(t){for(var r=[],e=0,a=this.commands;e<a.length;e++){var i=t(a[e]);Array.isArray(i)?r.push.apply(r,i):r.push(i)}return this.commands=r,this},a.encode=function(t){return i(t)},a.parse=function(t){var r=new _,e=[];return r.parse(t,e),r.finish(e),e},a.CLOSE_PATH=1,a.MOVE_TO=2,a.HORIZ_LINE_TO=4,a.VERT_LINE_TO=8,a.LINE_TO=16,a.CURVE_TO=32,a.SMOOTH_CURVE_TO=64,a.QUAD_TO=128,a.SMOOTH_QUAD_TO=256,a.ARC=512,a.LINE_COMMANDS=a.LINE_TO|a.HORIZ_LINE_TO|a.VERT_LINE_TO,a.DRAWING_COMMANDS=a.HORIZ_LINE_TO|a.VERT_LINE_TO|a.LINE_TO|a.CURVE_TO|a.SMOOTH_CURVE_TO|a.QUAD_TO|a.SMOOTH_QUAD_TO|a.ARC,a}(O),d=((T={})[N.MOVE_TO]=2,T[N.LINE_TO]=2,T[N.HORIZ_LINE_TO]=1,T[N.VERT_LINE_TO]=1,T[N.CLOSE_PATH]=0,T[N.QUAD_TO]=4,T[N.SMOOTH_QUAD_TO]=2,T[N.CURVE_TO]=6,T[N.SMOOTH_CURVE_TO]=4,T[N.ARC]=7,T);t.COMMAND_ARG_COUNTS=d,t.SVGPathData=N,t.SVGPathDataParser=_,t.encodeSVGPath=i,Object.defineProperty(t,"__esModule",{value:!0})}));
//# sourceMappingURL=SVGPathData.cjs.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/client/index.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,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QUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxtQkFBbUI7QUFDbkI7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0EsTUFBTTtBQUNOOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsVUFBVTtBQUNWOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0VBQWtFLFdBQVcsVUFBVSxTQUFTLEtBQUssb0JBQW9CO0FBQ3pIO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0I7QUFDaEI7QUFDQTtBQUNBLE9BQU87QUFDUDtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0EsK0NBQStDLGVBQWU7QUFDOUQ7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBO0FBQ0Esa0RBQWtELGlCQUFpQjtBQUNuRTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsTUFBTTtBQUNOO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0Isd0JBQXdCO0FBQzVDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQSxlQUFlLE1BQU07QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLEtBQUs7QUFDTDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBOztBQUVBOztBQUVBLENBQUM7Ozs7Ozs7Ozs7O0FDbndCRDtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQSxJQUFJO0FBQ0o7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsSUFBSTtBQUNKO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsQ0FBQzs7QUFFRDs7Ozs7Ozs7Ozs7QUNuQ0EsVUFBVSxtQkFBTyxDQUFDLDhFQUFpQjtBQUNuQywyQ0FBMkMscUJBQU07QUFDakQ7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZUFBZSw0QkFBNEI7QUFDM0M7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsZUFBZTtBQUN0QztBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Qsc0NBQXNDLFNBQVM7QUFDL0M7QUFDQTtBQUNBO0FBQ0EsT0FBTztBQUNQO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTs7QUFFQTtBQUNBLG1CQUFtQixrQkFBa0I7QUFDckM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0EsdUJBQXVCO0FBQ3ZCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBOztBQUVBO0FBQ0EseUNBQXlDO0FBQ3pDO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxRkFBcUY7QUFDckY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixtQkFBbUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixTQUFTO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLFNBQVM7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixZQUFZO0FBQzVCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx1QkFBdUIsU0FBUztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsYUFBYTtBQUM3QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsdUJBQXVCLFNBQVM7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixTQUFTO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isa0NBQWtDO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQiw2Q0FBNkM7QUFDN0QsZ0JBQWdCLFNBQVM7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLE9BQU87QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLDBCQUEwQjtBQUMxQztBQUNBLGtCQUFrQixTQUFTO0FBQzNCO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsMEJBQTBCO0FBQzFDO0FBQ0Esa0JBQWtCLFNBQVM7QUFDM0I7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxnQkFBZ0IsZ0JBQWdCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLFNBQVM7QUFDekI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQSxnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLHNKQUFzSjtBQUNwSztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjLGlMQUFpTDtBQUMvTCxnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsaUJBQWlCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isa0NBQWtDO0FBQ2xEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxvQkFBb0IsVUFBVTtBQUM5QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsUUFBUTtBQUN4QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLDhCQUE4QjtBQUM5QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsMEVBQTBFO0FBQzFFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0EsZ0JBQWdCLGVBQWU7QUFDL0I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IscUJBQXFCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLHFCQUFxQjtBQUNyQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFrQjtBQUNsQjtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxrQkFBa0I7QUFDbEI7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCO0FBQ2xCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxjQUFjO0FBQ2Q7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IscUJBQXFCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVCxnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IscUJBQXFCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixjQUFjO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLFNBQVM7QUFDcEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQSx5Q0FBeUMsMkJBQTJCO0FBQ3BFO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsVUFBVTtBQUNWO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxVQUFVO0FBQ1Y7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxhQUFhO0FBQ2I7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0EsZ0JBQWdCLGdCQUFnQjtBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsVUFBVTtBQUMxQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDJCQUEyQixTQUFTO0FBQ3BDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0Isa0JBQWtCO0FBQ2xDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSwwQ0FBMEMsbUJBQW1CO0FBQzdEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsZ0JBQWdCO0FBQ2hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsV0FBVyxpQkFBaUIsYUFBYSxvQkFBb0I7QUFDN0U7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLG9CQUFvQixTQUFTO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixtQkFBbUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0EsdUJBQXVCLFNBQVM7QUFDaEM7QUFDQSxtQ0FBbUMsU0FBUztBQUM1QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQixjQUFjO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixjQUFjO0FBQzlCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLCtCQUErQixzQkFBc0I7QUFDckQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FB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QTtBQUNBO0FBQ0EsY0FBYyxrQkFBa0I7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxpQkFBaUIsZ0JBQWdCLElBQUksZ0JBQWdCO0FBQ3JEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQixVQUFVO0FBQzFCLGlCQUFpQixnQkFBZ0I7QUFDakM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esa0JBQWtCLFNBQVM7QUFDM0I7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLFVBQVU7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGlCQUFpQixRQUFRO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQSx3QkFBd0IsUUFBUTtBQUNoQyw0QkFBNEIsUUFBUTtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixTQUFTO0FBQ3pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUztBQUNUO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IsU0FBUztBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBLG9CQUFvQixZQUFZO0FBQ2hDLG9CQUFvQixzQkFBc0I7QUFDMUMsb0JBQW9CLFlBQVk7QUFDaEM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLG9CQUFvQjtBQUNwQztBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsZ0JBQWdCLGdCQUFnQjtBQUNoQyxnQkFBZ0Isd0JBQXdCO0FBQ3hDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixVQUFVO0FBQzFCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGNBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsY0FBYztBQUNkO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxnQkFBZ0IscUJBQXFCO0FBQ3JDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Es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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQVU7QUFDVjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixhQUFhO0FBQzdCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsMkJBQTJCLGNBQWM7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNB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QixZQUFZO0FBQ25DLDJCQUEyQixXQUFXO0FBQ3RDO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0EsZ0JBQWdCLFlBQVk7QUFDNUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsaUJBQWlCO0FBQ2pCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixZQUFZO0FBQzVCO0FBQ0EsZ0JBQWdCLHlCQUF5QjtBQUN6QztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQix1QkFBdUI7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFNBQVM7QUFDVDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBLGdCQUFnQix5QkFBeUI7QUFDekM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxLQUFLO0FBQ0w7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixlQUFlO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixlQUFlO0FBQy9CO0FBQ0E7QUFDQTtBQUNBLGdCQUFnQixlQUFlO0FBQy9CO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxTQUFTO0FBQ1Q7QUFDQSx5QkFBeUIseUxBQXlMLElBQUk7QUFDdE47QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7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V0FDQTtXQUNBLENBQUM7Ozs7O1dDUEQ7Ozs7O1dDQUE7V0FDQTtXQUNBO1dBQ0EsdURBQXVELGlCQUFpQjtXQUN4RTtXQUNBLGdEQUFnRCxhQUFhO1dBQzdEOzs7OztVRU5BO1VBQ0E7VUFDQTtVQUNBIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vLy4vbm9kZV9tb2R1bGVzL211c3RhY2hlL211c3RhY2hlLmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9wZXJmb3JtYW5jZS1ub3cvbGliL3BlcmZvcm1hbmNlLW5vdy5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvcmFmL2luZGV4LmpzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9yZ2Jjb2xvci9pbmRleC5qcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3RhY2tibHVyLWNhbnZhcy9kaXN0L3N0YWNrYmx1ci1lcy5qcyIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L2JvYXJkLnRzIiwid2VicGFjazovLy8uL3NyYy9jbGllbnQvaGVscGVycy50cyIsIndlYnBhY2s6Ly8vLi9zcmMvY2xpZW50L2luZGV4LnRzIiwid2VicGFjazovLy8uL25vZGVfbW9kdWxlcy9jYW52Zy9kaXN0L2luZGV4LmNqcyIsIndlYnBhY2s6Ly8vLi9ub2RlX21vZHVsZXMvc3ZnLXBhdGhkYXRhL2xpYi9TVkdQYXRoRGF0YS5janMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYm9vdHN0cmFwIiwid2VicGFjazovLy93ZWJwYWNrL3J1bnRpbWUvZGVmaW5lIHByb3BlcnR5IGdldHRlcnMiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9nbG9iYWwiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9oYXNPd25Qcm9wZXJ0eSBzaG9ydGhhbmQiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svcnVudGltZS9tYWtlIG5hbWVzcGFjZSBvYmplY3QiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svYmVmb3JlLXN0YXJ0dXAiLCJ3ZWJwYWNrOi8vL3dlYnBhY2svc3RhcnR1cCIsIndlYnBhY2s6Ly8vd2VicGFjay9hZnRlci1zdGFydHVwIl0sInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiAoZ2xvYmFsLCBmYWN0b3J5KSB7XG4gIHR5cGVvZiBleHBvcnRzID09PSAnb2JqZWN0JyAmJiB0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyA/IG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpIDpcbiAgdHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kID8gZGVmaW5lKGZhY3RvcnkpIDpcbiAgKGdsb2JhbCA9IGdsb2JhbCB8fCBzZWxmLCBnbG9iYWwuTXVzdGFjaGUgPSBmYWN0b3J5KCkpO1xufSh0aGlzLCAoZnVuY3Rpb24gKCkgeyAndXNlIHN0cmljdCc7XG5cbiAgLyohXG4gICAqIG11c3RhY2hlLmpzIC0gTG9naWMtbGVzcyB7e211c3RhY2hlfX0gdGVtcGxhdGVzIHdpdGggSmF2YVNjcmlwdFxuICAgKiBodHRwOi8vZ2l0aHViLmNvbS9qYW5sL211c3RhY2hlLmpzXG4gICAqL1xuXG4gIHZhciBvYmplY3RUb1N0cmluZyA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG4gIHZhciBpc0FycmF5ID0gQXJyYXkuaXNBcnJheSB8fCBmdW5jdGlvbiBpc0FycmF5UG9seWZpbGwgKG9iamVjdCkge1xuICAgIHJldHVybiBvYmplY3RUb1N0cmluZy5jYWxsKG9iamVjdCkgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgZnVuY3Rpb24gaXNGdW5jdGlvbiAob2JqZWN0KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBvYmplY3QgPT09ICdmdW5jdGlvbic7XG4gIH1cblxuICAvKipcbiAgICogTW9yZSBjb3JyZWN0IHR5cGVvZiBzdHJpbmcgaGFuZGxpbmcgYXJyYXlcbiAgICogd2hpY2ggbm9ybWFsbHkgcmV0dXJucyB0eXBlb2YgJ29iamVjdCdcbiAgICovXG4gIGZ1bmN0aW9uIHR5cGVTdHIgKG9iaikge1xuICAgIHJldHVybiBpc0FycmF5KG9iaikgPyAnYXJyYXknIDogdHlwZW9mIG9iajtcbiAgfVxuXG4gIGZ1bmN0aW9uIGVzY2FwZVJlZ0V4cCAoc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0cmluZy5yZXBsYWNlKC9bXFwtXFxbXFxde30oKSorPy4sXFxcXFxcXiR8I1xcc10vZywgJ1xcXFwkJicpO1xuICB9XG5cbiAgLyoqXG4gICAqIE51bGwgc2FmZSB3YXkgb2YgY2hlY2tpbmcgd2hldGhlciBvciBub3QgYW4gb2JqZWN0LFxuICAgKiBpbmNsdWRpbmcgaXRzIHByb3RvdHlwZSwgaGFzIGEgZ2l2ZW4gcHJvcGVydHlcbiAgICovXG4gIGZ1bmN0aW9uIGhhc1Byb3BlcnR5IChvYmosIHByb3BOYW1lKSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIHR5cGVvZiBvYmogPT09ICdvYmplY3QnICYmIChwcm9wTmFtZSBpbiBvYmopO1xuICB9XG5cbiAgLyoqXG4gICAqIFNhZmUgd2F5IG9mIGRldGVjdGluZyB3aGV0aGVyIG9yIG5vdCB0aGUgZ2l2ZW4gdGhpbmcgaXMgYSBwcmltaXRpdmUgYW5kXG4gICAqIHdoZXRoZXIgaXQgaGFzIHRoZSBnaXZlbiBwcm9wZXJ0eVxuICAgKi9cbiAgZnVuY3Rpb24gcHJpbWl0aXZlSGFzT3duUHJvcGVydHkgKHByaW1pdGl2ZSwgcHJvcE5hbWUpIHtcbiAgICByZXR1cm4gKFxuICAgICAgcHJpbWl0aXZlICE9IG51bGxcbiAgICAgICYmIHR5cGVvZiBwcmltaXRpdmUgIT09ICdvYmplY3QnXG4gICAgICAmJiBwcmltaXRpdmUuaGFzT3duUHJvcGVydHlcbiAgICAgICYmIHByaW1pdGl2ZS5oYXNPd25Qcm9wZXJ0eShwcm9wTmFtZSlcbiAgICApO1xuICB9XG5cbiAgLy8gV29ya2Fyb3VuZCBmb3IgaHR0cHM6Ly9pc3N1ZXMuYXBhY2hlLm9yZy9qaXJhL2Jyb3dzZS9DT1VDSERCLTU3N1xuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzE4OVxuICB2YXIgcmVnRXhwVGVzdCA9IFJlZ0V4cC5wcm90b3R5cGUudGVzdDtcbiAgZnVuY3Rpb24gdGVzdFJlZ0V4cCAocmUsIHN0cmluZykge1xuICAgIHJldHVybiByZWdFeHBUZXN0LmNhbGwocmUsIHN0cmluZyk7XG4gIH1cblxuICB2YXIgbm9uU3BhY2VSZSA9IC9cXFMvO1xuICBmdW5jdGlvbiBpc1doaXRlc3BhY2UgKHN0cmluZykge1xuICAgIHJldHVybiAhdGVzdFJlZ0V4cChub25TcGFjZVJlLCBzdHJpbmcpO1xuICB9XG5cbiAgdmFyIGVudGl0eU1hcCA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmIzM5OycsXG4gICAgJy8nOiAnJiN4MkY7JyxcbiAgICAnYCc6ICcmI3g2MDsnLFxuICAgICc9JzogJyYjeDNEOydcbiAgfTtcblxuICBmdW5jdGlvbiBlc2NhcGVIdG1sIChzdHJpbmcpIHtcbiAgICByZXR1cm4gU3RyaW5nKHN0cmluZykucmVwbGFjZSgvWyY8PlwiJ2A9XFwvXS9nLCBmdW5jdGlvbiBmcm9tRW50aXR5TWFwIChzKSB7XG4gICAgICByZXR1cm4gZW50aXR5TWFwW3NdO1xuICAgIH0pO1xuICB9XG5cbiAgdmFyIHdoaXRlUmUgPSAvXFxzKi87XG4gIHZhciBzcGFjZVJlID0gL1xccysvO1xuICB2YXIgZXF1YWxzUmUgPSAvXFxzKj0vO1xuICB2YXIgY3VybHlSZSA9IC9cXHMqXFx9LztcbiAgdmFyIHRhZ1JlID0gLyN8XFxefFxcL3w+fFxce3wmfD18IS87XG5cbiAgLyoqXG4gICAqIEJyZWFrcyB1cCB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCBzdHJpbmcgaW50byBhIHRyZWUgb2YgdG9rZW5zLiBJZiB0aGUgYHRhZ3NgXG4gICAqIGFyZ3VtZW50IGlzIGdpdmVuIGhlcmUgaXQgbXVzdCBiZSBhbiBhcnJheSB3aXRoIHR3byBzdHJpbmcgdmFsdWVzOiB0aGVcbiAgICogb3BlbmluZyBhbmQgY2xvc2luZyB0YWdzIHVzZWQgaW4gdGhlIHRlbXBsYXRlIChlLmcuIFsgXCI8JVwiLCBcIiU+XCIgXSkuIE9mXG4gICAqIGNvdXJzZSwgdGhlIGRlZmF1bHQgaXMgdG8gdXNlIG11c3RhY2hlcyAoaS5lLiBtdXN0YWNoZS50YWdzKS5cbiAgICpcbiAgICogQSB0b2tlbiBpcyBhbiBhcnJheSB3aXRoIGF0IGxlYXN0IDQgZWxlbWVudHMuIFRoZSBmaXJzdCBlbGVtZW50IGlzIHRoZVxuICAgKiBtdXN0YWNoZSBzeW1ib2wgdGhhdCB3YXMgdXNlZCBpbnNpZGUgdGhlIHRhZywgZS5nLiBcIiNcIiBvciBcIiZcIi4gSWYgdGhlIHRhZ1xuICAgKiBkaWQgbm90IGNvbnRhaW4gYSBzeW1ib2wgKGkuZS4ge3tteVZhbHVlfX0pIHRoaXMgZWxlbWVudCBpcyBcIm5hbWVcIi4gRm9yXG4gICAqIGFsbCB0ZXh0IHRoYXQgYXBwZWFycyBvdXRzaWRlIGEgc3ltYm9sIHRoaXMgZWxlbWVudCBpcyBcInRleHRcIi5cbiAgICpcbiAgICogVGhlIHNlY29uZCBlbGVtZW50IG9mIGEgdG9rZW4gaXMgaXRzIFwidmFsdWVcIi4gRm9yIG11c3RhY2hlIHRhZ3MgdGhpcyBpc1xuICAgKiB3aGF0ZXZlciBlbHNlIHdhcyBpbnNpZGUgdGhlIHRhZyBiZXNpZGVzIHRoZSBvcGVuaW5nIHN5bWJvbC4gRm9yIHRleHQgdG9rZW5zXG4gICAqIHRoaXMgaXMgdGhlIHRleHQgaXRzZWxmLlxuICAgKlxuICAgKiBUaGUgdGhpcmQgYW5kIGZvdXJ0aCBlbGVtZW50cyBvZiB0aGUgdG9rZW4gYXJlIHRoZSBzdGFydCBhbmQgZW5kIGluZGljZXMsXG4gICAqIHJlc3BlY3RpdmVseSwgb2YgdGhlIHRva2VuIGluIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZS5cbiAgICpcbiAgICogVG9rZW5zIHRoYXQgYXJlIHRoZSByb290IG5vZGUgb2YgYSBzdWJ0cmVlIGNvbnRhaW4gdHdvIG1vcmUgZWxlbWVudHM6IDEpIGFuXG4gICAqIGFycmF5IG9mIHRva2VucyBpbiB0aGUgc3VidHJlZSBhbmQgMikgdGhlIGluZGV4IGluIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSBhdFxuICAgKiB3aGljaCB0aGUgY2xvc2luZyB0YWcgZm9yIHRoYXQgc2VjdGlvbiBiZWdpbnMuXG4gICAqXG4gICAqIFRva2VucyBmb3IgcGFydGlhbHMgYWxzbyBjb250YWluIHR3byBtb3JlIGVsZW1lbnRzOiAxKSBhIHN0cmluZyB2YWx1ZSBvZlxuICAgKiBpbmRlbmRhdGlvbiBwcmlvciB0byB0aGF0IHRhZyBhbmQgMikgdGhlIGluZGV4IG9mIHRoYXQgdGFnIG9uIHRoYXQgbGluZSAtXG4gICAqIGVnIGEgdmFsdWUgb2YgMiBpbmRpY2F0ZXMgdGhlIHBhcnRpYWwgaXMgdGhlIHRoaXJkIHRhZyBvbiB0aGlzIGxpbmUuXG4gICAqL1xuICBmdW5jdGlvbiBwYXJzZVRlbXBsYXRlICh0ZW1wbGF0ZSwgdGFncykge1xuICAgIGlmICghdGVtcGxhdGUpXG4gICAgICByZXR1cm4gW107XG4gICAgdmFyIGxpbmVIYXNOb25TcGFjZSA9IGZhbHNlO1xuICAgIHZhciBzZWN0aW9ucyA9IFtdOyAgICAgLy8gU3RhY2sgdG8gaG9sZCBzZWN0aW9uIHRva2Vuc1xuICAgIHZhciB0b2tlbnMgPSBbXTsgICAgICAgLy8gQnVmZmVyIHRvIGhvbGQgdGhlIHRva2Vuc1xuICAgIHZhciBzcGFjZXMgPSBbXTsgICAgICAgLy8gSW5kaWNlcyBvZiB3aGl0ZXNwYWNlIHRva2VucyBvbiB0aGUgY3VycmVudCBsaW5lXG4gICAgdmFyIGhhc1RhZyA9IGZhbHNlOyAgICAvLyBJcyB0aGVyZSBhIHt7dGFnfX0gb24gdGhlIGN1cnJlbnQgbGluZT9cbiAgICB2YXIgbm9uU3BhY2UgPSBmYWxzZTsgIC8vIElzIHRoZXJlIGEgbm9uLXNwYWNlIGNoYXIgb24gdGhlIGN1cnJlbnQgbGluZT9cbiAgICB2YXIgaW5kZW50YXRpb24gPSAnJzsgIC8vIFRyYWNrcyBpbmRlbnRhdGlvbiBmb3IgdGFncyB0aGF0IHVzZSBpdFxuICAgIHZhciB0YWdJbmRleCA9IDA7ICAgICAgLy8gU3RvcmVzIGEgY291bnQgb2YgbnVtYmVyIG9mIHRhZ3MgZW5jb3VudGVyZWQgb24gYSBsaW5lXG5cbiAgICAvLyBTdHJpcHMgYWxsIHdoaXRlc3BhY2UgdG9rZW5zIGFycmF5IGZvciB0aGUgY3VycmVudCBsaW5lXG4gICAgLy8gaWYgdGhlcmUgd2FzIGEge3sjdGFnfX0gb24gaXQgYW5kIG90aGVyd2lzZSBvbmx5IHNwYWNlLlxuICAgIGZ1bmN0aW9uIHN0cmlwU3BhY2UgKCkge1xuICAgICAgaWYgKGhhc1RhZyAmJiAhbm9uU3BhY2UpIHtcbiAgICAgICAgd2hpbGUgKHNwYWNlcy5sZW5ndGgpXG4gICAgICAgICAgZGVsZXRlIHRva2Vuc1tzcGFjZXMucG9wKCldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc3BhY2VzID0gW107XG4gICAgICB9XG5cbiAgICAgIGhhc1RhZyA9IGZhbHNlO1xuICAgICAgbm9uU3BhY2UgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgb3BlbmluZ1RhZ1JlLCBjbG9zaW5nVGFnUmUsIGNsb3NpbmdDdXJseVJlO1xuICAgIGZ1bmN0aW9uIGNvbXBpbGVUYWdzICh0YWdzVG9Db21waWxlKSB7XG4gICAgICBpZiAodHlwZW9mIHRhZ3NUb0NvbXBpbGUgPT09ICdzdHJpbmcnKVxuICAgICAgICB0YWdzVG9Db21waWxlID0gdGFnc1RvQ29tcGlsZS5zcGxpdChzcGFjZVJlLCAyKTtcblxuICAgICAgaWYgKCFpc0FycmF5KHRhZ3NUb0NvbXBpbGUpIHx8IHRhZ3NUb0NvbXBpbGUubGVuZ3RoICE9PSAyKVxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgdGFnczogJyArIHRhZ3NUb0NvbXBpbGUpO1xuXG4gICAgICBvcGVuaW5nVGFnUmUgPSBuZXcgUmVnRXhwKGVzY2FwZVJlZ0V4cCh0YWdzVG9Db21waWxlWzBdKSArICdcXFxccyonKTtcbiAgICAgIGNsb3NpbmdUYWdSZSA9IG5ldyBSZWdFeHAoJ1xcXFxzKicgKyBlc2NhcGVSZWdFeHAodGFnc1RvQ29tcGlsZVsxXSkpO1xuICAgICAgY2xvc2luZ0N1cmx5UmUgPSBuZXcgUmVnRXhwKCdcXFxccyonICsgZXNjYXBlUmVnRXhwKCd9JyArIHRhZ3NUb0NvbXBpbGVbMV0pKTtcbiAgICB9XG5cbiAgICBjb21waWxlVGFncyh0YWdzIHx8IG11c3RhY2hlLnRhZ3MpO1xuXG4gICAgdmFyIHNjYW5uZXIgPSBuZXcgU2Nhbm5lcih0ZW1wbGF0ZSk7XG5cbiAgICB2YXIgc3RhcnQsIHR5cGUsIHZhbHVlLCBjaHIsIHRva2VuLCBvcGVuU2VjdGlvbjtcbiAgICB3aGlsZSAoIXNjYW5uZXIuZW9zKCkpIHtcbiAgICAgIHN0YXJ0ID0gc2Nhbm5lci5wb3M7XG5cbiAgICAgIC8vIE1hdGNoIGFueSB0ZXh0IGJldHdlZW4gdGFncy5cbiAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwob3BlbmluZ1RhZ1JlKTtcblxuICAgICAgaWYgKHZhbHVlKSB7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCB2YWx1ZUxlbmd0aCA9IHZhbHVlLmxlbmd0aDsgaSA8IHZhbHVlTGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICBjaHIgPSB2YWx1ZS5jaGFyQXQoaSk7XG5cbiAgICAgICAgICBpZiAoaXNXaGl0ZXNwYWNlKGNocikpIHtcbiAgICAgICAgICAgIHNwYWNlcy5wdXNoKHRva2Vucy5sZW5ndGgpO1xuICAgICAgICAgICAgaW5kZW50YXRpb24gKz0gY2hyO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBub25TcGFjZSA9IHRydWU7XG4gICAgICAgICAgICBsaW5lSGFzTm9uU3BhY2UgPSB0cnVlO1xuICAgICAgICAgICAgaW5kZW50YXRpb24gKz0gJyAnO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHRva2Vucy5wdXNoKFsgJ3RleHQnLCBjaHIsIHN0YXJ0LCBzdGFydCArIDEgXSk7XG4gICAgICAgICAgc3RhcnQgKz0gMTtcblxuICAgICAgICAgIC8vIENoZWNrIGZvciB3aGl0ZXNwYWNlIG9uIHRoZSBjdXJyZW50IGxpbmUuXG4gICAgICAgICAgaWYgKGNociA9PT0gJ1xcbicpIHtcbiAgICAgICAgICAgIHN0cmlwU3BhY2UoKTtcbiAgICAgICAgICAgIGluZGVudGF0aW9uID0gJyc7XG4gICAgICAgICAgICB0YWdJbmRleCA9IDA7XG4gICAgICAgICAgICBsaW5lSGFzTm9uU3BhY2UgPSBmYWxzZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gTWF0Y2ggdGhlIG9wZW5pbmcgdGFnLlxuICAgICAgaWYgKCFzY2FubmVyLnNjYW4ob3BlbmluZ1RhZ1JlKSlcbiAgICAgICAgYnJlYWs7XG5cbiAgICAgIGhhc1RhZyA9IHRydWU7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHR5cGUuXG4gICAgICB0eXBlID0gc2Nhbm5lci5zY2FuKHRhZ1JlKSB8fCAnbmFtZSc7XG4gICAgICBzY2FubmVyLnNjYW4od2hpdGVSZSk7XG5cbiAgICAgIC8vIEdldCB0aGUgdGFnIHZhbHVlLlxuICAgICAgaWYgKHR5cGUgPT09ICc9Jykge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGVxdWFsc1JlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuKGVxdWFsc1JlKTtcbiAgICAgICAgc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ1RhZ1JlKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJ3snKSB7XG4gICAgICAgIHZhbHVlID0gc2Nhbm5lci5zY2FuVW50aWwoY2xvc2luZ0N1cmx5UmUpO1xuICAgICAgICBzY2FubmVyLnNjYW4oY3VybHlSZSk7XG4gICAgICAgIHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICAgIHR5cGUgPSAnJic7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB2YWx1ZSA9IHNjYW5uZXIuc2NhblVudGlsKGNsb3NpbmdUYWdSZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hdGNoIHRoZSBjbG9zaW5nIHRhZy5cbiAgICAgIGlmICghc2Nhbm5lci5zY2FuKGNsb3NpbmdUYWdSZSkpXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVW5jbG9zZWQgdGFnIGF0ICcgKyBzY2FubmVyLnBvcyk7XG5cbiAgICAgIGlmICh0eXBlID09ICc+Jykge1xuICAgICAgICB0b2tlbiA9IFsgdHlwZSwgdmFsdWUsIHN0YXJ0LCBzY2FubmVyLnBvcywgaW5kZW50YXRpb24sIHRhZ0luZGV4LCBsaW5lSGFzTm9uU3BhY2UgXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRva2VuID0gWyB0eXBlLCB2YWx1ZSwgc3RhcnQsIHNjYW5uZXIucG9zIF07XG4gICAgICB9XG4gICAgICB0YWdJbmRleCsrO1xuICAgICAgdG9rZW5zLnB1c2godG9rZW4pO1xuXG4gICAgICBpZiAodHlwZSA9PT0gJyMnIHx8IHR5cGUgPT09ICdeJykge1xuICAgICAgICBzZWN0aW9ucy5wdXNoKHRva2VuKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJy8nKSB7XG4gICAgICAgIC8vIENoZWNrIHNlY3Rpb24gbmVzdGluZy5cbiAgICAgICAgb3BlblNlY3Rpb24gPSBzZWN0aW9ucy5wb3AoKTtcblxuICAgICAgICBpZiAoIW9wZW5TZWN0aW9uKVxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVW5vcGVuZWQgc2VjdGlvbiBcIicgKyB2YWx1ZSArICdcIiBhdCAnICsgc3RhcnQpO1xuXG4gICAgICAgIGlmIChvcGVuU2VjdGlvblsxXSAhPT0gdmFsdWUpXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdVbmNsb3NlZCBzZWN0aW9uIFwiJyArIG9wZW5TZWN0aW9uWzFdICsgJ1wiIGF0ICcgKyBzdGFydCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGUgPT09ICduYW1lJyB8fCB0eXBlID09PSAneycgfHwgdHlwZSA9PT0gJyYnKSB7XG4gICAgICAgIG5vblNwYWNlID0gdHJ1ZTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZSA9PT0gJz0nKSB7XG4gICAgICAgIC8vIFNldCB0aGUgdGFncyBmb3IgdGhlIG5leHQgdGltZSBhcm91bmQuXG4gICAgICAgIGNvbXBpbGVUYWdzKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzdHJpcFNwYWNlKCk7XG5cbiAgICAvLyBNYWtlIHN1cmUgdGhlcmUgYXJlIG5vIG9wZW4gc2VjdGlvbnMgd2hlbiB3ZSdyZSBkb25lLlxuICAgIG9wZW5TZWN0aW9uID0gc2VjdGlvbnMucG9wKCk7XG5cbiAgICBpZiAob3BlblNlY3Rpb24pXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1VuY2xvc2VkIHNlY3Rpb24gXCInICsgb3BlblNlY3Rpb25bMV0gKyAnXCIgYXQgJyArIHNjYW5uZXIucG9zKTtcblxuICAgIHJldHVybiBuZXN0VG9rZW5zKHNxdWFzaFRva2Vucyh0b2tlbnMpKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDb21iaW5lcyB0aGUgdmFsdWVzIG9mIGNvbnNlY3V0aXZlIHRleHQgdG9rZW5zIGluIHRoZSBnaXZlbiBgdG9rZW5zYCBhcnJheVxuICAgKiB0byBhIHNpbmdsZSB0b2tlbi5cbiAgICovXG4gIGZ1bmN0aW9uIHNxdWFzaFRva2VucyAodG9rZW5zKSB7XG4gICAgdmFyIHNxdWFzaGVkVG9rZW5zID0gW107XG5cbiAgICB2YXIgdG9rZW4sIGxhc3RUb2tlbjtcbiAgICBmb3IgKHZhciBpID0gMCwgbnVtVG9rZW5zID0gdG9rZW5zLmxlbmd0aDsgaSA8IG51bVRva2VuczsgKytpKSB7XG4gICAgICB0b2tlbiA9IHRva2Vuc1tpXTtcblxuICAgICAgaWYgKHRva2VuKSB7XG4gICAgICAgIGlmICh0b2tlblswXSA9PT0gJ3RleHQnICYmIGxhc3RUb2tlbiAmJiBsYXN0VG9rZW5bMF0gPT09ICd0ZXh0Jykge1xuICAgICAgICAgIGxhc3RUb2tlblsxXSArPSB0b2tlblsxXTtcbiAgICAgICAgICBsYXN0VG9rZW5bM10gPSB0b2tlblszXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBzcXVhc2hlZFRva2Vucy5wdXNoKHRva2VuKTtcbiAgICAgICAgICBsYXN0VG9rZW4gPSB0b2tlbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzcXVhc2hlZFRva2VucztcbiAgfVxuXG4gIC8qKlxuICAgKiBGb3JtcyB0aGUgZ2l2ZW4gYXJyYXkgb2YgYHRva2Vuc2AgaW50byBhIG5lc3RlZCB0cmVlIHN0cnVjdHVyZSB3aGVyZVxuICAgKiB0b2tlbnMgdGhhdCByZXByZXNlbnQgYSBzZWN0aW9uIGhhdmUgdHdvIGFkZGl0aW9uYWwgaXRlbXM6IDEpIGFuIGFycmF5IG9mXG4gICAqIGFsbCB0b2tlbnMgdGhhdCBhcHBlYXIgaW4gdGhhdCBzZWN0aW9uIGFuZCAyKSB0aGUgaW5kZXggaW4gdGhlIG9yaWdpbmFsXG4gICAqIHRlbXBsYXRlIHRoYXQgcmVwcmVzZW50cyB0aGUgZW5kIG9mIHRoYXQgc2VjdGlvbi5cbiAgICovXG4gIGZ1bmN0aW9uIG5lc3RUb2tlbnMgKHRva2Vucykge1xuICAgIHZhciBuZXN0ZWRUb2tlbnMgPSBbXTtcbiAgICB2YXIgY29sbGVjdG9yID0gbmVzdGVkVG9rZW5zO1xuICAgIHZhciBzZWN0aW9ucyA9IFtdO1xuXG4gICAgdmFyIHRva2VuLCBzZWN0aW9uO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHRva2VuID0gdG9rZW5zW2ldO1xuXG4gICAgICBzd2l0Y2ggKHRva2VuWzBdKSB7XG4gICAgICAgIGNhc2UgJyMnOlxuICAgICAgICBjYXNlICdeJzpcbiAgICAgICAgICBjb2xsZWN0b3IucHVzaCh0b2tlbik7XG4gICAgICAgICAgc2VjdGlvbnMucHVzaCh0b2tlbik7XG4gICAgICAgICAgY29sbGVjdG9yID0gdG9rZW5bNF0gPSBbXTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnLyc6XG4gICAgICAgICAgc2VjdGlvbiA9IHNlY3Rpb25zLnBvcCgpO1xuICAgICAgICAgIHNlY3Rpb25bNV0gPSB0b2tlblsyXTtcbiAgICAgICAgICBjb2xsZWN0b3IgPSBzZWN0aW9ucy5sZW5ndGggPiAwID8gc2VjdGlvbnNbc2VjdGlvbnMubGVuZ3RoIC0gMV1bNF0gOiBuZXN0ZWRUb2tlbnM7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29sbGVjdG9yLnB1c2godG9rZW4pO1xuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBuZXN0ZWRUb2tlbnM7XG4gIH1cblxuICAvKipcbiAgICogQSBzaW1wbGUgc3RyaW5nIHNjYW5uZXIgdGhhdCBpcyB1c2VkIGJ5IHRoZSB0ZW1wbGF0ZSBwYXJzZXIgdG8gZmluZFxuICAgKiB0b2tlbnMgaW4gdGVtcGxhdGUgc3RyaW5ncy5cbiAgICovXG4gIGZ1bmN0aW9uIFNjYW5uZXIgKHN0cmluZykge1xuICAgIHRoaXMuc3RyaW5nID0gc3RyaW5nO1xuICAgIHRoaXMudGFpbCA9IHN0cmluZztcbiAgICB0aGlzLnBvcyA9IDA7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBgdHJ1ZWAgaWYgdGhlIHRhaWwgaXMgZW1wdHkgKGVuZCBvZiBzdHJpbmcpLlxuICAgKi9cbiAgU2Nhbm5lci5wcm90b3R5cGUuZW9zID0gZnVuY3Rpb24gZW9zICgpIHtcbiAgICByZXR1cm4gdGhpcy50YWlsID09PSAnJztcbiAgfTtcblxuICAvKipcbiAgICogVHJpZXMgdG8gbWF0Y2ggdGhlIGdpdmVuIHJlZ3VsYXIgZXhwcmVzc2lvbiBhdCB0aGUgY3VycmVudCBwb3NpdGlvbi5cbiAgICogUmV0dXJucyB0aGUgbWF0Y2hlZCB0ZXh0IGlmIGl0IGNhbiBtYXRjaCwgdGhlIGVtcHR5IHN0cmluZyBvdGhlcndpc2UuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5zY2FuID0gZnVuY3Rpb24gc2NhbiAocmUpIHtcbiAgICB2YXIgbWF0Y2ggPSB0aGlzLnRhaWwubWF0Y2gocmUpO1xuXG4gICAgaWYgKCFtYXRjaCB8fCBtYXRjaC5pbmRleCAhPT0gMClcbiAgICAgIHJldHVybiAnJztcblxuICAgIHZhciBzdHJpbmcgPSBtYXRjaFswXTtcblxuICAgIHRoaXMudGFpbCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoc3RyaW5nLmxlbmd0aCk7XG4gICAgdGhpcy5wb3MgKz0gc3RyaW5nLmxlbmd0aDtcblxuICAgIHJldHVybiBzdHJpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIFNraXBzIGFsbCB0ZXh0IHVudGlsIHRoZSBnaXZlbiByZWd1bGFyIGV4cHJlc3Npb24gY2FuIGJlIG1hdGNoZWQuIFJldHVybnNcbiAgICogdGhlIHNraXBwZWQgc3RyaW5nLCB3aGljaCBpcyB0aGUgZW50aXJlIHRhaWwgaWYgbm8gbWF0Y2ggY2FuIGJlIG1hZGUuXG4gICAqL1xuICBTY2FubmVyLnByb3RvdHlwZS5zY2FuVW50aWwgPSBmdW5jdGlvbiBzY2FuVW50aWwgKHJlKSB7XG4gICAgdmFyIGluZGV4ID0gdGhpcy50YWlsLnNlYXJjaChyZSksIG1hdGNoO1xuXG4gICAgc3dpdGNoIChpbmRleCkge1xuICAgICAgY2FzZSAtMTpcbiAgICAgICAgbWF0Y2ggPSB0aGlzLnRhaWw7XG4gICAgICAgIHRoaXMudGFpbCA9ICcnO1xuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgMDpcbiAgICAgICAgbWF0Y2ggPSAnJztcbiAgICAgICAgYnJlYWs7XG4gICAgICBkZWZhdWx0OlxuICAgICAgICBtYXRjaCA9IHRoaXMudGFpbC5zdWJzdHJpbmcoMCwgaW5kZXgpO1xuICAgICAgICB0aGlzLnRhaWwgPSB0aGlzLnRhaWwuc3Vic3RyaW5nKGluZGV4KTtcbiAgICB9XG5cbiAgICB0aGlzLnBvcyArPSBtYXRjaC5sZW5ndGg7XG5cbiAgICByZXR1cm4gbWF0Y2g7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYSByZW5kZXJpbmcgY29udGV4dCBieSB3cmFwcGluZyBhIHZpZXcgb2JqZWN0IGFuZFxuICAgKiBtYWludGFpbmluZyBhIHJlZmVyZW5jZSB0byB0aGUgcGFyZW50IGNvbnRleHQuXG4gICAqL1xuICBmdW5jdGlvbiBDb250ZXh0ICh2aWV3LCBwYXJlbnRDb250ZXh0KSB7XG4gICAgdGhpcy52aWV3ID0gdmlldztcbiAgICB0aGlzLmNhY2hlID0geyAnLic6IHRoaXMudmlldyB9O1xuICAgIHRoaXMucGFyZW50ID0gcGFyZW50Q29udGV4dDtcbiAgfVxuXG4gIC8qKlxuICAgKiBDcmVhdGVzIGEgbmV3IGNvbnRleHQgdXNpbmcgdGhlIGdpdmVuIHZpZXcgd2l0aCB0aGlzIGNvbnRleHRcbiAgICogYXMgdGhlIHBhcmVudC5cbiAgICovXG4gIENvbnRleHQucHJvdG90eXBlLnB1c2ggPSBmdW5jdGlvbiBwdXNoICh2aWV3KSB7XG4gICAgcmV0dXJuIG5ldyBDb250ZXh0KHZpZXcsIHRoaXMpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZXR1cm5zIHRoZSB2YWx1ZSBvZiB0aGUgZ2l2ZW4gbmFtZSBpbiB0aGlzIGNvbnRleHQsIHRyYXZlcnNpbmdcbiAgICogdXAgdGhlIGNvbnRleHQgaGllcmFyY2h5IGlmIHRoZSB2YWx1ZSBpcyBhYnNlbnQgaW4gdGhpcyBjb250ZXh0J3Mgdmlldy5cbiAgICovXG4gIENvbnRleHQucHJvdG90eXBlLmxvb2t1cCA9IGZ1bmN0aW9uIGxvb2t1cCAobmFtZSkge1xuICAgIHZhciBjYWNoZSA9IHRoaXMuY2FjaGU7XG5cbiAgICB2YXIgdmFsdWU7XG4gICAgaWYgKGNhY2hlLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICB2YWx1ZSA9IGNhY2hlW25hbWVdO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIgY29udGV4dCA9IHRoaXMsIGludGVybWVkaWF0ZVZhbHVlLCBuYW1lcywgaW5kZXgsIGxvb2t1cEhpdCA9IGZhbHNlO1xuXG4gICAgICB3aGlsZSAoY29udGV4dCkge1xuICAgICAgICBpZiAobmFtZS5pbmRleE9mKCcuJykgPiAwKSB7XG4gICAgICAgICAgaW50ZXJtZWRpYXRlVmFsdWUgPSBjb250ZXh0LnZpZXc7XG4gICAgICAgICAgbmFtZXMgPSBuYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgICAgaW5kZXggPSAwO1xuXG4gICAgICAgICAgLyoqXG4gICAgICAgICAgICogVXNpbmcgdGhlIGRvdCBub3Rpb24gcGF0aCBpbiBgbmFtZWAsIHdlIGRlc2NlbmQgdGhyb3VnaCB0aGVcbiAgICAgICAgICAgKiBuZXN0ZWQgb2JqZWN0cy5cbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIFRvIGJlIGNlcnRhaW4gdGhhdCB0aGUgbG9va3VwIGhhcyBiZWVuIHN1Y2Nlc3NmdWwsIHdlIGhhdmUgdG9cbiAgICAgICAgICAgKiBjaGVjayBpZiB0aGUgbGFzdCBvYmplY3QgaW4gdGhlIHBhdGggYWN0dWFsbHkgaGFzIHRoZSBwcm9wZXJ0eVxuICAgICAgICAgICAqIHdlIGFyZSBsb29raW5nIGZvci4gV2Ugc3RvcmUgdGhlIHJlc3VsdCBpbiBgbG9va3VwSGl0YC5cbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIFRoaXMgaXMgc3BlY2lhbGx5IG5lY2Vzc2FyeSBmb3Igd2hlbiB0aGUgdmFsdWUgaGFzIGJlZW4gc2V0IHRvXG4gICAgICAgICAgICogYHVuZGVmaW5lZGAgYW5kIHdlIHdhbnQgdG8gYXZvaWQgbG9va2luZyB1cCBwYXJlbnQgY29udGV4dHMuXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBJbiB0aGUgY2FzZSB3aGVyZSBkb3Qgbm90YXRpb24gaXMgdXNlZCwgd2UgY29uc2lkZXIgdGhlIGxvb2t1cFxuICAgICAgICAgICAqIHRvIGJlIHN1Y2Nlc3NmdWwgZXZlbiBpZiB0aGUgbGFzdCBcIm9iamVjdFwiIGluIHRoZSBwYXRoIGlzXG4gICAgICAgICAgICogbm90IGFjdHVhbGx5IGFuIG9iamVjdCBidXQgYSBwcmltaXRpdmUgKGUuZy4sIGEgc3RyaW5nLCBvciBhblxuICAgICAgICAgICAqIGludGVnZXIpLCBiZWNhdXNlIGl0IGlzIHNvbWV0aW1lcyB1c2VmdWwgdG8gYWNjZXNzIGEgcHJvcGVydHlcbiAgICAgICAgICAgKiBvZiBhbiBhdXRvYm94ZWQgcHJpbWl0aXZlLCBzdWNoIGFzIHRoZSBsZW5ndGggb2YgYSBzdHJpbmcuXG4gICAgICAgICAgICoqL1xuICAgICAgICAgIHdoaWxlIChpbnRlcm1lZGlhdGVWYWx1ZSAhPSBudWxsICYmIGluZGV4IDwgbmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IG5hbWVzLmxlbmd0aCAtIDEpXG4gICAgICAgICAgICAgIGxvb2t1cEhpdCA9IChcbiAgICAgICAgICAgICAgICBoYXNQcm9wZXJ0eShpbnRlcm1lZGlhdGVWYWx1ZSwgbmFtZXNbaW5kZXhdKVxuICAgICAgICAgICAgICAgIHx8IHByaW1pdGl2ZUhhc093blByb3BlcnR5KGludGVybWVkaWF0ZVZhbHVlLCBuYW1lc1tpbmRleF0pXG4gICAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIGludGVybWVkaWF0ZVZhbHVlID0gaW50ZXJtZWRpYXRlVmFsdWVbbmFtZXNbaW5kZXgrK11dO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpbnRlcm1lZGlhdGVWYWx1ZSA9IGNvbnRleHQudmlld1tuYW1lXTtcblxuICAgICAgICAgIC8qKlxuICAgICAgICAgICAqIE9ubHkgY2hlY2tpbmcgYWdhaW5zdCBgaGFzUHJvcGVydHlgLCB3aGljaCBhbHdheXMgcmV0dXJucyBgZmFsc2VgIGlmXG4gICAgICAgICAgICogYGNvbnRleHQudmlld2AgaXMgbm90IGFuIG9iamVjdC4gRGVsaWJlcmF0ZWx5IG9taXR0aW5nIHRoZSBjaGVja1xuICAgICAgICAgICAqIGFnYWluc3QgYHByaW1pdGl2ZUhhc093blByb3BlcnR5YCBpZiBkb3Qgbm90YXRpb24gaXMgbm90IHVzZWQuXG4gICAgICAgICAgICpcbiAgICAgICAgICAgKiBDb25zaWRlciB0aGlzIGV4YW1wbGU6XG4gICAgICAgICAgICogYGBgXG4gICAgICAgICAgICogTXVzdGFjaGUucmVuZGVyKFwiVGhlIGxlbmd0aCBvZiBhIGZvb3RiYWxsIGZpZWxkIGlzIHt7I2xlbmd0aH19e3tsZW5ndGh9fXt7L2xlbmd0aH19LlwiLCB7bGVuZ3RoOiBcIjEwMCB5YXJkc1wifSlcbiAgICAgICAgICAgKiBgYGBcbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIElmIHdlIHdlcmUgdG8gY2hlY2sgYWxzbyBhZ2FpbnN0IGBwcmltaXRpdmVIYXNPd25Qcm9wZXJ0eWAsIGFzIHdlIGRvXG4gICAgICAgICAgICogaW4gdGhlIGRvdCBub3RhdGlvbiBjYXNlLCB0aGVuIHJlbmRlciBjYWxsIHdvdWxkIHJldHVybjpcbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIFwiVGhlIGxlbmd0aCBvZiBhIGZvb3RiYWxsIGZpZWxkIGlzIDkuXCJcbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIHJhdGhlciB0aGFuIHRoZSBleHBlY3RlZDpcbiAgICAgICAgICAgKlxuICAgICAgICAgICAqIFwiVGhlIGxlbmd0aCBvZiBhIGZvb3RiYWxsIGZpZWxkIGlzIDEwMCB5YXJkcy5cIlxuICAgICAgICAgICAqKi9cbiAgICAgICAgICBsb29rdXBIaXQgPSBoYXNQcm9wZXJ0eShjb250ZXh0LnZpZXcsIG5hbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxvb2t1cEhpdCkge1xuICAgICAgICAgIHZhbHVlID0gaW50ZXJtZWRpYXRlVmFsdWU7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0ID0gY29udGV4dC5wYXJlbnQ7XG4gICAgICB9XG5cbiAgICAgIGNhY2hlW25hbWVdID0gdmFsdWU7XG4gICAgfVxuXG4gICAgaWYgKGlzRnVuY3Rpb24odmFsdWUpKVxuICAgICAgdmFsdWUgPSB2YWx1ZS5jYWxsKHRoaXMudmlldyk7XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLyoqXG4gICAqIEEgV3JpdGVyIGtub3dzIGhvdyB0byB0YWtlIGEgc3RyZWFtIG9mIHRva2VucyBhbmQgcmVuZGVyIHRoZW0gdG8gYVxuICAgKiBzdHJpbmcsIGdpdmVuIGEgY29udGV4dC4gSXQgYWxzbyBtYWludGFpbnMgYSBjYWNoZSBvZiB0ZW1wbGF0ZXMgdG9cbiAgICogYXZvaWQgdGhlIG5lZWQgdG8gcGFyc2UgdGhlIHNhbWUgdGVtcGxhdGUgdHdpY2UuXG4gICAqL1xuICBmdW5jdGlvbiBXcml0ZXIgKCkge1xuICAgIHRoaXMudGVtcGxhdGVDYWNoZSA9IHtcbiAgICAgIF9jYWNoZToge30sXG4gICAgICBzZXQ6IGZ1bmN0aW9uIHNldCAoa2V5LCB2YWx1ZSkge1xuICAgICAgICB0aGlzLl9jYWNoZVtrZXldID0gdmFsdWU7XG4gICAgICB9LFxuICAgICAgZ2V0OiBmdW5jdGlvbiBnZXQgKGtleSkge1xuICAgICAgICByZXR1cm4gdGhpcy5fY2FjaGVba2V5XTtcbiAgICAgIH0sXG4gICAgICBjbGVhcjogZnVuY3Rpb24gY2xlYXIgKCkge1xuICAgICAgICB0aGlzLl9jYWNoZSA9IHt9O1xuICAgICAgfVxuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoaXMgd3JpdGVyLlxuICAgKi9cbiAgV3JpdGVyLnByb3RvdHlwZS5jbGVhckNhY2hlID0gZnVuY3Rpb24gY2xlYXJDYWNoZSAoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLnRlbXBsYXRlQ2FjaGUgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aGlzLnRlbXBsYXRlQ2FjaGUuY2xlYXIoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbmQgY2FjaGVzIHRoZSBnaXZlbiBgdGVtcGxhdGVgIGFjY29yZGluZyB0byB0aGUgZ2l2ZW4gYHRhZ3NgIG9yXG4gICAqIGBtdXN0YWNoZS50YWdzYCBpZiBgdGFnc2AgaXMgb21pdHRlZCwgIGFuZCByZXR1cm5zIHRoZSBhcnJheSBvZiB0b2tlbnNcbiAgICogdGhhdCBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgcGFyc2UuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgdmFyIGNhY2hlID0gdGhpcy50ZW1wbGF0ZUNhY2hlO1xuICAgIHZhciBjYWNoZUtleSA9IHRlbXBsYXRlICsgJzonICsgKHRhZ3MgfHwgbXVzdGFjaGUudGFncykuam9pbignOicpO1xuICAgIHZhciBpc0NhY2hlRW5hYmxlZCA9IHR5cGVvZiBjYWNoZSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgdmFyIHRva2VucyA9IGlzQ2FjaGVFbmFibGVkID8gY2FjaGUuZ2V0KGNhY2hlS2V5KSA6IHVuZGVmaW5lZDtcblxuICAgIGlmICh0b2tlbnMgPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0b2tlbnMgPSBwYXJzZVRlbXBsYXRlKHRlbXBsYXRlLCB0YWdzKTtcbiAgICAgIGlzQ2FjaGVFbmFibGVkICYmIGNhY2hlLnNldChjYWNoZUtleSwgdG9rZW5zKTtcbiAgICB9XG4gICAgcmV0dXJuIHRva2VucztcbiAgfTtcblxuICAvKipcbiAgICogSGlnaC1sZXZlbCBtZXRob2QgdGhhdCBpcyB1c2VkIHRvIHJlbmRlciB0aGUgZ2l2ZW4gYHRlbXBsYXRlYCB3aXRoXG4gICAqIHRoZSBnaXZlbiBgdmlld2AuXG4gICAqXG4gICAqIFRoZSBvcHRpb25hbCBgcGFydGlhbHNgIGFyZ3VtZW50IG1heSBiZSBhbiBvYmplY3QgdGhhdCBjb250YWlucyB0aGVcbiAgICogbmFtZXMgYW5kIHRlbXBsYXRlcyBvZiBwYXJ0aWFscyB0aGF0IGFyZSB1c2VkIGluIHRoZSB0ZW1wbGF0ZS4gSXQgbWF5XG4gICAqIGFsc28gYmUgYSBmdW5jdGlvbiB0aGF0IGlzIHVzZWQgdG8gbG9hZCBwYXJ0aWFsIHRlbXBsYXRlcyBvbiB0aGUgZmx5XG4gICAqIHRoYXQgdGFrZXMgYSBzaW5nbGUgYXJndW1lbnQ6IHRoZSBuYW1lIG9mIHRoZSBwYXJ0aWFsLlxuICAgKlxuICAgKiBJZiB0aGUgb3B0aW9uYWwgYGNvbmZpZ2AgYXJndW1lbnQgaXMgZ2l2ZW4gaGVyZSwgdGhlbiBpdCBzaG91bGQgYmUgYW5cbiAgICogb2JqZWN0IHdpdGggYSBgdGFnc2AgYXR0cmlidXRlIG9yIGFuIGBlc2NhcGVgIGF0dHJpYnV0ZSBvciBib3RoLlxuICAgKiBJZiBhbiBhcnJheSBpcyBwYXNzZWQsIHRoZW4gaXQgd2lsbCBiZSBpbnRlcnByZXRlZCB0aGUgc2FtZSB3YXkgYXNcbiAgICogYSBgdGFnc2AgYXR0cmlidXRlIG9uIGEgYGNvbmZpZ2Agb2JqZWN0LlxuICAgKlxuICAgKiBUaGUgYHRhZ3NgIGF0dHJpYnV0ZSBvZiBhIGBjb25maWdgIG9iamVjdCBtdXN0IGJlIGFuIGFycmF5IHdpdGggdHdvXG4gICAqIHN0cmluZyB2YWx1ZXM6IHRoZSBvcGVuaW5nIGFuZCBjbG9zaW5nIHRhZ3MgdXNlZCBpbiB0aGUgdGVtcGxhdGUgKGUuZy5cbiAgICogWyBcIjwlXCIsIFwiJT5cIiBdKS4gVGhlIGRlZmF1bHQgaXMgdG8gbXVzdGFjaGUudGFncy5cbiAgICpcbiAgICogVGhlIGBlc2NhcGVgIGF0dHJpYnV0ZSBvZiBhIGBjb25maWdgIG9iamVjdCBtdXN0IGJlIGEgZnVuY3Rpb24gd2hpY2hcbiAgICogYWNjZXB0cyBhIHN0cmluZyBhcyBpbnB1dCBhbmQgb3V0cHV0cyBhIHNhZmVseSBlc2NhcGVkIHN0cmluZy5cbiAgICogSWYgYW4gYGVzY2FwZWAgZnVuY3Rpb24gaXMgbm90IHByb3ZpZGVkLCB0aGVuIGFuIEhUTUwtc2FmZSBzdHJpbmdcbiAgICogZXNjYXBpbmcgZnVuY3Rpb24gaXMgdXNlZCBhcyB0aGUgZGVmYXVsdC5cbiAgICovXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVyID0gZnVuY3Rpb24gcmVuZGVyICh0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMsIGNvbmZpZykge1xuICAgIHZhciB0YWdzID0gdGhpcy5nZXRDb25maWdUYWdzKGNvbmZpZyk7XG4gICAgdmFyIHRva2VucyA9IHRoaXMucGFyc2UodGVtcGxhdGUsIHRhZ3MpO1xuICAgIHZhciBjb250ZXh0ID0gKHZpZXcgaW5zdGFuY2VvZiBDb250ZXh0KSA/IHZpZXcgOiBuZXcgQ29udGV4dCh2aWV3LCB1bmRlZmluZWQpO1xuICAgIHJldHVybiB0aGlzLnJlbmRlclRva2Vucyh0b2tlbnMsIGNvbnRleHQsIHBhcnRpYWxzLCB0ZW1wbGF0ZSwgY29uZmlnKTtcbiAgfTtcblxuICAvKipcbiAgICogTG93LWxldmVsIG1ldGhvZCB0aGF0IHJlbmRlcnMgdGhlIGdpdmVuIGFycmF5IG9mIGB0b2tlbnNgIHVzaW5nXG4gICAqIHRoZSBnaXZlbiBgY29udGV4dGAgYW5kIGBwYXJ0aWFsc2AuXG4gICAqXG4gICAqIE5vdGU6IFRoZSBgb3JpZ2luYWxUZW1wbGF0ZWAgaXMgb25seSBldmVyIHVzZWQgdG8gZXh0cmFjdCB0aGUgcG9ydGlvblxuICAgKiBvZiB0aGUgb3JpZ2luYWwgdGVtcGxhdGUgdGhhdCB3YXMgY29udGFpbmVkIGluIGEgaGlnaGVyLW9yZGVyIHNlY3Rpb24uXG4gICAqIElmIHRoZSB0ZW1wbGF0ZSBkb2Vzbid0IHVzZSBoaWdoZXItb3JkZXIgc2VjdGlvbnMsIHRoaXMgYXJndW1lbnQgbWF5XG4gICAqIGJlIG9taXR0ZWQuXG4gICAqL1xuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlclRva2VucyA9IGZ1bmN0aW9uIHJlbmRlclRva2VucyAodG9rZW5zLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSwgY29uZmlnKSB7XG4gICAgdmFyIGJ1ZmZlciA9ICcnO1xuXG4gICAgdmFyIHRva2VuLCBzeW1ib2wsIHZhbHVlO1xuICAgIGZvciAodmFyIGkgPSAwLCBudW1Ub2tlbnMgPSB0b2tlbnMubGVuZ3RoOyBpIDwgbnVtVG9rZW5zOyArK2kpIHtcbiAgICAgIHZhbHVlID0gdW5kZWZpbmVkO1xuICAgICAgdG9rZW4gPSB0b2tlbnNbaV07XG4gICAgICBzeW1ib2wgPSB0b2tlblswXTtcblxuICAgICAgaWYgKHN5bWJvbCA9PT0gJyMnKSB2YWx1ZSA9IHRoaXMucmVuZGVyU2VjdGlvbih0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUsIGNvbmZpZyk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICdeJykgdmFsdWUgPSB0aGlzLnJlbmRlckludmVydGVkKHRva2VuLCBjb250ZXh0LCBwYXJ0aWFscywgb3JpZ2luYWxUZW1wbGF0ZSwgY29uZmlnKTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJz4nKSB2YWx1ZSA9IHRoaXMucmVuZGVyUGFydGlhbCh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIGNvbmZpZyk7XG4gICAgICBlbHNlIGlmIChzeW1ib2wgPT09ICcmJykgdmFsdWUgPSB0aGlzLnVuZXNjYXBlZFZhbHVlKHRva2VuLCBjb250ZXh0KTtcbiAgICAgIGVsc2UgaWYgKHN5bWJvbCA9PT0gJ25hbWUnKSB2YWx1ZSA9IHRoaXMuZXNjYXBlZFZhbHVlKHRva2VuLCBjb250ZXh0LCBjb25maWcpO1xuICAgICAgZWxzZSBpZiAoc3ltYm9sID09PSAndGV4dCcpIHZhbHVlID0gdGhpcy5yYXdWYWx1ZSh0b2tlbik7XG5cbiAgICAgIGlmICh2YWx1ZSAhPT0gdW5kZWZpbmVkKVxuICAgICAgICBidWZmZXIgKz0gdmFsdWU7XG4gICAgfVxuXG4gICAgcmV0dXJuIGJ1ZmZlcjtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlclNlY3Rpb24gPSBmdW5jdGlvbiByZW5kZXJTZWN0aW9uICh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUsIGNvbmZpZykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB2YXIgYnVmZmVyID0gJyc7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuXG4gICAgLy8gVGhpcyBmdW5jdGlvbiBpcyB1c2VkIHRvIHJlbmRlciBhbiBhcmJpdHJhcnkgdGVtcGxhdGVcbiAgICAvLyBpbiB0aGUgY3VycmVudCBjb250ZXh0IGJ5IGhpZ2hlci1vcmRlciBzZWN0aW9ucy5cbiAgICBmdW5jdGlvbiBzdWJSZW5kZXIgKHRlbXBsYXRlKSB7XG4gICAgICByZXR1cm4gc2VsZi5yZW5kZXIodGVtcGxhdGUsIGNvbnRleHQsIHBhcnRpYWxzLCBjb25maWcpO1xuICAgIH1cblxuICAgIGlmICghdmFsdWUpIHJldHVybjtcblxuICAgIGlmIChpc0FycmF5KHZhbHVlKSkge1xuICAgICAgZm9yICh2YXIgaiA9IDAsIHZhbHVlTGVuZ3RoID0gdmFsdWUubGVuZ3RoOyBqIDwgdmFsdWVMZW5ndGg7ICsraikge1xuICAgICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQucHVzaCh2YWx1ZVtqXSksIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlLCBjb25maWcpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyB8fCB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGJ1ZmZlciArPSB0aGlzLnJlbmRlclRva2Vucyh0b2tlbls0XSwgY29udGV4dC5wdXNoKHZhbHVlKSwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUsIGNvbmZpZyk7XG4gICAgfSBlbHNlIGlmIChpc0Z1bmN0aW9uKHZhbHVlKSkge1xuICAgICAgaWYgKHR5cGVvZiBvcmlnaW5hbFRlbXBsYXRlICE9PSAnc3RyaW5nJylcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW5ub3QgdXNlIGhpZ2hlci1vcmRlciBzZWN0aW9ucyB3aXRob3V0IHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZScpO1xuXG4gICAgICAvLyBFeHRyYWN0IHRoZSBwb3J0aW9uIG9mIHRoZSBvcmlnaW5hbCB0ZW1wbGF0ZSB0aGF0IHRoZSBzZWN0aW9uIGNvbnRhaW5zLlxuICAgICAgdmFsdWUgPSB2YWx1ZS5jYWxsKGNvbnRleHQudmlldywgb3JpZ2luYWxUZW1wbGF0ZS5zbGljZSh0b2tlblszXSwgdG9rZW5bNV0pLCBzdWJSZW5kZXIpO1xuXG4gICAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgICAgYnVmZmVyICs9IHZhbHVlO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZmZXIgKz0gdGhpcy5yZW5kZXJUb2tlbnModG9rZW5bNF0sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlLCBjb25maWcpO1xuICAgIH1cbiAgICByZXR1cm4gYnVmZmVyO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUucmVuZGVySW52ZXJ0ZWQgPSBmdW5jdGlvbiByZW5kZXJJbnZlcnRlZCAodG9rZW4sIGNvbnRleHQsIHBhcnRpYWxzLCBvcmlnaW5hbFRlbXBsYXRlLCBjb25maWcpIHtcbiAgICB2YXIgdmFsdWUgPSBjb250ZXh0Lmxvb2t1cCh0b2tlblsxXSk7XG5cbiAgICAvLyBVc2UgSmF2YVNjcmlwdCdzIGRlZmluaXRpb24gb2YgZmFsc3kuIEluY2x1ZGUgZW1wdHkgYXJyYXlzLlxuICAgIC8vIFNlZSBodHRwczovL2dpdGh1Yi5jb20vamFubC9tdXN0YWNoZS5qcy9pc3N1ZXMvMTg2XG4gICAgaWYgKCF2YWx1ZSB8fCAoaXNBcnJheSh2YWx1ZSkgJiYgdmFsdWUubGVuZ3RoID09PSAwKSlcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlclRva2Vucyh0b2tlbls0XSwgY29udGV4dCwgcGFydGlhbHMsIG9yaWdpbmFsVGVtcGxhdGUsIGNvbmZpZyk7XG4gIH07XG5cbiAgV3JpdGVyLnByb3RvdHlwZS5pbmRlbnRQYXJ0aWFsID0gZnVuY3Rpb24gaW5kZW50UGFydGlhbCAocGFydGlhbCwgaW5kZW50YXRpb24sIGxpbmVIYXNOb25TcGFjZSkge1xuICAgIHZhciBmaWx0ZXJlZEluZGVudGF0aW9uID0gaW5kZW50YXRpb24ucmVwbGFjZSgvW14gXFx0XS9nLCAnJyk7XG4gICAgdmFyIHBhcnRpYWxCeU5sID0gcGFydGlhbC5zcGxpdCgnXFxuJyk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXJ0aWFsQnlObC5sZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHBhcnRpYWxCeU5sW2ldLmxlbmd0aCAmJiAoaSA+IDAgfHwgIWxpbmVIYXNOb25TcGFjZSkpIHtcbiAgICAgICAgcGFydGlhbEJ5TmxbaV0gPSBmaWx0ZXJlZEluZGVudGF0aW9uICsgcGFydGlhbEJ5TmxbaV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBwYXJ0aWFsQnlObC5qb2luKCdcXG4nKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLnJlbmRlclBhcnRpYWwgPSBmdW5jdGlvbiByZW5kZXJQYXJ0aWFsICh0b2tlbiwgY29udGV4dCwgcGFydGlhbHMsIGNvbmZpZykge1xuICAgIGlmICghcGFydGlhbHMpIHJldHVybjtcbiAgICB2YXIgdGFncyA9IHRoaXMuZ2V0Q29uZmlnVGFncyhjb25maWcpO1xuXG4gICAgdmFyIHZhbHVlID0gaXNGdW5jdGlvbihwYXJ0aWFscykgPyBwYXJ0aWFscyh0b2tlblsxXSkgOiBwYXJ0aWFsc1t0b2tlblsxXV07XG4gICAgaWYgKHZhbHVlICE9IG51bGwpIHtcbiAgICAgIHZhciBsaW5lSGFzTm9uU3BhY2UgPSB0b2tlbls2XTtcbiAgICAgIHZhciB0YWdJbmRleCA9IHRva2VuWzVdO1xuICAgICAgdmFyIGluZGVudGF0aW9uID0gdG9rZW5bNF07XG4gICAgICB2YXIgaW5kZW50ZWRWYWx1ZSA9IHZhbHVlO1xuICAgICAgaWYgKHRhZ0luZGV4ID09IDAgJiYgaW5kZW50YXRpb24pIHtcbiAgICAgICAgaW5kZW50ZWRWYWx1ZSA9IHRoaXMuaW5kZW50UGFydGlhbCh2YWx1ZSwgaW5kZW50YXRpb24sIGxpbmVIYXNOb25TcGFjZSk7XG4gICAgICB9XG4gICAgICB2YXIgdG9rZW5zID0gdGhpcy5wYXJzZShpbmRlbnRlZFZhbHVlLCB0YWdzKTtcbiAgICAgIHJldHVybiB0aGlzLnJlbmRlclRva2Vucyh0b2tlbnMsIGNvbnRleHQsIHBhcnRpYWxzLCBpbmRlbnRlZFZhbHVlLCBjb25maWcpO1xuICAgIH1cbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLnVuZXNjYXBlZFZhbHVlID0gZnVuY3Rpb24gdW5lc2NhcGVkVmFsdWUgKHRva2VuLCBjb250ZXh0KSB7XG4gICAgdmFyIHZhbHVlID0gY29udGV4dC5sb29rdXAodG9rZW5bMV0pO1xuICAgIGlmICh2YWx1ZSAhPSBudWxsKVxuICAgICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuZXNjYXBlZFZhbHVlID0gZnVuY3Rpb24gZXNjYXBlZFZhbHVlICh0b2tlbiwgY29udGV4dCwgY29uZmlnKSB7XG4gICAgdmFyIGVzY2FwZSA9IHRoaXMuZ2V0Q29uZmlnRXNjYXBlKGNvbmZpZykgfHwgbXVzdGFjaGUuZXNjYXBlO1xuICAgIHZhciB2YWx1ZSA9IGNvbnRleHQubG9va3VwKHRva2VuWzFdKTtcbiAgICBpZiAodmFsdWUgIT0gbnVsbClcbiAgICAgIHJldHVybiAodHlwZW9mIHZhbHVlID09PSAnbnVtYmVyJyAmJiBlc2NhcGUgPT09IG11c3RhY2hlLmVzY2FwZSkgPyBTdHJpbmcodmFsdWUpIDogZXNjYXBlKHZhbHVlKTtcbiAgfTtcblxuICBXcml0ZXIucHJvdG90eXBlLnJhd1ZhbHVlID0gZnVuY3Rpb24gcmF3VmFsdWUgKHRva2VuKSB7XG4gICAgcmV0dXJuIHRva2VuWzFdO1xuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuZ2V0Q29uZmlnVGFncyA9IGZ1bmN0aW9uIGdldENvbmZpZ1RhZ3MgKGNvbmZpZykge1xuICAgIGlmIChpc0FycmF5KGNvbmZpZykpIHtcbiAgICAgIHJldHVybiBjb25maWc7XG4gICAgfVxuICAgIGVsc2UgaWYgKGNvbmZpZyAmJiB0eXBlb2YgY29uZmlnID09PSAnb2JqZWN0Jykge1xuICAgICAgcmV0dXJuIGNvbmZpZy50YWdzO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9O1xuXG4gIFdyaXRlci5wcm90b3R5cGUuZ2V0Q29uZmlnRXNjYXBlID0gZnVuY3Rpb24gZ2V0Q29uZmlnRXNjYXBlIChjb25maWcpIHtcbiAgICBpZiAoY29uZmlnICYmIHR5cGVvZiBjb25maWcgPT09ICdvYmplY3QnICYmICFpc0FycmF5KGNvbmZpZykpIHtcbiAgICAgIHJldHVybiBjb25maWcuZXNjYXBlO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuICB9O1xuXG4gIHZhciBtdXN0YWNoZSA9IHtcbiAgICBuYW1lOiAnbXVzdGFjaGUuanMnLFxuICAgIHZlcnNpb246ICc0LjIuMCcsXG4gICAgdGFnczogWyAne3snLCAnfX0nIF0sXG4gICAgY2xlYXJDYWNoZTogdW5kZWZpbmVkLFxuICAgIGVzY2FwZTogdW5kZWZpbmVkLFxuICAgIHBhcnNlOiB1bmRlZmluZWQsXG4gICAgcmVuZGVyOiB1bmRlZmluZWQsXG4gICAgU2Nhbm5lcjogdW5kZWZpbmVkLFxuICAgIENvbnRleHQ6IHVuZGVmaW5lZCxcbiAgICBXcml0ZXI6IHVuZGVmaW5lZCxcbiAgICAvKipcbiAgICAgKiBBbGxvd3MgYSB1c2VyIHRvIG92ZXJyaWRlIHRoZSBkZWZhdWx0IGNhY2hpbmcgc3RyYXRlZ3ksIGJ5IHByb3ZpZGluZyBhblxuICAgICAqIG9iamVjdCB3aXRoIHNldCwgZ2V0IGFuZCBjbGVhciBtZXRob2RzLiBUaGlzIGNhbiBhbHNvIGJlIHVzZWQgdG8gZGlzYWJsZVxuICAgICAqIHRoZSBjYWNoZSBieSBzZXR0aW5nIGl0IHRvIHRoZSBsaXRlcmFsIGB1bmRlZmluZWRgLlxuICAgICAqL1xuICAgIHNldCB0ZW1wbGF0ZUNhY2hlIChjYWNoZSkge1xuICAgICAgZGVmYXVsdFdyaXRlci50ZW1wbGF0ZUNhY2hlID0gY2FjaGU7XG4gICAgfSxcbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBkZWZhdWx0IG9yIG92ZXJyaWRkZW4gY2FjaGluZyBvYmplY3QgZnJvbSB0aGUgZGVmYXVsdCB3cml0ZXIuXG4gICAgICovXG4gICAgZ2V0IHRlbXBsYXRlQ2FjaGUgKCkge1xuICAgICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIudGVtcGxhdGVDYWNoZTtcbiAgICB9XG4gIH07XG5cbiAgLy8gQWxsIGhpZ2gtbGV2ZWwgbXVzdGFjaGUuKiBmdW5jdGlvbnMgdXNlIHRoaXMgd3JpdGVyLlxuICB2YXIgZGVmYXVsdFdyaXRlciA9IG5ldyBXcml0ZXIoKTtcblxuICAvKipcbiAgICogQ2xlYXJzIGFsbCBjYWNoZWQgdGVtcGxhdGVzIGluIHRoZSBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLmNsZWFyQ2FjaGUgPSBmdW5jdGlvbiBjbGVhckNhY2hlICgpIHtcbiAgICByZXR1cm4gZGVmYXVsdFdyaXRlci5jbGVhckNhY2hlKCk7XG4gIH07XG5cbiAgLyoqXG4gICAqIFBhcnNlcyBhbmQgY2FjaGVzIHRoZSBnaXZlbiB0ZW1wbGF0ZSBpbiB0aGUgZGVmYXVsdCB3cml0ZXIgYW5kIHJldHVybnMgdGhlXG4gICAqIGFycmF5IG9mIHRva2VucyBpdCBjb250YWlucy4gRG9pbmcgdGhpcyBhaGVhZCBvZiB0aW1lIGF2b2lkcyB0aGUgbmVlZCB0b1xuICAgKiBwYXJzZSB0ZW1wbGF0ZXMgb24gdGhlIGZseSBhcyB0aGV5IGFyZSByZW5kZXJlZC5cbiAgICovXG4gIG11c3RhY2hlLnBhcnNlID0gZnVuY3Rpb24gcGFyc2UgKHRlbXBsYXRlLCB0YWdzKSB7XG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIucGFyc2UodGVtcGxhdGUsIHRhZ3MpO1xuICB9O1xuXG4gIC8qKlxuICAgKiBSZW5kZXJzIHRoZSBgdGVtcGxhdGVgIHdpdGggdGhlIGdpdmVuIGB2aWV3YCwgYHBhcnRpYWxzYCwgYW5kIGBjb25maWdgXG4gICAqIHVzaW5nIHRoZSBkZWZhdWx0IHdyaXRlci5cbiAgICovXG4gIG11c3RhY2hlLnJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAodGVtcGxhdGUsIHZpZXcsIHBhcnRpYWxzLCBjb25maWcpIHtcbiAgICBpZiAodHlwZW9mIHRlbXBsYXRlICE9PSAnc3RyaW5nJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignSW52YWxpZCB0ZW1wbGF0ZSEgVGVtcGxhdGUgc2hvdWxkIGJlIGEgXCJzdHJpbmdcIiAnICtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJ2J1dCBcIicgKyB0eXBlU3RyKHRlbXBsYXRlKSArICdcIiB3YXMgZ2l2ZW4gYXMgdGhlIGZpcnN0ICcgK1xuICAgICAgICAgICAgICAgICAgICAgICAgICAnYXJndW1lbnQgZm9yIG11c3RhY2hlI3JlbmRlcih0ZW1wbGF0ZSwgdmlldywgcGFydGlhbHMpJyk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGRlZmF1bHRXcml0ZXIucmVuZGVyKHRlbXBsYXRlLCB2aWV3LCBwYXJ0aWFscywgY29uZmlnKTtcbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIGVzY2FwaW5nIGZ1bmN0aW9uIHNvIHRoYXQgdGhlIHVzZXIgbWF5IG92ZXJyaWRlIGl0LlxuICAvLyBTZWUgaHR0cHM6Ly9naXRodWIuY29tL2phbmwvbXVzdGFjaGUuanMvaXNzdWVzLzI0NFxuICBtdXN0YWNoZS5lc2NhcGUgPSBlc2NhcGVIdG1sO1xuXG4gIC8vIEV4cG9ydCB0aGVzZSBtYWlubHkgZm9yIHRlc3RpbmcsIGJ1dCBhbHNvIGZvciBhZHZhbmNlZCB1c2FnZS5cbiAgbXVzdGFjaGUuU2Nhbm5lciA9IFNjYW5uZXI7XG4gIG11c3RhY2hlLkNvbnRleHQgPSBDb250ZXh0O1xuICBtdXN0YWNoZS5Xcml0ZXIgPSBXcml0ZXI7XG5cbiAgcmV0dXJuIG11c3RhY2hlO1xuXG59KSkpO1xuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjEyLjJcbihmdW5jdGlvbigpIHtcbiAgdmFyIGdldE5hbm9TZWNvbmRzLCBocnRpbWUsIGxvYWRUaW1lLCBtb2R1bGVMb2FkVGltZSwgbm9kZUxvYWRUaW1lLCB1cFRpbWU7XG5cbiAgaWYgKCh0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcGVyZm9ybWFuY2UgIT09IG51bGwpICYmIHBlcmZvcm1hbmNlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCkgJiYgcHJvY2Vzcy5ocnRpbWUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChnZXROYW5vU2Vjb25kcygpIC0gbm9kZUxvYWRUaW1lKSAvIDFlNjtcbiAgICB9O1xuICAgIGhydGltZSA9IHByb2Nlc3MuaHJ0aW1lO1xuICAgIGdldE5hbm9TZWNvbmRzID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaHI7XG4gICAgICBociA9IGhydGltZSgpO1xuICAgICAgcmV0dXJuIGhyWzBdICogMWU5ICsgaHJbMV07XG4gICAgfTtcbiAgICBtb2R1bGVMb2FkVGltZSA9IGdldE5hbm9TZWNvbmRzKCk7XG4gICAgdXBUaW1lID0gcHJvY2Vzcy51cHRpbWUoKSAqIDFlOTtcbiAgICBub2RlTG9hZFRpbWUgPSBtb2R1bGVMb2FkVGltZSAtIHVwVGltZTtcbiAgfSBlbHNlIGlmIChEYXRlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBEYXRlLm5vdygpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcblxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9cGVyZm9ybWFuY2Utbm93LmpzLm1hcFxuIiwidmFyIG5vdyA9IHJlcXVpcmUoJ3BlcmZvcm1hbmNlLW5vdycpXG4gICwgcm9vdCA9IHR5cGVvZiB3aW5kb3cgPT09ICd1bmRlZmluZWQnID8gZ2xvYmFsIDogd2luZG93XG4gICwgdmVuZG9ycyA9IFsnbW96JywgJ3dlYmtpdCddXG4gICwgc3VmZml4ID0gJ0FuaW1hdGlvbkZyYW1lJ1xuICAsIHJhZiA9IHJvb3RbJ3JlcXVlc3QnICsgc3VmZml4XVxuICAsIGNhZiA9IHJvb3RbJ2NhbmNlbCcgKyBzdWZmaXhdIHx8IHJvb3RbJ2NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxuXG5mb3IodmFyIGkgPSAwOyAhcmFmICYmIGkgPCB2ZW5kb3JzLmxlbmd0aDsgaSsrKSB7XG4gIHJhZiA9IHJvb3RbdmVuZG9yc1tpXSArICdSZXF1ZXN0JyArIHN1ZmZpeF1cbiAgY2FmID0gcm9vdFt2ZW5kb3JzW2ldICsgJ0NhbmNlbCcgKyBzdWZmaXhdXG4gICAgICB8fCByb290W3ZlbmRvcnNbaV0gKyAnQ2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG59XG5cbi8vIFNvbWUgdmVyc2lvbnMgb2YgRkYgaGF2ZSByQUYgYnV0IG5vdCBjQUZcbmlmKCFyYWYgfHwgIWNhZikge1xuICB2YXIgbGFzdCA9IDBcbiAgICAsIGlkID0gMFxuICAgICwgcXVldWUgPSBbXVxuICAgICwgZnJhbWVEdXJhdGlvbiA9IDEwMDAgLyA2MFxuXG4gIHJhZiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaWYocXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB2YXIgX25vdyA9IG5vdygpXG4gICAgICAgICwgbmV4dCA9IE1hdGgubWF4KDAsIGZyYW1lRHVyYXRpb24gLSAoX25vdyAtIGxhc3QpKVxuICAgICAgbGFzdCA9IG5leHQgKyBfbm93XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3AgPSBxdWV1ZS5zbGljZSgwKVxuICAgICAgICAvLyBDbGVhciBxdWV1ZSBoZXJlIHRvIHByZXZlbnRcbiAgICAgICAgLy8gY2FsbGJhY2tzIGZyb20gYXBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgICAvLyB0byB0aGUgY3VycmVudCBmcmFtZSdzIHF1ZXVlXG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDBcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYoIWNwW2ldLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICBjcFtpXS5jYWxsYmFjayhsYXN0KVxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRocm93IGUgfSwgMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIE1hdGgucm91bmQobmV4dCkpXG4gICAgfVxuICAgIHF1ZXVlLnB1c2goe1xuICAgICAgaGFuZGxlOiArK2lkLFxuICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgY2FuY2VsbGVkOiBmYWxzZVxuICAgIH0pXG4gICAgcmV0dXJuIGlkXG4gIH1cblxuICBjYWYgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHF1ZXVlW2ldLmhhbmRsZSA9PT0gaGFuZGxlKSB7XG4gICAgICAgIHF1ZXVlW2ldLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbikge1xuICAvLyBXcmFwIGluIGEgbmV3IGZ1bmN0aW9uIHRvIHByZXZlbnRcbiAgLy8gYGNhbmNlbGAgcG90ZW50aWFsbHkgYmVpbmcgYXNzaWduZWRcbiAgLy8gdG8gdGhlIG5hdGl2ZSByQUYgZnVuY3Rpb25cbiAgcmV0dXJuIHJhZi5jYWxsKHJvb3QsIGZuKVxufVxubW9kdWxlLmV4cG9ydHMuY2FuY2VsID0gZnVuY3Rpb24oKSB7XG4gIGNhZi5hcHBseShyb290LCBhcmd1bWVudHMpXG59XG5tb2R1bGUuZXhwb3J0cy5wb2x5ZmlsbCA9IGZ1bmN0aW9uKG9iamVjdCkge1xuICBpZiAoIW9iamVjdCkge1xuICAgIG9iamVjdCA9IHJvb3Q7XG4gIH1cbiAgb2JqZWN0LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IHJhZlxuICBvYmplY3QuY2FuY2VsQW5pbWF0aW9uRnJhbWUgPSBjYWZcbn1cbiIsIi8qXG5cdEJhc2VkIG9uIHJnYmNvbG9yLmpzIGJ5IFN0b3lhbiBTdGVmYW5vdiA8c3N0b29AZ21haWwuY29tPlxuXHRodHRwOi8vd3d3LnBocGllZC5jb20vcmdiLWNvbG9yLXBhcnNlci1pbi1qYXZhc2NyaXB0L1xuKi9cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihjb2xvcl9zdHJpbmcpIHtcbiAgICB0aGlzLm9rID0gZmFsc2U7XG4gICAgdGhpcy5hbHBoYSA9IDEuMDtcblxuICAgIC8vIHN0cmlwIGFueSBsZWFkaW5nICNcbiAgICBpZiAoY29sb3Jfc3RyaW5nLmNoYXJBdCgwKSA9PSAnIycpIHsgLy8gcmVtb3ZlICMgaWYgYW55XG4gICAgICAgIGNvbG9yX3N0cmluZyA9IGNvbG9yX3N0cmluZy5zdWJzdHIoMSw2KTtcbiAgICB9XG5cbiAgICBjb2xvcl9zdHJpbmcgPSBjb2xvcl9zdHJpbmcucmVwbGFjZSgvIC9nLCcnKTtcbiAgICBjb2xvcl9zdHJpbmcgPSBjb2xvcl9zdHJpbmcudG9Mb3dlckNhc2UoKTtcblxuICAgIC8vIGJlZm9yZSBnZXR0aW5nIGludG8gcmVnZXhwcywgdHJ5IHNpbXBsZSBtYXRjaGVzXG4gICAgLy8gYW5kIG92ZXJ3cml0ZSB0aGUgaW5wdXRcbiAgICB2YXIgc2ltcGxlX2NvbG9ycyA9IHtcbiAgICAgICAgYWxpY2VibHVlOiAnZjBmOGZmJyxcbiAgICAgICAgYW50aXF1ZXdoaXRlOiAnZmFlYmQ3JyxcbiAgICAgICAgYXF1YTogJzAwZmZmZicsXG4gICAgICAgIGFxdWFtYXJpbmU6ICc3ZmZmZDQnLFxuICAgICAgICBhenVyZTogJ2YwZmZmZicsXG4gICAgICAgIGJlaWdlOiAnZjVmNWRjJyxcbiAgICAgICAgYmlzcXVlOiAnZmZlNGM0JyxcbiAgICAgICAgYmxhY2s6ICcwMDAwMDAnLFxuICAgICAgICBibGFuY2hlZGFsbW9uZDogJ2ZmZWJjZCcsXG4gICAgICAgIGJsdWU6ICcwMDAwZmYnLFxuICAgICAgICBibHVldmlvbGV0OiAnOGEyYmUyJyxcbiAgICAgICAgYnJvd246ICdhNTJhMmEnLFxuICAgICAgICBidXJseXdvb2Q6ICdkZWI4ODcnLFxuICAgICAgICBjYWRldGJsdWU6ICc1ZjllYTAnLFxuICAgICAgICBjaGFydHJldXNlOiAnN2ZmZjAwJyxcbiAgICAgICAgY2hvY29sYXRlOiAnZDI2OTFlJyxcbiAgICAgICAgY29yYWw6ICdmZjdmNTAnLFxuICAgICAgICBjb3JuZmxvd2VyYmx1ZTogJzY0OTVlZCcsXG4gICAgICAgIGNvcm5zaWxrOiAnZmZmOGRjJyxcbiAgICAgICAgY3JpbXNvbjogJ2RjMTQzYycsXG4gICAgICAgIGN5YW46ICcwMGZmZmYnLFxuICAgICAgICBkYXJrYmx1ZTogJzAwMDA4YicsXG4gICAgICAgIGRhcmtjeWFuOiAnMDA4YjhiJyxcbiAgICAgICAgZGFya2dvbGRlbnJvZDogJ2I4ODYwYicsXG4gICAgICAgIGRhcmtncmF5OiAnYTlhOWE5JyxcbiAgICAgICAgZGFya2dyZWVuOiAnMDA2NDAwJyxcbiAgICAgICAgZGFya2toYWtpOiAnYmRiNzZiJyxcbiAgICAgICAgZGFya21hZ2VudGE6ICc4YjAwOGInLFxuICAgICAgICBkYXJrb2xpdmVncmVlbjogJzU1NmIyZicsXG4gICAgICAgIGRhcmtvcmFuZ2U6ICdmZjhjMDAnLFxuICAgICAgICBkYXJrb3JjaGlkOiAnOTkzMmNjJyxcbiAgICAgICAgZGFya3JlZDogJzhiMDAwMCcsXG4gICAgICAgIGRhcmtzYWxtb246ICdlOTk2N2EnLFxuICAgICAgICBkYXJrc2VhZ3JlZW46ICc4ZmJjOGYnLFxuICAgICAgICBkYXJrc2xhdGVibHVlOiAnNDgzZDhiJyxcbiAgICAgICAgZGFya3NsYXRlZ3JheTogJzJmNGY0ZicsXG4gICAgICAgIGRhcmt0dXJxdW9pc2U6ICcwMGNlZDEnLFxuICAgICAgICBkYXJrdmlvbGV0OiAnOTQwMGQzJyxcbiAgICAgICAgZGVlcHBpbms6ICdmZjE0OTMnLFxuICAgICAgICBkZWVwc2t5Ymx1ZTogJzAwYmZmZicsXG4gICAgICAgIGRpbWdyYXk6ICc2OTY5NjknLFxuICAgICAgICBkb2RnZXJibHVlOiAnMWU5MGZmJyxcbiAgICAgICAgZmVsZHNwYXI6ICdkMTkyNzUnLFxuICAgICAgICBmaXJlYnJpY2s6ICdiMjIyMjInLFxuICAgICAgICBmbG9yYWx3aGl0ZTogJ2ZmZmFmMCcsXG4gICAgICAgIGZvcmVzdGdyZWVuOiAnMjI4YjIyJyxcbiAgICAgICAgZnVjaHNpYTogJ2ZmMDBmZicsXG4gICAgICAgIGdhaW5zYm9ybzogJ2RjZGNkYycsXG4gICAgICAgIGdob3N0d2hpdGU6ICdmOGY4ZmYnLFxuICAgICAgICBnb2xkOiAnZmZkNzAwJyxcbiAgICAgICAgZ29sZGVucm9kOiAnZGFhNTIwJyxcbiAgICAgICAgZ3JheTogJzgwODA4MCcsXG4gICAgICAgIGdyZWVuOiAnMDA4MDAwJyxcbiAgICAgICAgZ3JlZW55ZWxsb3c6ICdhZGZmMmYnLFxuICAgICAgICBob25leWRldzogJ2YwZmZmMCcsXG4gICAgICAgIGhvdHBpbms6ICdmZjY5YjQnLFxuICAgICAgICBpbmRpYW5yZWQgOiAnY2Q1YzVjJyxcbiAgICAgICAgaW5kaWdvIDogJzRiMDA4MicsXG4gICAgICAgIGl2b3J5OiAnZmZmZmYwJyxcbiAgICAgICAga2hha2k6ICdmMGU2OGMnLFxuICAgICAgICBsYXZlbmRlcjogJ2U2ZTZmYScsXG4gICAgICAgIGxhdmVuZGVyYmx1c2g6ICdmZmYwZjUnLFxuICAgICAgICBsYXduZ3JlZW46ICc3Y2ZjMDAnLFxuICAgICAgICBsZW1vbmNoaWZmb246ICdmZmZhY2QnLFxuICAgICAgICBsaWdodGJsdWU6ICdhZGQ4ZTYnLFxuICAgICAgICBsaWdodGNvcmFsOiAnZjA4MDgwJyxcbiAgICAgICAgbGlnaHRjeWFuOiAnZTBmZmZmJyxcbiAgICAgICAgbGlnaHRnb2xkZW5yb2R5ZWxsb3c6ICdmYWZhZDInLFxuICAgICAgICBsaWdodGdyZXk6ICdkM2QzZDMnLFxuICAgICAgICBsaWdodGdyZWVuOiAnOTBlZTkwJyxcbiAgICAgICAgbGlnaHRwaW5rOiAnZmZiNmMxJyxcbiAgICAgICAgbGlnaHRzYWxtb246ICdmZmEwN2EnLFxuICAgICAgICBsaWdodHNlYWdyZWVuOiAnMjBiMmFhJyxcbiAgICAgICAgbGlnaHRza3libHVlOiAnODdjZWZhJyxcbiAgICAgICAgbGlnaHRzbGF0ZWJsdWU6ICc4NDcwZmYnLFxuICAgICAgICBsaWdodHNsYXRlZ3JheTogJzc3ODg5OScsXG4gICAgICAgIGxpZ2h0c3RlZWxibHVlOiAnYjBjNGRlJyxcbiAgICAgICAgbGlnaHR5ZWxsb3c6ICdmZmZmZTAnLFxuICAgICAgICBsaW1lOiAnMDBmZjAwJyxcbiAgICAgICAgbGltZWdyZWVuOiAnMzJjZDMyJyxcbiAgICAgICAgbGluZW46ICdmYWYwZTYnLFxuICAgICAgICBtYWdlbnRhOiAnZmYwMGZmJyxcbiAgICAgICAgbWFyb29uOiAnODAwMDAwJyxcbiAgICAgICAgbWVkaXVtYXF1YW1hcmluZTogJzY2Y2RhYScsXG4gICAgICAgIG1lZGl1bWJsdWU6ICcwMDAwY2QnLFxuICAgICAgICBtZWRpdW1vcmNoaWQ6ICdiYTU1ZDMnLFxuICAgICAgICBtZWRpdW1wdXJwbGU6ICc5MzcwZDgnLFxuICAgICAgICBtZWRpdW1zZWFncmVlbjogJzNjYjM3MScsXG4gICAgICAgIG1lZGl1bXNsYXRlYmx1ZTogJzdiNjhlZScsXG4gICAgICAgIG1lZGl1bXNwcmluZ2dyZWVuOiAnMDBmYTlhJyxcbiAgICAgICAgbWVkaXVtdHVycXVvaXNlOiAnNDhkMWNjJyxcbiAgICAgICAgbWVkaXVtdmlvbGV0cmVkOiAnYzcxNTg1JyxcbiAgICAgICAgbWlkbmlnaHRibHVlOiAnMTkxOTcwJyxcbiAgICAgICAgbWludGNyZWFtOiAnZjVmZmZhJyxcbiAgICAgICAgbWlzdHlyb3NlOiAnZmZlNGUxJyxcbiAgICAgICAgbW9jY2FzaW46ICdmZmU0YjUnLFxuICAgICAgICBuYXZham93aGl0ZTogJ2ZmZGVhZCcsXG4gICAgICAgIG5hdnk6ICcwMDAwODAnLFxuICAgICAgICBvbGRsYWNlOiAnZmRmNWU2JyxcbiAgICAgICAgb2xpdmU6ICc4MDgwMDAnLFxuICAgICAgICBvbGl2ZWRyYWI6ICc2YjhlMjMnLFxuICAgICAgICBvcmFuZ2U6ICdmZmE1MDAnLFxuICAgICAgICBvcmFuZ2VyZWQ6ICdmZjQ1MDAnLFxuICAgICAgICBvcmNoaWQ6ICdkYTcwZDYnLFxuICAgICAgICBwYWxlZ29sZGVucm9kOiAnZWVlOGFhJyxcbiAgICAgICAgcGFsZWdyZWVuOiAnOThmYjk4JyxcbiAgICAgICAgcGFsZXR1cnF1b2lzZTogJ2FmZWVlZScsXG4gICAgICAgIHBhbGV2aW9sZXRyZWQ6ICdkODcwOTMnLFxuICAgICAgICBwYXBheWF3aGlwOiAnZmZlZmQ1JyxcbiAgICAgICAgcGVhY2hwdWZmOiAnZmZkYWI5JyxcbiAgICAgICAgcGVydTogJ2NkODUzZicsXG4gICAgICAgIHBpbms6ICdmZmMwY2InLFxuICAgICAgICBwbHVtOiAnZGRhMGRkJyxcbiAgICAgICAgcG93ZGVyYmx1ZTogJ2IwZTBlNicsXG4gICAgICAgIHB1cnBsZTogJzgwMDA4MCcsXG4gICAgICAgIHJlYmVjY2FwdXJwbGU6ICc2NjMzOTknLFxuICAgICAgICByZWQ6ICdmZjAwMDAnLFxuICAgICAgICByb3N5YnJvd246ICdiYzhmOGYnLFxuICAgICAgICByb3lhbGJsdWU6ICc0MTY5ZTEnLFxuICAgICAgICBzYWRkbGVicm93bjogJzhiNDUxMycsXG4gICAgICAgIHNhbG1vbjogJ2ZhODA3MicsXG4gICAgICAgIHNhbmR5YnJvd246ICdmNGE0NjAnLFxuICAgICAgICBzZWFncmVlbjogJzJlOGI1NycsXG4gICAgICAgIHNlYXNoZWxsOiAnZmZmNWVlJyxcbiAgICAgICAgc2llbm5hOiAnYTA1MjJkJyxcbiAgICAgICAgc2lsdmVyOiAnYzBjMGMwJyxcbiAgICAgICAgc2t5Ymx1ZTogJzg3Y2VlYicsXG4gICAgICAgIHNsYXRlYmx1ZTogJzZhNWFjZCcsXG4gICAgICAgIHNsYXRlZ3JheTogJzcwODA5MCcsXG4gICAgICAgIHNub3c6ICdmZmZhZmEnLFxuICAgICAgICBzcHJpbmdncmVlbjogJzAwZmY3ZicsXG4gICAgICAgIHN0ZWVsYmx1ZTogJzQ2ODJiNCcsXG4gICAgICAgIHRhbjogJ2QyYjQ4YycsXG4gICAgICAgIHRlYWw6ICcwMDgwODAnLFxuICAgICAgICB0aGlzdGxlOiAnZDhiZmQ4JyxcbiAgICAgICAgdG9tYXRvOiAnZmY2MzQ3JyxcbiAgICAgICAgdHVycXVvaXNlOiAnNDBlMGQwJyxcbiAgICAgICAgdmlvbGV0OiAnZWU4MmVlJyxcbiAgICAgICAgdmlvbGV0cmVkOiAnZDAyMDkwJyxcbiAgICAgICAgd2hlYXQ6ICdmNWRlYjMnLFxuICAgICAgICB3aGl0ZTogJ2ZmZmZmZicsXG4gICAgICAgIHdoaXRlc21va2U6ICdmNWY1ZjUnLFxuICAgICAgICB5ZWxsb3c6ICdmZmZmMDAnLFxuICAgICAgICB5ZWxsb3dncmVlbjogJzlhY2QzMidcbiAgICB9O1xuICAgIGNvbG9yX3N0cmluZyA9IHNpbXBsZV9jb2xvcnNbY29sb3Jfc3RyaW5nXSB8fCBjb2xvcl9zdHJpbmc7XG4gICAgLy8gZW1kIG9mIHNpbXBsZSB0eXBlLWluIGNvbG9yc1xuXG4gICAgLy8gYXJyYXkgb2YgY29sb3IgZGVmaW5pdGlvbiBvYmplY3RzXG4gICAgdmFyIGNvbG9yX2RlZnMgPSBbXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJlOiAvXnJnYmFcXCgoXFxkezEsM30pLFxccyooXFxkezEsM30pLFxccyooXFxkezEsM30pLFxccyooKD86XFxkP1xcLik/XFxkKVxcKSQvLFxuICAgICAgICAgICAgZXhhbXBsZTogWydyZ2JhKDEyMywgMjM0LCA0NSwgMC44KScsICdyZ2JhKDI1NSwyMzQsMjQ1LDEuMCknXSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChiaXRzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzFdKSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1syXSksXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJpdHNbM10pLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUZsb2F0KGJpdHNbNF0pXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgICAgcmU6IC9ecmdiXFwoKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KSxcXHMqKFxcZHsxLDN9KVxcKSQvLFxuICAgICAgICAgICAgZXhhbXBsZTogWydyZ2IoMTIzLCAyMzQsIDQ1KScsICdyZ2IoMjU1LDIzNCwyNDUpJ10sXG4gICAgICAgICAgICBwcm9jZXNzOiBmdW5jdGlvbiAoYml0cyl7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1sxXSksXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJpdHNbMl0pLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzNdKVxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJlOiAvXihbMC05YS1mQS1GXXsyfSkoWzAtOWEtZkEtRl17Mn0pKFswLTlhLWZBLUZdezJ9KSQvLFxuICAgICAgICAgICAgZXhhbXBsZTogWycjMDBmZjAwJywgJzMzNjY5OSddLFxuICAgICAgICAgICAgcHJvY2VzczogZnVuY3Rpb24gKGJpdHMpe1xuICAgICAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgICAgIHBhcnNlSW50KGJpdHNbMV0sIDE2KSxcbiAgICAgICAgICAgICAgICAgICAgcGFyc2VJbnQoYml0c1syXSwgMTYpLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzNdLCAxNilcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICB7XG4gICAgICAgICAgICByZTogL14oWzAtOWEtZkEtRl17MX0pKFswLTlhLWZBLUZdezF9KShbMC05YS1mQS1GXXsxfSkkLyxcbiAgICAgICAgICAgIGV4YW1wbGU6IFsnI2ZiMCcsICdmMGYnXSxcbiAgICAgICAgICAgIHByb2Nlc3M6IGZ1bmN0aW9uIChiaXRzKXtcbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzFdICsgYml0c1sxXSwgMTYpLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzJdICsgYml0c1syXSwgMTYpLFxuICAgICAgICAgICAgICAgICAgICBwYXJzZUludChiaXRzWzNdICsgYml0c1szXSwgMTYpXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIF07XG5cbiAgICAvLyBzZWFyY2ggdGhyb3VnaCB0aGUgZGVmaW5pdGlvbnMgdG8gZmluZCBhIG1hdGNoXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xvcl9kZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciByZSA9IGNvbG9yX2RlZnNbaV0ucmU7XG4gICAgICAgIHZhciBwcm9jZXNzb3IgPSBjb2xvcl9kZWZzW2ldLnByb2Nlc3M7XG4gICAgICAgIHZhciBiaXRzID0gcmUuZXhlYyhjb2xvcl9zdHJpbmcpO1xuICAgICAgICBpZiAoYml0cykge1xuICAgICAgICAgICAgdmFyIGNoYW5uZWxzID0gcHJvY2Vzc29yKGJpdHMpO1xuICAgICAgICAgICAgdGhpcy5yID0gY2hhbm5lbHNbMF07XG4gICAgICAgICAgICB0aGlzLmcgPSBjaGFubmVsc1sxXTtcbiAgICAgICAgICAgIHRoaXMuYiA9IGNoYW5uZWxzWzJdO1xuICAgICAgICAgICAgaWYgKGNoYW5uZWxzLmxlbmd0aCA+IDMpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFscGhhID0gY2hhbm5lbHNbM107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICB0aGlzLm9rID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy8gdmFsaWRhdGUvY2xlYW51cCB2YWx1ZXNcbiAgICB0aGlzLnIgPSAodGhpcy5yIDwgMCB8fCBpc05hTih0aGlzLnIpKSA/IDAgOiAoKHRoaXMuciA+IDI1NSkgPyAyNTUgOiB0aGlzLnIpO1xuICAgIHRoaXMuZyA9ICh0aGlzLmcgPCAwIHx8IGlzTmFOKHRoaXMuZykpID8gMCA6ICgodGhpcy5nID4gMjU1KSA/IDI1NSA6IHRoaXMuZyk7XG4gICAgdGhpcy5iID0gKHRoaXMuYiA8IDAgfHwgaXNOYU4odGhpcy5iKSkgPyAwIDogKCh0aGlzLmIgPiAyNTUpID8gMjU1IDogdGhpcy5iKTtcbiAgICB0aGlzLmFscGhhID0gKHRoaXMuYWxwaGEgPCAwKSA/IDAgOiAoKHRoaXMuYWxwaGEgPiAxLjAgfHwgaXNOYU4odGhpcy5hbHBoYSkpID8gMS4wIDogdGhpcy5hbHBoYSk7XG5cbiAgICAvLyBzb21lIGdldHRlcnNcbiAgICB0aGlzLnRvUkdCID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ3JnYignICsgdGhpcy5yICsgJywgJyArIHRoaXMuZyArICcsICcgKyB0aGlzLmIgKyAnKSc7XG4gICAgfVxuICAgIHRoaXMudG9SR0JBID0gZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gJ3JnYmEoJyArIHRoaXMuciArICcsICcgKyB0aGlzLmcgKyAnLCAnICsgdGhpcy5iICsgJywgJyArIHRoaXMuYWxwaGEgKyAnKSc7XG4gICAgfVxuICAgIHRoaXMudG9IZXggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciByID0gdGhpcy5yLnRvU3RyaW5nKDE2KTtcbiAgICAgICAgdmFyIGcgPSB0aGlzLmcudG9TdHJpbmcoMTYpO1xuICAgICAgICB2YXIgYiA9IHRoaXMuYi50b1N0cmluZygxNik7XG4gICAgICAgIGlmIChyLmxlbmd0aCA9PSAxKSByID0gJzAnICsgcjtcbiAgICAgICAgaWYgKGcubGVuZ3RoID09IDEpIGcgPSAnMCcgKyBnO1xuICAgICAgICBpZiAoYi5sZW5ndGggPT0gMSkgYiA9ICcwJyArIGI7XG4gICAgICAgIHJldHVybiAnIycgKyByICsgZyArIGI7XG4gICAgfVxuXG4gICAgLy8gaGVscFxuICAgIHRoaXMuZ2V0SGVscFhNTCA9IGZ1bmN0aW9uICgpIHtcblxuICAgICAgICB2YXIgZXhhbXBsZXMgPSBuZXcgQXJyYXkoKTtcbiAgICAgICAgLy8gYWRkIHJlZ2V4cHNcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjb2xvcl9kZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgZXhhbXBsZSA9IGNvbG9yX2RlZnNbaV0uZXhhbXBsZTtcbiAgICAgICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgZXhhbXBsZS5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGV4YW1wbGVzW2V4YW1wbGVzLmxlbmd0aF0gPSBleGFtcGxlW2pdO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCB0eXBlLWluIGNvbG9yc1xuICAgICAgICBmb3IgKHZhciBzYyBpbiBzaW1wbGVfY29sb3JzKSB7XG4gICAgICAgICAgICBleGFtcGxlc1tleGFtcGxlcy5sZW5ndGhdID0gc2M7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgeG1sID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgndWwnKTtcbiAgICAgICAgeG1sLnNldEF0dHJpYnV0ZSgnaWQnLCAncmdiY29sb3ItZXhhbXBsZXMnKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBleGFtcGxlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdF9pdGVtID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnbGknKTtcbiAgICAgICAgICAgICAgICB2YXIgbGlzdF9jb2xvciA9IG5ldyBSR0JDb2xvcihleGFtcGxlc1tpXSk7XG4gICAgICAgICAgICAgICAgdmFyIGV4YW1wbGVfZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgICAgICAgICAgICAgZXhhbXBsZV9kaXYuc3R5bGUuY3NzVGV4dCA9XG4gICAgICAgICAgICAgICAgICAgICAgICAnbWFyZ2luOiAzcHg7ICdcbiAgICAgICAgICAgICAgICAgICAgICAgICsgJ2JvcmRlcjogMXB4IHNvbGlkIGJsYWNrOyAnXG4gICAgICAgICAgICAgICAgICAgICAgICArICdiYWNrZ3JvdW5kOicgKyBsaXN0X2NvbG9yLnRvSGV4KCkgKyAnOyAnXG4gICAgICAgICAgICAgICAgICAgICAgICArICdjb2xvcjonICsgbGlzdF9jb2xvci50b0hleCgpXG4gICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgIGV4YW1wbGVfZGl2LmFwcGVuZENoaWxkKGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCd0ZXN0JykpO1xuICAgICAgICAgICAgICAgIHZhciBsaXN0X2l0ZW1fdmFsdWUgPSBkb2N1bWVudC5jcmVhdGVUZXh0Tm9kZShcbiAgICAgICAgICAgICAgICAgICAgJyAnICsgZXhhbXBsZXNbaV0gKyAnIC0+ICcgKyBsaXN0X2NvbG9yLnRvUkdCKCkgKyAnIC0+ICcgKyBsaXN0X2NvbG9yLnRvSGV4KClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIGxpc3RfaXRlbS5hcHBlbmRDaGlsZChleGFtcGxlX2Rpdik7XG4gICAgICAgICAgICAgICAgbGlzdF9pdGVtLmFwcGVuZENoaWxkKGxpc3RfaXRlbV92YWx1ZSk7XG4gICAgICAgICAgICAgICAgeG1sLmFwcGVuZENoaWxkKGxpc3RfaXRlbSk7XG5cbiAgICAgICAgICAgIH0gY2F0Y2goZSl7fVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB4bWw7XG5cbiAgICB9XG5cbn1cbiIsImZ1bmN0aW9uIF90eXBlb2Yob2JqKSB7XG4gIFwiQGJhYmVsL2hlbHBlcnMgLSB0eXBlb2ZcIjtcblxuICBpZiAodHlwZW9mIFN5bWJvbCA9PT0gXCJmdW5jdGlvblwiICYmIHR5cGVvZiBTeW1ib2wuaXRlcmF0b3IgPT09IFwic3ltYm9sXCIpIHtcbiAgICBfdHlwZW9mID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfSBlbHNlIHtcbiAgICBfdHlwZW9mID0gZnVuY3Rpb24gKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiAmJiB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb2JqLmNvbnN0cnVjdG9yID09PSBTeW1ib2wgJiYgb2JqICE9PSBTeW1ib2wucHJvdG90eXBlID8gXCJzeW1ib2xcIiA6IHR5cGVvZiBvYmo7XG4gICAgfTtcbiAgfVxuXG4gIHJldHVybiBfdHlwZW9mKG9iaik7XG59XG5cbmZ1bmN0aW9uIF9jbGFzc0NhbGxDaGVjayhpbnN0YW5jZSwgQ29uc3RydWN0b3IpIHtcbiAgaWYgKCEoaW5zdGFuY2UgaW5zdGFuY2VvZiBDb25zdHJ1Y3RvcikpIHtcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQ2Fubm90IGNhbGwgYSBjbGFzcyBhcyBhIGZ1bmN0aW9uXCIpO1xuICB9XG59XG5cbi8qIGVzbGludC1kaXNhYmxlIG5vLWJpdHdpc2UgLS0gdXNlZCBmb3IgY2FsY3VsYXRpb25zICovXG5cbi8qIGVzbGludC1kaXNhYmxlIHVuaWNvcm4vcHJlZmVyLXF1ZXJ5LXNlbGVjdG9yIC0tIGFpbWluZyBhdFxuICBiYWNrd2FyZC1jb21wYXRpYmlsaXR5ICovXG5cbi8qKlxuKiBTdGFja0JsdXIgLSBhIGZhc3QgYWxtb3N0IEdhdXNzaWFuIEJsdXIgRm9yIENhbnZhc1xuKlxuKiBJbiBjYXNlIHlvdSBmaW5kIHRoaXMgY2xhc3MgdXNlZnVsIC0gZXNwZWNpYWxseSBpbiBjb21tZXJjaWFsIHByb2plY3RzIC1cbiogSSBhbSBub3QgdG90YWxseSB1bmhhcHB5IGZvciBhIHNtYWxsIGRvbmF0aW9uIHRvIG15IFBheVBhbCBhY2NvdW50XG4qIG1hcmlvQHF1YXNpbW9uZG8uZGVcbipcbiogT3Igc3VwcG9ydCBtZSBvbiBmbGF0dHI6XG4qIHtAbGluayBodHRwczovL2ZsYXR0ci5jb20vdGhpbmcvNzI3OTEvU3RhY2tCbHVyLWEtZmFzdC1hbG1vc3QtR2F1c3NpYW4tQmx1ci1FZmZlY3QtZm9yLUNhbnZhc0phdmFzY3JpcHR9LlxuKlxuKiBAbW9kdWxlIFN0YWNrQmx1clxuKiBAYXV0aG9yIE1hcmlvIEtsaW5nZW1hbm5cbiogQ29udGFjdDogbWFyaW9AcXVhc2ltb25kby5jb21cbiogV2Vic2l0ZToge0BsaW5rIGh0dHA6Ly93d3cucXVhc2ltb25kby5jb20vU3RhY2tCbHVyRm9yQ2FudmFzL1N0YWNrQmx1ckRlbW8uaHRtbH1cbiogVHdpdHRlcjogQHF1YXNpbW9uZG9cbipcbiogQGNvcHlyaWdodCAoYykgMjAxMCBNYXJpbyBLbGluZ2VtYW5uXG4qXG4qIFBlcm1pc3Npb24gaXMgaGVyZWJ5IGdyYW50ZWQsIGZyZWUgb2YgY2hhcmdlLCB0byBhbnkgcGVyc29uXG4qIG9idGFpbmluZyBhIGNvcHkgb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uXG4qIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxuKiByZXN0cmljdGlvbiwgaW5jbHVkaW5nIHdpdGhvdXQgbGltaXRhdGlvbiB0aGUgcmlnaHRzIHRvIHVzZSxcbiogY29weSwgbW9kaWZ5LCBtZXJnZSwgcHVibGlzaCwgZGlzdHJpYnV0ZSwgc3VibGljZW5zZSwgYW5kL29yIHNlbGxcbiogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG4qIFNvZnR3YXJlIGlzIGZ1cm5pc2hlZCB0byBkbyBzbywgc3ViamVjdCB0byB0aGUgZm9sbG93aW5nXG4qIGNvbmRpdGlvbnM6XG4qXG4qIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlXG4qIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuKlxuKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELFxuKiBFWFBSRVNTIE9SIElNUExJRUQsIElOQ0xVRElORyBCVVQgTk9UIExJTUlURUQgVE8gVEhFIFdBUlJBTlRJRVNcbiogT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbiogTk9OSU5GUklOR0VNRU5ULiBJTiBOTyBFVkVOVCBTSEFMTCBUSEUgQVVUSE9SUyBPUiBDT1BZUklHSFRcbiogSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUiBMSUFCSUxJVFksXG4qIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuKiBGUk9NLCBPVVQgT0YgT1IgSU4gQ09OTkVDVElPTiBXSVRIIFRIRSBTT0ZUV0FSRSBPUiBUSEUgVVNFIE9SXG4qIE9USEVSIERFQUxJTkdTIElOIFRIRSBTT0ZUV0FSRS5cbiovXG52YXIgbXVsVGFibGUgPSBbNTEyLCA1MTIsIDQ1NiwgNTEyLCAzMjgsIDQ1NiwgMzM1LCA1MTIsIDQwNSwgMzI4LCAyNzEsIDQ1NiwgMzg4LCAzMzUsIDI5MiwgNTEyLCA0NTQsIDQwNSwgMzY0LCAzMjgsIDI5OCwgMjcxLCA0OTYsIDQ1NiwgNDIwLCAzODgsIDM2MCwgMzM1LCAzMTIsIDI5MiwgMjczLCA1MTIsIDQ4MiwgNDU0LCA0MjgsIDQwNSwgMzgzLCAzNjQsIDM0NSwgMzI4LCAzMTIsIDI5OCwgMjg0LCAyNzEsIDI1OSwgNDk2LCA0NzUsIDQ1NiwgNDM3LCA0MjAsIDQwNCwgMzg4LCAzNzQsIDM2MCwgMzQ3LCAzMzUsIDMyMywgMzEyLCAzMDIsIDI5MiwgMjgyLCAyNzMsIDI2NSwgNTEyLCA0OTcsIDQ4MiwgNDY4LCA0NTQsIDQ0MSwgNDI4LCA0MTcsIDQwNSwgMzk0LCAzODMsIDM3MywgMzY0LCAzNTQsIDM0NSwgMzM3LCAzMjgsIDMyMCwgMzEyLCAzMDUsIDI5OCwgMjkxLCAyODQsIDI3OCwgMjcxLCAyNjUsIDI1OSwgNTA3LCA0OTYsIDQ4NSwgNDc1LCA0NjUsIDQ1NiwgNDQ2LCA0MzcsIDQyOCwgNDIwLCA0MTIsIDQwNCwgMzk2LCAzODgsIDM4MSwgMzc0LCAzNjcsIDM2MCwgMzU0LCAzNDcsIDM0MSwgMzM1LCAzMjksIDMyMywgMzE4LCAzMTIsIDMwNywgMzAyLCAyOTcsIDI5MiwgMjg3LCAyODIsIDI3OCwgMjczLCAyNjksIDI2NSwgMjYxLCA1MTIsIDUwNSwgNDk3LCA0ODksIDQ4MiwgNDc1LCA0NjgsIDQ2MSwgNDU0LCA0NDcsIDQ0MSwgNDM1LCA0MjgsIDQyMiwgNDE3LCA0MTEsIDQwNSwgMzk5LCAzOTQsIDM4OSwgMzgzLCAzNzgsIDM3MywgMzY4LCAzNjQsIDM1OSwgMzU0LCAzNTAsIDM0NSwgMzQxLCAzMzcsIDMzMiwgMzI4LCAzMjQsIDMyMCwgMzE2LCAzMTIsIDMwOSwgMzA1LCAzMDEsIDI5OCwgMjk0LCAyOTEsIDI4NywgMjg0LCAyODEsIDI3OCwgMjc0LCAyNzEsIDI2OCwgMjY1LCAyNjIsIDI1OSwgMjU3LCA1MDcsIDUwMSwgNDk2LCA0OTEsIDQ4NSwgNDgwLCA0NzUsIDQ3MCwgNDY1LCA0NjAsIDQ1NiwgNDUxLCA0NDYsIDQ0MiwgNDM3LCA0MzMsIDQyOCwgNDI0LCA0MjAsIDQxNiwgNDEyLCA0MDgsIDQwNCwgNDAwLCAzOTYsIDM5MiwgMzg4LCAzODUsIDM4MSwgMzc3LCAzNzQsIDM3MCwgMzY3LCAzNjMsIDM2MCwgMzU3LCAzNTQsIDM1MCwgMzQ3LCAzNDQsIDM0MSwgMzM4LCAzMzUsIDMzMiwgMzI5LCAzMjYsIDMyMywgMzIwLCAzMTgsIDMxNSwgMzEyLCAzMTAsIDMwNywgMzA0LCAzMDIsIDI5OSwgMjk3LCAyOTQsIDI5MiwgMjg5LCAyODcsIDI4NSwgMjgyLCAyODAsIDI3OCwgMjc1LCAyNzMsIDI3MSwgMjY5LCAyNjcsIDI2NSwgMjYzLCAyNjEsIDI1OV07XG52YXIgc2hnVGFibGUgPSBbOSwgMTEsIDEyLCAxMywgMTMsIDE0LCAxNCwgMTUsIDE1LCAxNSwgMTUsIDE2LCAxNiwgMTYsIDE2LCAxNywgMTcsIDE3LCAxNywgMTcsIDE3LCAxNywgMTgsIDE4LCAxOCwgMTgsIDE4LCAxOCwgMTgsIDE4LCAxOCwgMTksIDE5LCAxOSwgMTksIDE5LCAxOSwgMTksIDE5LCAxOSwgMTksIDE5LCAxOSwgMTksIDE5LCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMCwgMjAsIDIwLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMSwgMjEsIDIxLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjIsIDIyLCAyMiwgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjMsIDIzLCAyMywgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0LCAyNCwgMjQsIDI0XTtcbi8qKlxuICogQHBhcmFtIHtzdHJpbmd8SFRNTEltYWdlRWxlbWVudH0gaW1nXG4gKiBAcGFyYW0ge3N0cmluZ3xIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXG4gKiBAcGFyYW0ge0Zsb2F0fSByYWRpdXNcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gYmx1ckFscGhhQ2hhbm5lbFxuICogQHBhcmFtIHtib29sZWFufSB1c2VPZmZzZXRcbiAqIEBwYXJhbSB7Ym9vbGVhbn0gc2tpcFN0eWxlc1xuICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAqL1xuXG5mdW5jdGlvbiBwcm9jZXNzSW1hZ2UoaW1nLCBjYW52YXMsIHJhZGl1cywgYmx1ckFscGhhQ2hhbm5lbCwgdXNlT2Zmc2V0LCBza2lwU3R5bGVzKSB7XG4gIGlmICh0eXBlb2YgaW1nID09PSAnc3RyaW5nJykge1xuICAgIGltZyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKGltZyk7XG4gIH1cblxuICBpZiAoIWltZyB8fCAhKCduYXR1cmFsV2lkdGgnIGluIGltZykpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZGltZW5zaW9uVHlwZSA9IHVzZU9mZnNldCA/ICdvZmZzZXQnIDogJ25hdHVyYWwnO1xuICB2YXIgdyA9IGltZ1tkaW1lbnNpb25UeXBlICsgJ1dpZHRoJ107XG4gIHZhciBoID0gaW1nW2RpbWVuc2lvblR5cGUgKyAnSGVpZ2h0J107XG5cbiAgaWYgKHR5cGVvZiBjYW52YXMgPT09ICdzdHJpbmcnKSB7XG4gICAgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzKTtcbiAgfVxuXG4gIGlmICghY2FudmFzIHx8ICEoJ2dldENvbnRleHQnIGluIGNhbnZhcykpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoIXNraXBTdHlsZXMpIHtcbiAgICBjYW52YXMuc3R5bGUud2lkdGggPSB3ICsgJ3B4JztcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gaCArICdweCc7XG4gIH1cblxuICBjYW52YXMud2lkdGggPSB3O1xuICBjYW52YXMuaGVpZ2h0ID0gaDtcbiAgdmFyIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgdywgaCk7XG4gIGNvbnRleHQuZHJhd0ltYWdlKGltZywgMCwgMCwgaW1nLm5hdHVyYWxXaWR0aCwgaW1nLm5hdHVyYWxIZWlnaHQsIDAsIDAsIHcsIGgpO1xuXG4gIGlmIChpc05hTihyYWRpdXMpIHx8IHJhZGl1cyA8IDEpIHtcbiAgICByZXR1cm47XG4gIH1cblxuICBpZiAoYmx1ckFscGhhQ2hhbm5lbCkge1xuICAgIHByb2Nlc3NDYW52YXNSR0JBKGNhbnZhcywgMCwgMCwgdywgaCwgcmFkaXVzKTtcbiAgfSBlbHNlIHtcbiAgICBwcm9jZXNzQ2FudmFzUkdCKGNhbnZhcywgMCwgMCwgdywgaCwgcmFkaXVzKTtcbiAgfVxufVxuLyoqXG4gKiBAcGFyYW0ge3N0cmluZ3xIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHRvcFhcbiAqIEBwYXJhbSB7SW50ZWdlcn0gdG9wWVxuICogQHBhcmFtIHtJbnRlZ2VyfSB3aWR0aFxuICogQHBhcmFtIHtJbnRlZ2VyfSBoZWlnaHRcbiAqIEB0aHJvd3Mge0Vycm9yfFR5cGVFcnJvcn1cbiAqIEByZXR1cm5zIHtJbWFnZURhdGF9IFNlZSB7QGxpbmsgaHR0cHM6Ly9odG1sLnNwZWMud2hhdHdnLm9yZy9tdWx0aXBhZ2UvY2FudmFzLmh0bWwjaW1hZ2VkYXRhfVxuICovXG5cblxuZnVuY3Rpb24gZ2V0SW1hZ2VEYXRhRnJvbUNhbnZhcyhjYW52YXMsIHRvcFgsIHRvcFksIHdpZHRoLCBoZWlnaHQpIHtcbiAgaWYgKHR5cGVvZiBjYW52YXMgPT09ICdzdHJpbmcnKSB7XG4gICAgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoY2FudmFzKTtcbiAgfVxuXG4gIGlmICghY2FudmFzIHx8IF90eXBlb2YoY2FudmFzKSAhPT0gJ29iamVjdCcgfHwgISgnZ2V0Q29udGV4dCcgaW4gY2FudmFzKSkge1xuICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0V4cGVjdGluZyBjYW52YXMgd2l0aCBgZ2V0Q29udGV4dGAgbWV0aG9kICcgKyAnaW4gcHJvY2Vzc0NhbnZhc1JHQihBKSBjYWxscyEnKTtcbiAgfVxuXG4gIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG5cbiAgdHJ5IHtcbiAgICByZXR1cm4gY29udGV4dC5nZXRJbWFnZURhdGEodG9wWCwgdG9wWSwgd2lkdGgsIGhlaWdodCk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3VuYWJsZSB0byBhY2Nlc3MgaW1hZ2UgZGF0YTogJyArIGUpO1xuICB9XG59XG4vKipcbiAqIEBwYXJhbSB7SFRNTENhbnZhc0VsZW1lbnR9IGNhbnZhc1xuICogQHBhcmFtIHtJbnRlZ2VyfSB0b3BYXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHRvcFlcbiAqIEBwYXJhbSB7SW50ZWdlcn0gd2lkdGhcbiAqIEBwYXJhbSB7SW50ZWdlcn0gaGVpZ2h0XG4gKiBAcGFyYW0ge0Zsb2F0fSByYWRpdXNcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR9XG4gKi9cblxuXG5mdW5jdGlvbiBwcm9jZXNzQ2FudmFzUkdCQShjYW52YXMsIHRvcFgsIHRvcFksIHdpZHRoLCBoZWlnaHQsIHJhZGl1cykge1xuICBpZiAoaXNOYU4ocmFkaXVzKSB8fCByYWRpdXMgPCAxKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgcmFkaXVzIHw9IDA7XG4gIHZhciBpbWFnZURhdGEgPSBnZXRJbWFnZURhdGFGcm9tQ2FudmFzKGNhbnZhcywgdG9wWCwgdG9wWSwgd2lkdGgsIGhlaWdodCk7XG4gIGltYWdlRGF0YSA9IHByb2Nlc3NJbWFnZURhdGFSR0JBKGltYWdlRGF0YSwgdG9wWCwgdG9wWSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzKTtcbiAgY2FudmFzLmdldENvbnRleHQoJzJkJykucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgdG9wWCwgdG9wWSk7XG59XG4vKipcbiAqIEBwYXJhbSB7SW1hZ2VEYXRhfSBpbWFnZURhdGFcbiAqIEBwYXJhbSB7SW50ZWdlcn0gdG9wWFxuICogQHBhcmFtIHtJbnRlZ2VyfSB0b3BZXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGhlaWdodFxuICogQHBhcmFtIHtGbG9hdH0gcmFkaXVzXG4gKiBAcmV0dXJucyB7SW1hZ2VEYXRhfVxuICovXG5cblxuZnVuY3Rpb24gcHJvY2Vzc0ltYWdlRGF0YVJHQkEoaW1hZ2VEYXRhLCB0b3BYLCB0b3BZLCB3aWR0aCwgaGVpZ2h0LCByYWRpdXMpIHtcbiAgdmFyIHBpeGVscyA9IGltYWdlRGF0YS5kYXRhO1xuICB2YXIgZGl2ID0gMiAqIHJhZGl1cyArIDE7IC8vIGNvbnN0IHc0ID0gd2lkdGggPDwgMjtcblxuICB2YXIgd2lkdGhNaW51czEgPSB3aWR0aCAtIDE7XG4gIHZhciBoZWlnaHRNaW51czEgPSBoZWlnaHQgLSAxO1xuICB2YXIgcmFkaXVzUGx1czEgPSByYWRpdXMgKyAxO1xuICB2YXIgc3VtRmFjdG9yID0gcmFkaXVzUGx1czEgKiAocmFkaXVzUGx1czEgKyAxKSAvIDI7XG4gIHZhciBzdGFja1N0YXJ0ID0gbmV3IEJsdXJTdGFjaygpO1xuICB2YXIgc3RhY2sgPSBzdGFja1N0YXJ0O1xuICB2YXIgc3RhY2tFbmQ7XG5cbiAgZm9yICh2YXIgaSA9IDE7IGkgPCBkaXY7IGkrKykge1xuICAgIHN0YWNrID0gc3RhY2submV4dCA9IG5ldyBCbHVyU3RhY2soKTtcblxuICAgIGlmIChpID09PSByYWRpdXNQbHVzMSkge1xuICAgICAgc3RhY2tFbmQgPSBzdGFjaztcbiAgICB9XG4gIH1cblxuICBzdGFjay5uZXh0ID0gc3RhY2tTdGFydDtcbiAgdmFyIHN0YWNrSW4gPSBudWxsLFxuICAgICAgc3RhY2tPdXQgPSBudWxsLFxuICAgICAgeXcgPSAwLFxuICAgICAgeWkgPSAwO1xuICB2YXIgbXVsU3VtID0gbXVsVGFibGVbcmFkaXVzXTtcbiAgdmFyIHNoZ1N1bSA9IHNoZ1RhYmxlW3JhZGl1c107XG5cbiAgZm9yICh2YXIgeSA9IDA7IHkgPCBoZWlnaHQ7IHkrKykge1xuICAgIHN0YWNrID0gc3RhY2tTdGFydDtcbiAgICB2YXIgcHIgPSBwaXhlbHNbeWldLFxuICAgICAgICBwZyA9IHBpeGVsc1t5aSArIDFdLFxuICAgICAgICBwYiA9IHBpeGVsc1t5aSArIDJdLFxuICAgICAgICBwYSA9IHBpeGVsc1t5aSArIDNdO1xuXG4gICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IHJhZGl1c1BsdXMxOyBfaSsrKSB7XG4gICAgICBzdGFjay5yID0gcHI7XG4gICAgICBzdGFjay5nID0gcGc7XG4gICAgICBzdGFjay5iID0gcGI7XG4gICAgICBzdGFjay5hID0gcGE7XG4gICAgICBzdGFjayA9IHN0YWNrLm5leHQ7XG4gICAgfVxuXG4gICAgdmFyIHJJblN1bSA9IDAsXG4gICAgICAgIGdJblN1bSA9IDAsXG4gICAgICAgIGJJblN1bSA9IDAsXG4gICAgICAgIGFJblN1bSA9IDAsXG4gICAgICAgIHJPdXRTdW0gPSByYWRpdXNQbHVzMSAqIHByLFxuICAgICAgICBnT3V0U3VtID0gcmFkaXVzUGx1czEgKiBwZyxcbiAgICAgICAgYk91dFN1bSA9IHJhZGl1c1BsdXMxICogcGIsXG4gICAgICAgIGFPdXRTdW0gPSByYWRpdXNQbHVzMSAqIHBhLFxuICAgICAgICByU3VtID0gc3VtRmFjdG9yICogcHIsXG4gICAgICAgIGdTdW0gPSBzdW1GYWN0b3IgKiBwZyxcbiAgICAgICAgYlN1bSA9IHN1bUZhY3RvciAqIHBiLFxuICAgICAgICBhU3VtID0gc3VtRmFjdG9yICogcGE7XG5cbiAgICBmb3IgKHZhciBfaTIgPSAxOyBfaTIgPCByYWRpdXNQbHVzMTsgX2kyKyspIHtcbiAgICAgIHZhciBwID0geWkgKyAoKHdpZHRoTWludXMxIDwgX2kyID8gd2lkdGhNaW51czEgOiBfaTIpIDw8IDIpO1xuICAgICAgdmFyIHIgPSBwaXhlbHNbcF0sXG4gICAgICAgICAgZyA9IHBpeGVsc1twICsgMV0sXG4gICAgICAgICAgYiA9IHBpeGVsc1twICsgMl0sXG4gICAgICAgICAgYSA9IHBpeGVsc1twICsgM107XG4gICAgICB2YXIgcmJzID0gcmFkaXVzUGx1czEgLSBfaTI7XG4gICAgICByU3VtICs9IChzdGFjay5yID0gcikgKiByYnM7XG4gICAgICBnU3VtICs9IChzdGFjay5nID0gZykgKiByYnM7XG4gICAgICBiU3VtICs9IChzdGFjay5iID0gYikgKiByYnM7XG4gICAgICBhU3VtICs9IChzdGFjay5hID0gYSkgKiByYnM7XG4gICAgICBySW5TdW0gKz0gcjtcbiAgICAgIGdJblN1bSArPSBnO1xuICAgICAgYkluU3VtICs9IGI7XG4gICAgICBhSW5TdW0gKz0gYTtcbiAgICAgIHN0YWNrID0gc3RhY2submV4dDtcbiAgICB9XG5cbiAgICBzdGFja0luID0gc3RhY2tTdGFydDtcbiAgICBzdGFja091dCA9IHN0YWNrRW5kO1xuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICB2YXIgcGFJbml0aWFsID0gYVN1bSAqIG11bFN1bSA+PiBzaGdTdW07XG4gICAgICBwaXhlbHNbeWkgKyAzXSA9IHBhSW5pdGlhbDtcblxuICAgICAgaWYgKHBhSW5pdGlhbCAhPT0gMCkge1xuICAgICAgICB2YXIgX2EyID0gMjU1IC8gcGFJbml0aWFsO1xuXG4gICAgICAgIHBpeGVsc1t5aV0gPSAoclN1bSAqIG11bFN1bSA+PiBzaGdTdW0pICogX2EyO1xuICAgICAgICBwaXhlbHNbeWkgKyAxXSA9IChnU3VtICogbXVsU3VtID4+IHNoZ1N1bSkgKiBfYTI7XG4gICAgICAgIHBpeGVsc1t5aSArIDJdID0gKGJTdW0gKiBtdWxTdW0gPj4gc2hnU3VtKSAqIF9hMjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpeGVsc1t5aV0gPSBwaXhlbHNbeWkgKyAxXSA9IHBpeGVsc1t5aSArIDJdID0gMDtcbiAgICAgIH1cblxuICAgICAgclN1bSAtPSByT3V0U3VtO1xuICAgICAgZ1N1bSAtPSBnT3V0U3VtO1xuICAgICAgYlN1bSAtPSBiT3V0U3VtO1xuICAgICAgYVN1bSAtPSBhT3V0U3VtO1xuICAgICAgck91dFN1bSAtPSBzdGFja0luLnI7XG4gICAgICBnT3V0U3VtIC09IHN0YWNrSW4uZztcbiAgICAgIGJPdXRTdW0gLT0gc3RhY2tJbi5iO1xuICAgICAgYU91dFN1bSAtPSBzdGFja0luLmE7XG5cbiAgICAgIHZhciBfcCA9IHggKyByYWRpdXMgKyAxO1xuXG4gICAgICBfcCA9IHl3ICsgKF9wIDwgd2lkdGhNaW51czEgPyBfcCA6IHdpZHRoTWludXMxKSA8PCAyO1xuICAgICAgckluU3VtICs9IHN0YWNrSW4uciA9IHBpeGVsc1tfcF07XG4gICAgICBnSW5TdW0gKz0gc3RhY2tJbi5nID0gcGl4ZWxzW19wICsgMV07XG4gICAgICBiSW5TdW0gKz0gc3RhY2tJbi5iID0gcGl4ZWxzW19wICsgMl07XG4gICAgICBhSW5TdW0gKz0gc3RhY2tJbi5hID0gcGl4ZWxzW19wICsgM107XG4gICAgICByU3VtICs9IHJJblN1bTtcbiAgICAgIGdTdW0gKz0gZ0luU3VtO1xuICAgICAgYlN1bSArPSBiSW5TdW07XG4gICAgICBhU3VtICs9IGFJblN1bTtcbiAgICAgIHN0YWNrSW4gPSBzdGFja0luLm5leHQ7XG4gICAgICB2YXIgX3N0YWNrT3V0ID0gc3RhY2tPdXQsXG4gICAgICAgICAgX3IgPSBfc3RhY2tPdXQucixcbiAgICAgICAgICBfZyA9IF9zdGFja091dC5nLFxuICAgICAgICAgIF9iID0gX3N0YWNrT3V0LmIsXG4gICAgICAgICAgX2EgPSBfc3RhY2tPdXQuYTtcbiAgICAgIHJPdXRTdW0gKz0gX3I7XG4gICAgICBnT3V0U3VtICs9IF9nO1xuICAgICAgYk91dFN1bSArPSBfYjtcbiAgICAgIGFPdXRTdW0gKz0gX2E7XG4gICAgICBySW5TdW0gLT0gX3I7XG4gICAgICBnSW5TdW0gLT0gX2c7XG4gICAgICBiSW5TdW0gLT0gX2I7XG4gICAgICBhSW5TdW0gLT0gX2E7XG4gICAgICBzdGFja091dCA9IHN0YWNrT3V0Lm5leHQ7XG4gICAgICB5aSArPSA0O1xuICAgIH1cblxuICAgIHl3ICs9IHdpZHRoO1xuICB9XG5cbiAgZm9yICh2YXIgX3ggPSAwOyBfeCA8IHdpZHRoOyBfeCsrKSB7XG4gICAgeWkgPSBfeCA8PCAyO1xuXG4gICAgdmFyIF9wciA9IHBpeGVsc1t5aV0sXG4gICAgICAgIF9wZyA9IHBpeGVsc1t5aSArIDFdLFxuICAgICAgICBfcGIgPSBwaXhlbHNbeWkgKyAyXSxcbiAgICAgICAgX3BhID0gcGl4ZWxzW3lpICsgM10sXG4gICAgICAgIF9yT3V0U3VtID0gcmFkaXVzUGx1czEgKiBfcHIsXG4gICAgICAgIF9nT3V0U3VtID0gcmFkaXVzUGx1czEgKiBfcGcsXG4gICAgICAgIF9iT3V0U3VtID0gcmFkaXVzUGx1czEgKiBfcGIsXG4gICAgICAgIF9hT3V0U3VtID0gcmFkaXVzUGx1czEgKiBfcGEsXG4gICAgICAgIF9yU3VtID0gc3VtRmFjdG9yICogX3ByLFxuICAgICAgICBfZ1N1bSA9IHN1bUZhY3RvciAqIF9wZyxcbiAgICAgICAgX2JTdW0gPSBzdW1GYWN0b3IgKiBfcGIsXG4gICAgICAgIF9hU3VtID0gc3VtRmFjdG9yICogX3BhO1xuXG4gICAgc3RhY2sgPSBzdGFja1N0YXJ0O1xuXG4gICAgZm9yICh2YXIgX2kzID0gMDsgX2kzIDwgcmFkaXVzUGx1czE7IF9pMysrKSB7XG4gICAgICBzdGFjay5yID0gX3ByO1xuICAgICAgc3RhY2suZyA9IF9wZztcbiAgICAgIHN0YWNrLmIgPSBfcGI7XG4gICAgICBzdGFjay5hID0gX3BhO1xuICAgICAgc3RhY2sgPSBzdGFjay5uZXh0O1xuICAgIH1cblxuICAgIHZhciB5cCA9IHdpZHRoO1xuICAgIHZhciBfZ0luU3VtID0gMCxcbiAgICAgICAgX2JJblN1bSA9IDAsXG4gICAgICAgIF9hSW5TdW0gPSAwLFxuICAgICAgICBfckluU3VtID0gMDtcblxuICAgIGZvciAodmFyIF9pNCA9IDE7IF9pNCA8PSByYWRpdXM7IF9pNCsrKSB7XG4gICAgICB5aSA9IHlwICsgX3ggPDwgMjtcblxuICAgICAgdmFyIF9yYnMgPSByYWRpdXNQbHVzMSAtIF9pNDtcblxuICAgICAgX3JTdW0gKz0gKHN0YWNrLnIgPSBfcHIgPSBwaXhlbHNbeWldKSAqIF9yYnM7XG4gICAgICBfZ1N1bSArPSAoc3RhY2suZyA9IF9wZyA9IHBpeGVsc1t5aSArIDFdKSAqIF9yYnM7XG4gICAgICBfYlN1bSArPSAoc3RhY2suYiA9IF9wYiA9IHBpeGVsc1t5aSArIDJdKSAqIF9yYnM7XG4gICAgICBfYVN1bSArPSAoc3RhY2suYSA9IF9wYSA9IHBpeGVsc1t5aSArIDNdKSAqIF9yYnM7XG4gICAgICBfckluU3VtICs9IF9wcjtcbiAgICAgIF9nSW5TdW0gKz0gX3BnO1xuICAgICAgX2JJblN1bSArPSBfcGI7XG4gICAgICBfYUluU3VtICs9IF9wYTtcbiAgICAgIHN0YWNrID0gc3RhY2submV4dDtcblxuICAgICAgaWYgKF9pNCA8IGhlaWdodE1pbnVzMSkge1xuICAgICAgICB5cCArPSB3aWR0aDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB5aSA9IF94O1xuICAgIHN0YWNrSW4gPSBzdGFja1N0YXJ0O1xuICAgIHN0YWNrT3V0ID0gc3RhY2tFbmQ7XG5cbiAgICBmb3IgKHZhciBfeSA9IDA7IF95IDwgaGVpZ2h0OyBfeSsrKSB7XG4gICAgICB2YXIgX3AyID0geWkgPDwgMjtcblxuICAgICAgcGl4ZWxzW19wMiArIDNdID0gX3BhID0gX2FTdW0gKiBtdWxTdW0gPj4gc2hnU3VtO1xuXG4gICAgICBpZiAoX3BhID4gMCkge1xuICAgICAgICBfcGEgPSAyNTUgLyBfcGE7XG4gICAgICAgIHBpeGVsc1tfcDJdID0gKF9yU3VtICogbXVsU3VtID4+IHNoZ1N1bSkgKiBfcGE7XG4gICAgICAgIHBpeGVsc1tfcDIgKyAxXSA9IChfZ1N1bSAqIG11bFN1bSA+PiBzaGdTdW0pICogX3BhO1xuICAgICAgICBwaXhlbHNbX3AyICsgMl0gPSAoX2JTdW0gKiBtdWxTdW0gPj4gc2hnU3VtKSAqIF9wYTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpeGVsc1tfcDJdID0gcGl4ZWxzW19wMiArIDFdID0gcGl4ZWxzW19wMiArIDJdID0gMDtcbiAgICAgIH1cblxuICAgICAgX3JTdW0gLT0gX3JPdXRTdW07XG4gICAgICBfZ1N1bSAtPSBfZ091dFN1bTtcbiAgICAgIF9iU3VtIC09IF9iT3V0U3VtO1xuICAgICAgX2FTdW0gLT0gX2FPdXRTdW07XG4gICAgICBfck91dFN1bSAtPSBzdGFja0luLnI7XG4gICAgICBfZ091dFN1bSAtPSBzdGFja0luLmc7XG4gICAgICBfYk91dFN1bSAtPSBzdGFja0luLmI7XG4gICAgICBfYU91dFN1bSAtPSBzdGFja0luLmE7XG4gICAgICBfcDIgPSBfeCArICgoX3AyID0gX3kgKyByYWRpdXNQbHVzMSkgPCBoZWlnaHRNaW51czEgPyBfcDIgOiBoZWlnaHRNaW51czEpICogd2lkdGggPDwgMjtcbiAgICAgIF9yU3VtICs9IF9ySW5TdW0gKz0gc3RhY2tJbi5yID0gcGl4ZWxzW19wMl07XG4gICAgICBfZ1N1bSArPSBfZ0luU3VtICs9IHN0YWNrSW4uZyA9IHBpeGVsc1tfcDIgKyAxXTtcbiAgICAgIF9iU3VtICs9IF9iSW5TdW0gKz0gc3RhY2tJbi5iID0gcGl4ZWxzW19wMiArIDJdO1xuICAgICAgX2FTdW0gKz0gX2FJblN1bSArPSBzdGFja0luLmEgPSBwaXhlbHNbX3AyICsgM107XG4gICAgICBzdGFja0luID0gc3RhY2tJbi5uZXh0O1xuICAgICAgX3JPdXRTdW0gKz0gX3ByID0gc3RhY2tPdXQucjtcbiAgICAgIF9nT3V0U3VtICs9IF9wZyA9IHN0YWNrT3V0Lmc7XG4gICAgICBfYk91dFN1bSArPSBfcGIgPSBzdGFja091dC5iO1xuICAgICAgX2FPdXRTdW0gKz0gX3BhID0gc3RhY2tPdXQuYTtcbiAgICAgIF9ySW5TdW0gLT0gX3ByO1xuICAgICAgX2dJblN1bSAtPSBfcGc7XG4gICAgICBfYkluU3VtIC09IF9wYjtcbiAgICAgIF9hSW5TdW0gLT0gX3BhO1xuICAgICAgc3RhY2tPdXQgPSBzdGFja091dC5uZXh0O1xuICAgICAgeWkgKz0gd2lkdGg7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIGltYWdlRGF0YTtcbn1cbi8qKlxuICogQHBhcmFtIHtIVE1MQ2FudmFzRWxlbWVudH0gY2FudmFzXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHRvcFhcbiAqIEBwYXJhbSB7SW50ZWdlcn0gdG9wWVxuICogQHBhcmFtIHtJbnRlZ2VyfSB3aWR0aFxuICogQHBhcmFtIHtJbnRlZ2VyfSBoZWlnaHRcbiAqIEBwYXJhbSB7RmxvYXR9IHJhZGl1c1xuICogQHJldHVybnMge3VuZGVmaW5lZH1cbiAqL1xuXG5cbmZ1bmN0aW9uIHByb2Nlc3NDYW52YXNSR0IoY2FudmFzLCB0b3BYLCB0b3BZLCB3aWR0aCwgaGVpZ2h0LCByYWRpdXMpIHtcbiAgaWYgKGlzTmFOKHJhZGl1cykgfHwgcmFkaXVzIDwgMSkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJhZGl1cyB8PSAwO1xuICB2YXIgaW1hZ2VEYXRhID0gZ2V0SW1hZ2VEYXRhRnJvbUNhbnZhcyhjYW52YXMsIHRvcFgsIHRvcFksIHdpZHRoLCBoZWlnaHQpO1xuICBpbWFnZURhdGEgPSBwcm9jZXNzSW1hZ2VEYXRhUkdCKGltYWdlRGF0YSwgdG9wWCwgdG9wWSwgd2lkdGgsIGhlaWdodCwgcmFkaXVzKTtcbiAgY2FudmFzLmdldENvbnRleHQoJzJkJykucHV0SW1hZ2VEYXRhKGltYWdlRGF0YSwgdG9wWCwgdG9wWSk7XG59XG4vKipcbiAqIEBwYXJhbSB7SW1hZ2VEYXRhfSBpbWFnZURhdGFcbiAqIEBwYXJhbSB7SW50ZWdlcn0gdG9wWFxuICogQHBhcmFtIHtJbnRlZ2VyfSB0b3BZXG4gKiBAcGFyYW0ge0ludGVnZXJ9IHdpZHRoXG4gKiBAcGFyYW0ge0ludGVnZXJ9IGhlaWdodFxuICogQHBhcmFtIHtGbG9hdH0gcmFkaXVzXG4gKiBAcmV0dXJucyB7SW1hZ2VEYXRhfVxuICovXG5cblxuZnVuY3Rpb24gcHJvY2Vzc0ltYWdlRGF0YVJHQihpbWFnZURhdGEsIHRvcFgsIHRvcFksIHdpZHRoLCBoZWlnaHQsIHJhZGl1cykge1xuICB2YXIgcGl4ZWxzID0gaW1hZ2VEYXRhLmRhdGE7XG4gIHZhciBkaXYgPSAyICogcmFkaXVzICsgMTsgLy8gY29uc3QgdzQgPSB3aWR0aCA8PCAyO1xuXG4gIHZhciB3aWR0aE1pbnVzMSA9IHdpZHRoIC0gMTtcbiAgdmFyIGhlaWdodE1pbnVzMSA9IGhlaWdodCAtIDE7XG4gIHZhciByYWRpdXNQbHVzMSA9IHJhZGl1cyArIDE7XG4gIHZhciBzdW1GYWN0b3IgPSByYWRpdXNQbHVzMSAqIChyYWRpdXNQbHVzMSArIDEpIC8gMjtcbiAgdmFyIHN0YWNrU3RhcnQgPSBuZXcgQmx1clN0YWNrKCk7XG4gIHZhciBzdGFjayA9IHN0YWNrU3RhcnQ7XG4gIHZhciBzdGFja0VuZDtcblxuICBmb3IgKHZhciBpID0gMTsgaSA8IGRpdjsgaSsrKSB7XG4gICAgc3RhY2sgPSBzdGFjay5uZXh0ID0gbmV3IEJsdXJTdGFjaygpO1xuXG4gICAgaWYgKGkgPT09IHJhZGl1c1BsdXMxKSB7XG4gICAgICBzdGFja0VuZCA9IHN0YWNrO1xuICAgIH1cbiAgfVxuXG4gIHN0YWNrLm5leHQgPSBzdGFja1N0YXJ0O1xuICB2YXIgc3RhY2tJbiA9IG51bGw7XG4gIHZhciBzdGFja091dCA9IG51bGw7XG4gIHZhciBtdWxTdW0gPSBtdWxUYWJsZVtyYWRpdXNdO1xuICB2YXIgc2hnU3VtID0gc2hnVGFibGVbcmFkaXVzXTtcbiAgdmFyIHAsIHJicztcbiAgdmFyIHl3ID0gMCxcbiAgICAgIHlpID0gMDtcblxuICBmb3IgKHZhciB5ID0gMDsgeSA8IGhlaWdodDsgeSsrKSB7XG4gICAgdmFyIHByID0gcGl4ZWxzW3lpXSxcbiAgICAgICAgcGcgPSBwaXhlbHNbeWkgKyAxXSxcbiAgICAgICAgcGIgPSBwaXhlbHNbeWkgKyAyXSxcbiAgICAgICAgck91dFN1bSA9IHJhZGl1c1BsdXMxICogcHIsXG4gICAgICAgIGdPdXRTdW0gPSByYWRpdXNQbHVzMSAqIHBnLFxuICAgICAgICBiT3V0U3VtID0gcmFkaXVzUGx1czEgKiBwYixcbiAgICAgICAgclN1bSA9IHN1bUZhY3RvciAqIHByLFxuICAgICAgICBnU3VtID0gc3VtRmFjdG9yICogcGcsXG4gICAgICAgIGJTdW0gPSBzdW1GYWN0b3IgKiBwYjtcbiAgICBzdGFjayA9IHN0YWNrU3RhcnQ7XG5cbiAgICBmb3IgKHZhciBfaTUgPSAwOyBfaTUgPCByYWRpdXNQbHVzMTsgX2k1KyspIHtcbiAgICAgIHN0YWNrLnIgPSBwcjtcbiAgICAgIHN0YWNrLmcgPSBwZztcbiAgICAgIHN0YWNrLmIgPSBwYjtcbiAgICAgIHN0YWNrID0gc3RhY2submV4dDtcbiAgICB9XG5cbiAgICB2YXIgckluU3VtID0gMCxcbiAgICAgICAgZ0luU3VtID0gMCxcbiAgICAgICAgYkluU3VtID0gMDtcblxuICAgIGZvciAodmFyIF9pNiA9IDE7IF9pNiA8IHJhZGl1c1BsdXMxOyBfaTYrKykge1xuICAgICAgcCA9IHlpICsgKCh3aWR0aE1pbnVzMSA8IF9pNiA/IHdpZHRoTWludXMxIDogX2k2KSA8PCAyKTtcbiAgICAgIHJTdW0gKz0gKHN0YWNrLnIgPSBwciA9IHBpeGVsc1twXSkgKiAocmJzID0gcmFkaXVzUGx1czEgLSBfaTYpO1xuICAgICAgZ1N1bSArPSAoc3RhY2suZyA9IHBnID0gcGl4ZWxzW3AgKyAxXSkgKiByYnM7XG4gICAgICBiU3VtICs9IChzdGFjay5iID0gcGIgPSBwaXhlbHNbcCArIDJdKSAqIHJicztcbiAgICAgIHJJblN1bSArPSBwcjtcbiAgICAgIGdJblN1bSArPSBwZztcbiAgICAgIGJJblN1bSArPSBwYjtcbiAgICAgIHN0YWNrID0gc3RhY2submV4dDtcbiAgICB9XG5cbiAgICBzdGFja0luID0gc3RhY2tTdGFydDtcbiAgICBzdGFja091dCA9IHN0YWNrRW5kO1xuXG4gICAgZm9yICh2YXIgeCA9IDA7IHggPCB3aWR0aDsgeCsrKSB7XG4gICAgICBwaXhlbHNbeWldID0gclN1bSAqIG11bFN1bSA+PiBzaGdTdW07XG4gICAgICBwaXhlbHNbeWkgKyAxXSA9IGdTdW0gKiBtdWxTdW0gPj4gc2hnU3VtO1xuICAgICAgcGl4ZWxzW3lpICsgMl0gPSBiU3VtICogbXVsU3VtID4+IHNoZ1N1bTtcbiAgICAgIHJTdW0gLT0gck91dFN1bTtcbiAgICAgIGdTdW0gLT0gZ091dFN1bTtcbiAgICAgIGJTdW0gLT0gYk91dFN1bTtcbiAgICAgIHJPdXRTdW0gLT0gc3RhY2tJbi5yO1xuICAgICAgZ091dFN1bSAtPSBzdGFja0luLmc7XG4gICAgICBiT3V0U3VtIC09IHN0YWNrSW4uYjtcbiAgICAgIHAgPSB5dyArICgocCA9IHggKyByYWRpdXMgKyAxKSA8IHdpZHRoTWludXMxID8gcCA6IHdpZHRoTWludXMxKSA8PCAyO1xuICAgICAgckluU3VtICs9IHN0YWNrSW4uciA9IHBpeGVsc1twXTtcbiAgICAgIGdJblN1bSArPSBzdGFja0luLmcgPSBwaXhlbHNbcCArIDFdO1xuICAgICAgYkluU3VtICs9IHN0YWNrSW4uYiA9IHBpeGVsc1twICsgMl07XG4gICAgICByU3VtICs9IHJJblN1bTtcbiAgICAgIGdTdW0gKz0gZ0luU3VtO1xuICAgICAgYlN1bSArPSBiSW5TdW07XG4gICAgICBzdGFja0luID0gc3RhY2tJbi5uZXh0O1xuICAgICAgck91dFN1bSArPSBwciA9IHN0YWNrT3V0LnI7XG4gICAgICBnT3V0U3VtICs9IHBnID0gc3RhY2tPdXQuZztcbiAgICAgIGJPdXRTdW0gKz0gcGIgPSBzdGFja091dC5iO1xuICAgICAgckluU3VtIC09IHByO1xuICAgICAgZ0luU3VtIC09IHBnO1xuICAgICAgYkluU3VtIC09IHBiO1xuICAgICAgc3RhY2tPdXQgPSBzdGFja091dC5uZXh0O1xuICAgICAgeWkgKz0gNDtcbiAgICB9XG5cbiAgICB5dyArPSB3aWR0aDtcbiAgfVxuXG4gIGZvciAodmFyIF94MiA9IDA7IF94MiA8IHdpZHRoOyBfeDIrKykge1xuICAgIHlpID0gX3gyIDw8IDI7XG5cbiAgICB2YXIgX3ByMiA9IHBpeGVsc1t5aV0sXG4gICAgICAgIF9wZzIgPSBwaXhlbHNbeWkgKyAxXSxcbiAgICAgICAgX3BiMiA9IHBpeGVsc1t5aSArIDJdLFxuICAgICAgICBfck91dFN1bTIgPSByYWRpdXNQbHVzMSAqIF9wcjIsXG4gICAgICAgIF9nT3V0U3VtMiA9IHJhZGl1c1BsdXMxICogX3BnMixcbiAgICAgICAgX2JPdXRTdW0yID0gcmFkaXVzUGx1czEgKiBfcGIyLFxuICAgICAgICBfclN1bTIgPSBzdW1GYWN0b3IgKiBfcHIyLFxuICAgICAgICBfZ1N1bTIgPSBzdW1GYWN0b3IgKiBfcGcyLFxuICAgICAgICBfYlN1bTIgPSBzdW1GYWN0b3IgKiBfcGIyO1xuXG4gICAgc3RhY2sgPSBzdGFja1N0YXJ0O1xuXG4gICAgZm9yICh2YXIgX2k3ID0gMDsgX2k3IDwgcmFkaXVzUGx1czE7IF9pNysrKSB7XG4gICAgICBzdGFjay5yID0gX3ByMjtcbiAgICAgIHN0YWNrLmcgPSBfcGcyO1xuICAgICAgc3RhY2suYiA9IF9wYjI7XG4gICAgICBzdGFjayA9IHN0YWNrLm5leHQ7XG4gICAgfVxuXG4gICAgdmFyIF9ySW5TdW0yID0gMCxcbiAgICAgICAgX2dJblN1bTIgPSAwLFxuICAgICAgICBfYkluU3VtMiA9IDA7XG5cbiAgICBmb3IgKHZhciBfaTggPSAxLCB5cCA9IHdpZHRoOyBfaTggPD0gcmFkaXVzOyBfaTgrKykge1xuICAgICAgeWkgPSB5cCArIF94MiA8PCAyO1xuICAgICAgX3JTdW0yICs9IChzdGFjay5yID0gX3ByMiA9IHBpeGVsc1t5aV0pICogKHJicyA9IHJhZGl1c1BsdXMxIC0gX2k4KTtcbiAgICAgIF9nU3VtMiArPSAoc3RhY2suZyA9IF9wZzIgPSBwaXhlbHNbeWkgKyAxXSkgKiByYnM7XG4gICAgICBfYlN1bTIgKz0gKHN0YWNrLmIgPSBfcGIyID0gcGl4ZWxzW3lpICsgMl0pICogcmJzO1xuICAgICAgX3JJblN1bTIgKz0gX3ByMjtcbiAgICAgIF9nSW5TdW0yICs9IF9wZzI7XG4gICAgICBfYkluU3VtMiArPSBfcGIyO1xuICAgICAgc3RhY2sgPSBzdGFjay5uZXh0O1xuXG4gICAgICBpZiAoX2k4IDwgaGVpZ2h0TWludXMxKSB7XG4gICAgICAgIHlwICs9IHdpZHRoO1xuICAgICAgfVxuICAgIH1cblxuICAgIHlpID0gX3gyO1xuICAgIHN0YWNrSW4gPSBzdGFja1N0YXJ0O1xuICAgIHN0YWNrT3V0ID0gc3RhY2tFbmQ7XG5cbiAgICBmb3IgKHZhciBfeTIgPSAwOyBfeTIgPCBoZWlnaHQ7IF95MisrKSB7XG4gICAgICBwID0geWkgPDwgMjtcbiAgICAgIHBpeGVsc1twXSA9IF9yU3VtMiAqIG11bFN1bSA+PiBzaGdTdW07XG4gICAgICBwaXhlbHNbcCArIDFdID0gX2dTdW0yICogbXVsU3VtID4+IHNoZ1N1bTtcbiAgICAgIHBpeGVsc1twICsgMl0gPSBfYlN1bTIgKiBtdWxTdW0gPj4gc2hnU3VtO1xuICAgICAgX3JTdW0yIC09IF9yT3V0U3VtMjtcbiAgICAgIF9nU3VtMiAtPSBfZ091dFN1bTI7XG4gICAgICBfYlN1bTIgLT0gX2JPdXRTdW0yO1xuICAgICAgX3JPdXRTdW0yIC09IHN0YWNrSW4ucjtcbiAgICAgIF9nT3V0U3VtMiAtPSBzdGFja0luLmc7XG4gICAgICBfYk91dFN1bTIgLT0gc3RhY2tJbi5iO1xuICAgICAgcCA9IF94MiArICgocCA9IF95MiArIHJhZGl1c1BsdXMxKSA8IGhlaWdodE1pbnVzMSA/IHAgOiBoZWlnaHRNaW51czEpICogd2lkdGggPDwgMjtcbiAgICAgIF9yU3VtMiArPSBfckluU3VtMiArPSBzdGFja0luLnIgPSBwaXhlbHNbcF07XG4gICAgICBfZ1N1bTIgKz0gX2dJblN1bTIgKz0gc3RhY2tJbi5nID0gcGl4ZWxzW3AgKyAxXTtcbiAgICAgIF9iU3VtMiArPSBfYkluU3VtMiArPSBzdGFja0luLmIgPSBwaXhlbHNbcCArIDJdO1xuICAgICAgc3RhY2tJbiA9IHN0YWNrSW4ubmV4dDtcbiAgICAgIF9yT3V0U3VtMiArPSBfcHIyID0gc3RhY2tPdXQucjtcbiAgICAgIF9nT3V0U3VtMiArPSBfcGcyID0gc3RhY2tPdXQuZztcbiAgICAgIF9iT3V0U3VtMiArPSBfcGIyID0gc3RhY2tPdXQuYjtcbiAgICAgIF9ySW5TdW0yIC09IF9wcjI7XG4gICAgICBfZ0luU3VtMiAtPSBfcGcyO1xuICAgICAgX2JJblN1bTIgLT0gX3BiMjtcbiAgICAgIHN0YWNrT3V0ID0gc3RhY2tPdXQubmV4dDtcbiAgICAgIHlpICs9IHdpZHRoO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBpbWFnZURhdGE7XG59XG4vKipcbiAqXG4gKi9cblxuXG52YXIgQmx1clN0YWNrID1cbi8qKlxuICogU2V0IHByb3BlcnRpZXMuXG4gKi9cbmZ1bmN0aW9uIEJsdXJTdGFjaygpIHtcbiAgX2NsYXNzQ2FsbENoZWNrKHRoaXMsIEJsdXJTdGFjayk7XG5cbiAgdGhpcy5yID0gMDtcbiAgdGhpcy5nID0gMDtcbiAgdGhpcy5iID0gMDtcbiAgdGhpcy5hID0gMDtcbiAgdGhpcy5uZXh0ID0gbnVsbDtcbn07XG5cbmV4cG9ydCB7IEJsdXJTdGFjaywgcHJvY2Vzc0NhbnZhc1JHQiBhcyBjYW52YXNSR0IsIHByb2Nlc3NDYW52YXNSR0JBIGFzIGNhbnZhc1JHQkEsIHByb2Nlc3NJbWFnZSBhcyBpbWFnZSwgcHJvY2Vzc0ltYWdlRGF0YVJHQiBhcyBpbWFnZURhdGFSR0IsIHByb2Nlc3NJbWFnZURhdGFSR0JBIGFzIGltYWdlRGF0YVJHQkEgfTtcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9faW1wb3J0RGVmYXVsdCA9ICh0aGlzICYmIHRoaXMuX19pbXBvcnREZWZhdWx0KSB8fCBmdW5jdGlvbiAobW9kKSB7XG4gICAgcmV0dXJuIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpID8gbW9kIDogeyBcImRlZmF1bHRcIjogbW9kIH07XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5yZW5kZXJCb2FyZFNWRyA9IGV4cG9ydHMuY3JlYXRlQm9hcmREYXRhID0gZXhwb3J0cy5ib2FyZE11c3RhY2hlVGVtcGxhdGUgPSBleHBvcnRzLkRFRkFVTFRfVEhFTUUgPSBleHBvcnRzLlQgPSB2b2lkIDA7XG5jb25zdCBtdXN0YWNoZV8xID0gX19pbXBvcnREZWZhdWx0KHJlcXVpcmUoXCJtdXN0YWNoZVwiKSk7XG4vKipcbiAqIFRpbGUgdHlwZXNcbiAqL1xudmFyIFQ7XG4oZnVuY3Rpb24gKFQpIHtcbiAgICBUW1widHdcIl0gPSBcInR3XCI7XG4gICAgVFtcImR3XCJdID0gXCJkd1wiO1xuICAgIFRbXCJ0bFwiXSA9IFwidGxcIjtcbiAgICBUW1wiZGxcIl0gPSBcImRsXCI7XG4gICAgVFtcInNzXCJdID0gXCJzc1wiO1xuICAgIFRbXCJlZVwiXSA9IFwiZWVcIjsgLy9FbXB0eSB0aWxlXG59KShUID0gZXhwb3J0cy5UIHx8IChleHBvcnRzLlQgPSB7fSkpO1xuZXhwb3J0cy5ERUZBVUxUX1RIRU1FID0ge1xuICAgIGJhY2tncm91ZDogJyNmZmZmZmYnLFxuICAgIHdpZHRoOiAzMTcsXG4gICAgaGVpZ2h0OiAzMTcsXG4gICAgdGlsZU9mZnNldFg6IDIsXG4gICAgdGlsZU9mZnNldFk6IDIsXG4gICAgdGlsZUNhcDogMixcbiAgICB0aWxlSGVpZ2h0OiAxOSxcbiAgICB0aWxlV2lkdGg6IDE5LFxuICAgIHRpbGVTaXplOiAxOSxcbiAgICB0cmluZ2xlT2Zmc2V0OiAwLjI1LFxuICAgIFtULnR3XToge1xuICAgICAgICBiYWNrZ3JvdW5kOiAnI0Y1NjU0NicsXG4gICAgICAgIHRleHRDb2xvcjogJyMwMDAwMDAnLFxuICAgICAgICB0ZXh0OiBbJ1RSSVBMQScsICdTQU5BJywgJ1BJU1RFRVQnXSxcbiAgICAgICAgdHJpYW5nbGVzOiB7IHdpZHRoOiA1LCBoZWlnaHQ6IDEuNSwgZ2FwOiAzLCBhbW91bnQ6IDMsIGZpbGw6ICcjRjU2NTQ2JyB9XG4gICAgfSxcbiAgICBbVC5kd106IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyNGQUJBQTgnLFxuICAgICAgICB0ZXh0Q29sb3I6ICcjMDAwMDAwJyxcbiAgICAgICAgdGV4dDogWydUVVBMQScsICdTQU5BJywgJ1BJU1RFRVQnXSxcbiAgICAgICAgdHJpYW5nbGVzOiB7IHdpZHRoOiA1LCBoZWlnaHQ6IDEuNSwgZ2FwOiAzLCBhbW91bnQ6IDIsIGZpbGw6ICcjRkFCQUE4JyB9XG4gICAgfSxcbiAgICBbVC50bF06IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyM0NTlEQjEnLFxuICAgICAgICB0ZXh0Q29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgdGV4dDogWydUUklQTEEnLCAnS0lSSkFJTicsICdQSVNURUVUJ10sXG4gICAgICAgIHRyaWFuZ2xlczogeyB3aWR0aDogNSwgaGVpZ2h0OiAxLjUsIGdhcDogMywgYW1vdW50OiAzLCBmaWxsOiAnIzQ1OURCMScgfVxuICAgIH0sXG4gICAgW1QuZGxdOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjQjhENkQyJyxcbiAgICAgICAgdGV4dENvbG9yOiAnIzAwMDAwMCcsXG4gICAgICAgIHRleHQ6IFsnVFVQTEEnLCAnS0lSSkFJTicsICdQSVNURUVUJ10sXG4gICAgICAgIHRyaWFuZ2xlczogeyB3aWR0aDogNSwgaGVpZ2h0OiAxLjUsIGdhcDogMywgYW1vdW50OiAyLCBmaWxsOiAnI0I4RDZEMicgfVxuICAgIH0sXG4gICAgW1Quc3NdOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjRkYwMDAwJyxcbiAgICAgICAgdGV4dENvbG9yOiAnIzAwMDAwMCcsXG4gICAgICAgIHRleHQ6IFtdLFxuICAgICAgICB0cmlhbmdsZXM6IHVuZGVmaW5lZFxuICAgIH0sXG4gICAgW1QuZWVdOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjQzdDMEE0JyxcbiAgICAgICAgdGV4dENvbG9yOiAnIzAwMDAwMCcsXG4gICAgICAgIHRleHQ6IFtdLFxuICAgICAgICB0cmlhbmdsZXM6IHVuZGVmaW5lZFxuICAgIH1cbn07XG5leHBvcnRzLmJvYXJkTXVzdGFjaGVUZW1wbGF0ZSA9IGAgXG48c3ZnIFxuICB2aWV3Qm94PVwie3t2aWV3Qm94Lm1pblh9fSB7e3ZpZXdCb3gubWluWX19IHt7dmlld0JveC53aWR0aH19IHt7dmlld0JveC5oZWlnaHR9fVwiIFxuICB3aWR0aD1cInt7c3ZnLndpZHRofX1cIlxuICBoZWlnaHQ9XCJ7e3N2Zy5oZWlnaHR9fVwiXG4gIGZpbGw9XCJ7e3N2Zy5maWxsfX1cIiBcbiAgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiPlxuXG4gIDxzdHlsZT5cbiAgICAqIHtcbiAgICAgIGZvbnQtc2l6ZTogMi44cHQ7ICAgICAgXG4gICAgICBmb250LWZhbWlseTogc2Fucy1zZXJpZjtcbiAgICB9XG4gICAgLnBvaW50cyB7ICAgICAgICAgICAgIFxuICAgICAgZm9udC13ZWlnaHQ6IGJvbGQ7ICAgICAgIFxuICAgIH1cbiAgPC9zdHlsZT5cbiAgXG4gIDxwYXRoIGZpbGw9XCJ7e2JhY2tncm91bmQuZmlsbH19XCIgZD1cIk0ge3tiYWNrZ3JvdW5kLnAueH19LHt7YmFja2dyb3VuZC5wLnl9fSBMIHt7YmFja2dyb3VuZC5wMi54fX0se3tiYWNrZ3JvdW5kLnAyLnl9fSBMIHt7YmFja2dyb3VuZC5wMy54fX0se3tiYWNrZ3JvdW5kLnAzLnl9fSBMIHt7YmFja2dyb3VuZC5wNC54fX0se3tiYWNrZ3JvdW5kLnA0Lnl9fSB6XCIvPlxuXG5cblxuICB7eyN0aWxlUm93c319XG4gICAge3sjY29sc319XG4gICAgICA8cGF0aCBmaWxsPVwie3tiYWNrZ3JvdW5kfX1cIiAgZD1cIk0ge3twLnh9fSx7e3AueX19IEwge3twMi54fX0se3twMi55fX0gTCB7e3AzLnh9fSx7e3AzLnl9fSBMIHt7cDQueH19LHt7cDQueX19IHpcIi8+XG5cbiAgICAgIHt7I2hhc1RyaWFuZ2xlc319XG4gICAgICBcbiAgICAgICAgXG4gICAgICAgIDxnIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSh7e3RyaWFuZ2VUcmFuc2Zvcm0udG9wLnh9fSB7e3RyaWFuZ2VUcmFuc2Zvcm0udG9wLnl9fSlcIiA+XG4gICAgICAgIHt7I3RyaWFuZ2xlc319XG4gICAgICAgICAgPHBhdGggZmlsbD1cInt7ZmlsbH19XCIgZD1cIk0ge3tjLnh9fSx7e2MueX19IEwge3tjMi54fX0se3tjMi55fX0gTCB7e2MzLnh9fSx7e2MzLnl9fSB6XCIvPiAgICAgIFxuICAgICAgICB7ey90cmlhbmdsZXN9fVxuICAgICAgICA8L2c+XG5cbiAgICAgICAgPGcgdHJhbnNmb3JtPVwidHJhbnNsYXRlKHt7dHJpYW5nZVRyYW5zZm9ybS5yaWdodC54fX0ge3t0cmlhbmdlVHJhbnNmb3JtLnJpZ2h0Lnl9fSkgcm90YXRlKDkwIHt7cDIueH19IHt7cDIueX19KVwiID5cbiAgICAgICAge3sjdHJpYW5nbGVzfX1cbiAgICAgICAgICA8cGF0aCBmaWxsPVwie3tmaWxsfX1cIiBkPVwiTSB7e2MueH19LHt7Yy55fX0gTCB7e2MyLnh9fSx7e2MyLnl9fSBMIHt7YzMueH19LHt7YzMueX19IHpcIi8+ICAgICAgXG4gICAgICAgIHt7L3RyaWFuZ2xlc319XG4gICAgICAgIDwvZz5cblxuICAgICAgICA8ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoe3t0cmlhbmdlVHJhbnNmb3JtLmJvdHRvbS54fX0ge3t0cmlhbmdlVHJhbnNmb3JtLmJvdHRvbS55fX0pIHJvdGF0ZSgxODAge3twMi54fX0ge3twMi55fX0pXCIgPlxuICAgICAgICB7eyN0cmlhbmdsZXN9fVxuICAgICAgICAgIDxwYXRoIGZpbGw9XCJ7e2ZpbGx9fVwiIGQ9XCJNIHt7Yy54fX0se3tjLnl9fSBMIHt7YzIueH19LHt7YzIueX19IEwge3tjMy54fX0se3tjMy55fX0gelwiLz4gICAgICBcbiAgICAgICAge3svdHJpYW5nbGVzfX1cbiAgICAgICAgPC9nPlxuXG4gICAgICAgIDxnIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSh7e3RyaWFuZ2VUcmFuc2Zvcm0ubGVmdC54fX0ge3t0cmlhbmdlVHJhbnNmb3JtLmxlZnQueX19KSByb3RhdGUoMjcwIHt7cDIueH19IHt7cDIueX19KVwiID5cbiAgICAgICAge3sjdHJpYW5nbGVzfX1cbiAgICAgICAgICA8cGF0aCBmaWxsPVwie3tmaWxsfX1cIiBkPVwiTSB7e2MueH19LHt7Yy55fX0gTCB7e2MyLnh9fSx7e2MyLnl9fSBMIHt7YzMueH19LHt7YzMueX19IHpcIi8+ICAgICAgXG4gICAgICAgIHt7L3RyaWFuZ2xlc319XG4gICAgICAgIDwvZz4gICAgICAgIFxuXG4gICAgICB7ey9oYXNUcmlhbmdsZXN9fVxuXG4gICAgICB7eyN0ZXh0Lmxlbmd0aH19XG4gICAgICA8ZyB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoe3t0Lnh9fSB7e3QueX19KVwiPlxuICAgICAgICA8dGV4dCBjbGFzcz1cInBvaW50c1wiIGZpbGw9XCJ7e3RleHRDb2xvcn19XCI+XG4gICAgICAgICAge3sjdGV4dH19PHRzcGFuIHg9XCIwXCIgZHk9XCIzLjVwdFwiPnt7Ln19PC90c3Bhbj57ey90ZXh0fX1cbiAgICAgICAgPC90ZXh0PlxuICAgICAgPC9nPlxuICAgICAge3svdGV4dC5sZW5ndGh9fSAgIFxuICAgICAgXG5cblxuICAgIHt7L2NvbHN9fVxuICB7ey90aWxlUm93c319XG48L3N2Zz5cbmA7XG4vKipcbiAqIFdvcmtzIHdpdGggcmVuZGVyQm9hcmRTVkcoKSBmdW5jdGlvbiBieSBwcm92aWRpbmcgTXVzdGFjaGUgZGF0YSBmb3IgdGhlIGZ1bmN0aW9uLlxuICogQHBhcmFtIHtUaGVtZX0gdGhlbWUgdGhlbWVcbiAqIEByZXR1cm5zIHtCb2FyZFRlbXBsYXRlTXVzdGFjaGVEYXRhfSBkYXRhXG4gKi9cbmZ1bmN0aW9uIGNyZWF0ZUJvYXJkRGF0YSh0aGVtZSkge1xuICAgIC8qKlxuICAgICAqIHR3ID0gdHJpcGxlIHdvcmQgc2NvcmVcbiAgICAgKiBkdyA9IGRvdWJsZSB3b3JkIHNjb3JlXG4gICAgICogdGwgPSB0cmlwbGUgbGV0dGVyIHNjb3JlXG4gICAgICogZGwgPSBkb3VibGUgbGV0dGVyIHNjb3JlXG4gICAgICogc3QgPSBzdGFydFxuICAgICAqIGVlID0gZW1wdHlcbiAgICAgKi9cbiAgICBjb25zdCB0aWxlcyA9IFtcbiAgICAgICAgW1QudHcsIFQuZWUsIFQuZWUsIFQuZGwsIFQuZWUsIFQuZWUsIFQuZWUsIFQudHcsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZGwsIFQuZWUsIFQuZWUsIFQudHddLFxuICAgICAgICBbVC5lZSwgVC5kdywgVC5lZSwgVC5lZSwgVC5lZSwgVC50bCwgVC5lZSwgVC5lZSwgVC5lZSwgVC50bCwgVC5lZSwgVC5lZSwgVC5lZSwgVC5kdywgVC5lZV0sXG4gICAgICAgIFtULmVlLCBULmVlLCBULmR3LCBULmVlLCBULmVlLCBULmVlLCBULmVlLCBULmVlLCBULmVlLCBULmVlLCBULmVlLCBULmVlLCBULmR3LCBULmVlLCBULmVlXSxcbiAgICAgICAgW1QuZGwsIFQuZWUsIFQuZWUsIFQuZHcsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZGwsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZHcsIFQuZWUsIFQuZWUsIFQuZGxdLFxuICAgICAgICBbVC5lZSwgVC5lZSwgVC5lZSwgVC5lZSwgVC5kdywgVC5lZSwgVC5lZSwgVC5lZSwgVC5lZSwgVC5lZSwgVC5kdywgVC5lZSwgVC5lZSwgVC5lZSwgVC5lZV0sXG4gICAgICAgIFtULmVlLCBULnRsLCBULmVlLCBULmVlLCBULmVlLCBULnRsLCBULmVlLCBULmVlLCBULmVlLCBULnRsLCBULmVlLCBULmVlLCBULmVlLCBULnRsLCBULmVlXSxcbiAgICAgICAgW1QuZWUsIFQuZWUsIFQuZGwsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZGwsIFQuZWUsIFQuZGwsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZGwsIFQuZWUsIFQuZWVdLFxuICAgICAgICBbVC50dywgVC5lZSwgVC5lZSwgVC5kbCwgVC5lZSwgVC5lZSwgVC5lZSwgVC5zcywgVC5lZSwgVC5lZSwgVC5lZSwgVC5kbCwgVC5lZSwgVC5lZSwgVC50d10sXG4gICAgICAgIFtULmVlLCBULmVlLCBULmRsLCBULmVlLCBULmVlLCBULmVlLCBULmRsLCBULmVlLCBULmRsLCBULmVlLCBULmVlLCBULmVlLCBULmRsLCBULmVlLCBULmVlXSxcbiAgICAgICAgW1QuZWUsIFQudGwsIFQuZWUsIFQuZWUsIFQuZWUsIFQudGwsIFQuZWUsIFQuZWUsIFQuZWUsIFQudGwsIFQuZWUsIFQuZWUsIFQuZWUsIFQudGwsIFQuZWVdLFxuICAgICAgICBbVC5lZSwgVC5lZSwgVC5lZSwgVC5lZSwgVC5kdywgVC5lZSwgVC5lZSwgVC5lZSwgVC5lZSwgVC5lZSwgVC5kdywgVC5lZSwgVC5lZSwgVC5lZSwgVC5lZV0sXG4gICAgICAgIFtULmRsLCBULmVlLCBULmVlLCBULmR3LCBULmVlLCBULmVlLCBULmVlLCBULmRsLCBULmVlLCBULmVlLCBULmVlLCBULmR3LCBULmVlLCBULmVlLCBULmRsXSxcbiAgICAgICAgW1QuZWUsIFQuZWUsIFQuZHcsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZWUsIFQuZHcsIFQuZWUsIFQuZWVdLFxuICAgICAgICBbVC5lZSwgVC5kdywgVC5lZSwgVC5lZSwgVC5lZSwgVC50bCwgVC5lZSwgVC5lZSwgVC5lZSwgVC50bCwgVC5lZSwgVC5lZSwgVC5lZSwgVC5kdywgVC5lZV0sXG4gICAgICAgIFtULnR3LCBULmVlLCBULmVlLCBULmRsLCBULmVlLCBULmVlLCBULmVlLCBULnR3LCBULmVlLCBULmVlLCBULmVlLCBULmRsLCBULmVlLCBULmVlLCBULnR3XSxcbiAgICBdO1xuICAgIGNvbnN0IHRpbGUgPSB7XG4gICAgICAgIHhPZmZzZXQ6IHRoZW1lLnRpbGVPZmZzZXRYLFxuICAgICAgICB5T2Zmc2V0OiB0aGVtZS50aWxlT2Zmc2V0WSxcbiAgICAgICAgd2lkdGg6IHRoZW1lLnRpbGVXaWR0aCxcbiAgICAgICAgaGVpZ3RoOiB0aGVtZS50aWxlSGVpZ2h0LFxuICAgICAgICBjYXA6IHRoZW1lLnRpbGVDYXAsXG4gICAgICAgIHRpbGVTaXplOiB0aGVtZS50aWxlU2l6ZSxcbiAgICAgICAgdHJpbmdsZU9mZnNldDogdGhlbWUudHJpbmdsZU9mZnNldFxuICAgIH07XG4gICAgY29uc3Qgcm93cyA9IHRpbGVzLm1hcCgocm93LCByb3dJKSA9PiB7XG4gICAgICAgIGNvbnN0IGNvbHMgPSByb3cubWFwKChjb2x1bW4sIGNvbEkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHggPSB0aWxlLnhPZmZzZXQgKyB0aWxlLndpZHRoICogY29sSSArIHRpbGUuY2FwICogY29sSTtcbiAgICAgICAgICAgIGNvbnN0IHkgPSB0aWxlLnlPZmZzZXQgKyB0aWxlLmhlaWd0aCAqIHJvd0kgKyB0aWxlLmNhcCAqIHJvd0k7XG4gICAgICAgICAgICBsZXQgdHJpYW5nbGVzID0gW107XG4gICAgICAgICAgICBjb25zdCB0cmlhbmdsZURlZmluaXRpb24gPSB0aGVtZVtjb2x1bW5dLnRyaWFuZ2xlcztcbiAgICAgICAgICAgIGlmICh0cmlhbmdsZURlZmluaXRpb24pIHtcbiAgICAgICAgICAgICAgICBmb3IgKGxldCBpbmRleCA9IDA7IGluZGV4IDwgdHJpYW5nbGVEZWZpbml0aW9uLmFtb3VudDsgaW5kZXgrKykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBvZmZzZXQgPSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4OiB0cmlhbmdsZURlZmluaXRpb24uZ2FwICsgdHJpYW5nbGVEZWZpbml0aW9uLmdhcCAqIGluZGV4ICsgdHJpYW5nbGVEZWZpbml0aW9uLndpZHRoICogaW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiAwXG4gICAgICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiB4ICsgb2Zmc2V0LngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogeSArIG9mZnNldC55XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYzI6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiB4ICsgdHJpYW5nbGVEZWZpbml0aW9uLndpZHRoICsgb2Zmc2V0LngsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgeTogeSArIG9mZnNldC55XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgYzM6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB4OiB4ICsgdHJpYW5nbGVEZWZpbml0aW9uLndpZHRoIC8gMiArIG9mZnNldC54LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHk6IHkgLSB0cmlhbmdsZURlZmluaXRpb24uaGVpZ2h0ICsgb2Zmc2V0LnlcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICBmaWxsOiB0cmlhbmdsZURlZmluaXRpb24uZmlsbCxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgICAgICBiYWNrZ3JvdW5kOiB0aGVtZVtjb2x1bW5dLmJhY2tncm91bmQsXG4gICAgICAgICAgICAgICAgcDoge1xuICAgICAgICAgICAgICAgICAgICB4OiB4LFxuICAgICAgICAgICAgICAgICAgICB5OiB5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBwMjoge1xuICAgICAgICAgICAgICAgICAgICB4OiB4ICsgdGlsZS53aWR0aCxcbiAgICAgICAgICAgICAgICAgICAgeTogeVxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcDM6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogeCArIHRpbGUud2lkdGgsXG4gICAgICAgICAgICAgICAgICAgIHk6IHkgKyB0aWxlLmhlaWd0aFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgcDQ6IHtcbiAgICAgICAgICAgICAgICAgICAgeDogeCxcbiAgICAgICAgICAgICAgICAgICAgeTogeSArIHRpbGUuaGVpZ3RoXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0ZXh0Q29sb3I6IHRoZW1lW2NvbHVtbl0udGV4dENvbG9yLFxuICAgICAgICAgICAgICAgIHRleHQ6IHRoZW1lW2NvbHVtbl0udGV4dCxcbiAgICAgICAgICAgICAgICB0OiB7XG4gICAgICAgICAgICAgICAgICAgIHg6IHggKyAxLjUsXG4gICAgICAgICAgICAgICAgICAgIHk6IHkgKyAyXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0Mjoge1xuICAgICAgICAgICAgICAgICAgICB4LCB5XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB0cmlhbmdsZXMsXG4gICAgICAgICAgICAgICAgaGFzVHJpYW5nbGVzOiB0cmlhbmdsZXMubGVuZ3RoID4gMFxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB7IGNvbHMgfTtcbiAgICB9KTtcbiAgICBjb25zdCBkYXRhID0ge1xuICAgICAgICAvL1RoZXNlIGNhbiBiZSB1c2VkIHRvIHNjYWxlIHRoaW5nIHRvIGZpbmFsIHNpemVcbiAgICAgICAgc3ZnOiB7XG4gICAgICAgICAgICBmaWxsOiAnbm9uZScsXG4gICAgICAgICAgICB3aWR0aDogYCR7dGhlbWUud2lkdGh9bW1gLFxuICAgICAgICAgICAgaGVpZ2h0OiBgJHt0aGVtZS5oZWlnaHR9bW1gXG4gICAgICAgIH0sXG4gICAgICAgIC8vSW50ZXJuYWwgY29vcmRpbmF0ZSBzeXN0ZW0sIGV2ZXJldGhpbmcgZm9sbG93cyB0aGlzIVxuICAgICAgICB2aWV3Qm94OiB7XG4gICAgICAgICAgICBtaW5YOiAwLCBtaW5ZOiAwLFxuICAgICAgICAgICAgd2lkdGg6IHRoZW1lLndpZHRoLCBoZWlnaHQ6IHRoZW1lLmhlaWdodFxuICAgICAgICB9LFxuICAgICAgICB0aWxlLFxuICAgICAgICBiYWNrZ3JvdW5kOiB7XG4gICAgICAgICAgICBmaWxsOiB0aGVtZS5iYWNrZ3JvdWQsXG4gICAgICAgICAgICBwOiB7IHg6IDAsIHk6IDAgfSxcbiAgICAgICAgICAgIHAyOiB7IHg6IHRoZW1lLndpZHRoLCB5OiAwIH0sXG4gICAgICAgICAgICBwMzogeyB4OiB0aGVtZS53aWR0aCwgeTogdGhlbWUuaGVpZ2h0IH0sXG4gICAgICAgICAgICBwNDogeyB4OiAwLCB5OiB0aGVtZS5oZWlnaHQgfSxcbiAgICAgICAgfSxcbiAgICAgICAgdHJpYW5nZVRyYW5zZm9ybToge1xuICAgICAgICAgICAgdG9wOiB7IHg6IDAsIHk6IHRpbGUudHJpbmdsZU9mZnNldCB9LFxuICAgICAgICAgICAgcmlnaHQ6IHsgeDogLXRpbGUudHJpbmdsZU9mZnNldCwgeTogdGlsZS50aWxlU2l6ZSB9LFxuICAgICAgICAgICAgYm90dG9tOiB7IHg6IC0odGlsZS50aWxlU2l6ZSksIHk6IHRpbGUudGlsZVNpemUgLSB0aWxlLnRyaW5nbGVPZmZzZXQgfSxcbiAgICAgICAgICAgIGxlZnQ6IHsgeDogLSh0aWxlLnRpbGVTaXplIC0gdGlsZS50cmluZ2xlT2Zmc2V0KSwgeTogMCB9LFxuICAgICAgICB9LFxuICAgICAgICB0aWxlUm93czogcm93c1xuICAgIH07XG4gICAgcmV0dXJuIGRhdGE7XG59XG5leHBvcnRzLmNyZWF0ZUJvYXJkRGF0YSA9IGNyZWF0ZUJvYXJkRGF0YTtcbi8qKlxuICogQ3JlYXRlIEJvYXJkIHN2ZyBpY29uXG4gKiBAcGFyYW0gc3ZnVGVtcGxhdGUgQm9hcmQncyBzdmcgdGVtcGxhdGVcbiAqIEBwYXJhbSBtdXN0YWNoZURhdGEgbXVzdGFjaGUgZGF0YSBmb3IgYm9hcmRcbiAqIEByZXR1cm5zIHN2ZyBpY29uXG4gKi9cbmZ1bmN0aW9uIHJlbmRlckJvYXJkU1ZHKHN2Z1RlbXBsYXRlLCBtdXN0YWNoZURhdGEpIHtcbiAgICBjb25zdCBodG1sID0gbXVzdGFjaGVfMS5kZWZhdWx0LnJlbmRlcihzdmdUZW1wbGF0ZSwgbXVzdGFjaGVEYXRhLCB7fSk7XG4gICAgcmV0dXJuIGh0bWw7XG59XG5leHBvcnRzLnJlbmRlckJvYXJkU1ZHID0gcmVuZGVyQm9hcmRTVkc7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZbTloY21RdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk4dUxpOXpjbU12WTJ4cFpXNTBMMkp2WVhKa0xuUnpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPenM3T3p0QlFVRkJMSGRFUVVGblF6dEJRVVZvUXpzN1IwRkZSenRCUVVOSUxFbEJRVmtzUTBGUFdEdEJRVkJFTEZkQlFWa3NRMEZCUXp0SlFVTllMR05CUVZNc1EwRkJRVHRKUVVOVUxHTkJRVk1zUTBGQlFUdEpRVU5VTEdOQlFWTXNRMEZCUVR0SlFVTlVMR05CUVZNc1EwRkJRVHRKUVVOVUxHTkJRVk1zUTBGQlFUdEpRVU5VTEdOQlFWTXNRMEZCUVN4RFFVRkJMRmxCUVZrN1FVRkRka0lzUTBGQlF5eEZRVkJYTEVOQlFVTXNSMEZCUkN4VFFVRkRMRXRCUVVRc1UwRkJReXhSUVU5YU8wRkJkVVZaTEZGQlFVRXNZVUZCWVN4SFFVRlRPMGxCUldwRExGTkJRVk1zUlVGQlJTeFRRVUZUTzBsQlJYQkNMRXRCUVVzc1JVRkJSU3hIUVVGSE8wbEJRMVlzVFVGQlRTeEZRVUZGTEVkQlFVYzdTVUZGV0N4WFFVRlhMRVZCUVVVc1EwRkJRenRKUVVOa0xGZEJRVmNzUlVGQlJTeERRVUZETzBsQlEyUXNUMEZCVHl4RlFVRkZMRU5CUVVNN1NVRkRWaXhWUVVGVkxFVkJRVVVzUlVGQlJUdEpRVU5rTEZOQlFWTXNSVUZCUlN4RlFVRkZPMGxCUldJc1VVRkJVU3hGUVVGRkxFVkJRVVU3U1VGRFdpeGhRVUZoTEVWQlFVVXNTVUZCU1R0SlFVVnVRaXhEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlR0UlFVTk9MRlZCUVZVc1JVRkJSU3hUUVVGVE8xRkJRM0pDTEZOQlFWTXNSVUZCUlN4VFFVRlRPMUZCUTNCQ0xFbEJRVWtzUlVGQlJTeERRVUZETEZGQlFWRXNSVUZCUlN4TlFVRk5MRVZCUVVVc1UwRkJVeXhEUVVGRE8xRkJRMjVETEZOQlFWTXNSVUZCUlN4RlFVRkZMRXRCUVVzc1JVRkJSU3hEUVVGRExFVkJRVVVzVFVGQlRTeEZRVUZGTEVkQlFVY3NSVUZCUlN4SFFVRkhMRVZCUVVVc1EwRkJReXhGUVVGRkxFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNTVUZCU1N4RlFVRkZMRk5CUVZNc1JVRkJSVHRMUVVONlJUdEpRVU5FTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRk8xRkJRMDRzVlVGQlZTeEZRVUZGTEZOQlFWTTdVVUZEY2tJc1UwRkJVeXhGUVVGRkxGTkJRVk03VVVGRGNFSXNTVUZCU1N4RlFVRkZMRU5CUVVNc1QwRkJUeXhGUVVGRkxFMUJRVTBzUlVGQlJTeFRRVUZUTEVOQlFVTTdVVUZEYkVNc1UwRkJVeXhGUVVGRkxFVkJRVVVzUzBGQlN5eEZRVUZGTEVOQlFVTXNSVUZCUlN4TlFVRk5MRVZCUVVVc1IwRkJSeXhGUVVGRkxFZEJRVWNzUlVGQlJTeERRVUZETEVWQlFVVXNUVUZCVFN4RlFVRkZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzVTBGQlV5eEZRVUZGTzB0QlEzcEZPMGxCUTBRc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVTdVVUZEVGl4VlFVRlZMRVZCUVVVc1UwRkJVenRSUVVOeVFpeFRRVUZUTEVWQlFVVXNVMEZCVXp0UlFVTndRaXhKUVVGSkxFVkJRVVVzUTBGQlF5eFJRVUZSTEVWQlFVVXNVMEZCVXl4RlFVRkZMRk5CUVZNc1EwRkJRenRSUVVOMFF5eFRRVUZUTEVWQlFVVXNSVUZCUlN4TFFVRkxMRVZCUVVVc1EwRkJReXhGUVVGRkxFMUJRVTBzUlVGQlJTeEhRVUZITEVWQlFVVXNSMEZCUnl4RlFVRkZMRU5CUVVNc1JVRkJSU3hOUVVGTkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4VFFVRlRMRVZCUVVVN1MwRkRla1U3U1VGRFJDeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSVHRSUVVOT0xGVkJRVlVzUlVGQlJTeFRRVUZUTzFGQlEzSkNMRk5CUVZNc1JVRkJSU3hUUVVGVE8xRkJRM0JDTEVsQlFVa3NSVUZCUlN4RFFVRkRMRTlCUVU4c1JVRkJSU3hUUVVGVExFVkJRVVVzVTBGQlV5eERRVUZETzFGQlEzSkRMRk5CUVZNc1JVRkJSU3hGUVVGRkxFdEJRVXNzUlVGQlJTeERRVUZETEVWQlFVVXNUVUZCVFN4RlFVRkZMRWRCUVVjc1JVRkJSU3hIUVVGSExFVkJRVVVzUTBGQlF5eEZRVUZGTEUxQlFVMHNSVUZCUlN4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxGTkJRVk1zUlVGQlJUdExRVU42UlR0SlFVTkVMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTzFGQlEwNHNWVUZCVlN4RlFVRkZMRk5CUVZNN1VVRkRja0lzVTBGQlV5eEZRVUZGTEZOQlFWTTdVVUZEY0VJc1NVRkJTU3hGUVVGRkxFVkJRVVU3VVVGRFVpeFRRVUZUTEVWQlFVVXNVMEZCVXp0TFFVTnlRanRKUVVORUxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZPMUZCUTA0c1ZVRkJWU3hGUVVGRkxGTkJRVk03VVVGRGNrSXNVMEZCVXl4RlFVRkZMRk5CUVZNN1VVRkRjRUlzU1VGQlNTeEZRVUZGTEVWQlFVVTdVVUZEVWl4VFFVRlRMRVZCUVVVc1UwRkJVenRMUVVOeVFqdERRVU5HTEVOQlFVRTdRVUZuUlZrc1VVRkJRU3h4UWtGQmNVSXNSMEZCUnpzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdRMEZ2UlhCRExFTkJRVU03UVVGRlJqczdPenRIUVVsSE8wRkJRMGdzVTBGQlowSXNaVUZCWlN4RFFVRkZMRXRCUVZjN1NVRkZNVU03T3pzN096czdUMEZQUnp0SlFVTkdMRTFCUVUwc1MwRkJTeXhIUVVGSE8xRkJRMklzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRenRSUVVNMVJTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRE8xRkJRelZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU03VVVGRE5VVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF6dFJRVU0xUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETzFGQlF6VkZMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTTdVVUZETlVVc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXp0UlFVTTFSU3hEUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRPMUZCUXpWRkxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNN1VVRkROVVVzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJRenRSUVVNMVJTeERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hEUVVGRE8xRkJRelZGTEVOQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU03VVVGRE5VVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF6dFJRVU0xUlN4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETzFGQlF6VkZMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVWQlFVTXNRMEZCUXl4RFFVRkRMRVZCUVVVc1JVRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeEZRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRVZCUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFVkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRExFTkJRVU1zUTBGQlF5eEZRVUZGTEVOQlFVTTdTMEZETjBVc1EwRkJRVHRKUVVWRUxFMUJRVTBzU1VGQlNTeEhRVUZITzFGQlExZ3NUMEZCVHl4RlFVRkZMRXRCUVVzc1EwRkJReXhYUVVGWE8xRkJRekZDTEU5QlFVOHNSVUZCUlN4TFFVRkxMRU5CUVVNc1YwRkJWenRSUVVNeFFpeExRVUZMTEVWQlFVVXNTMEZCU3l4RFFVRkRMRk5CUVZNN1VVRkRkRUlzVFVGQlRTeEZRVUZGTEV0QlFVc3NRMEZCUXl4VlFVRlZPMUZCUTNoQ0xFZEJRVWNzUlVGQlJTeExRVUZMTEVOQlFVTXNUMEZCVHp0UlFVVnNRaXhSUVVGUkxFVkJRVVVzUzBGQlN5eERRVUZETEZGQlFWRTdVVUZEZUVJc1lVRkJZU3hGUVVGRkxFdEJRVXNzUTBGQlF5eGhRVUZoTzB0QlEyNURMRU5CUVVNN1NVRkZSaXhOUVVGTkxFbEJRVWtzUjBGQlJ5eExRVUZMTEVOQlFVTXNSMEZCUnl4RFFVRkZMRU5CUVVNc1IwRkJUeXhGUVVGRkxFbEJRVmNzUlVGQlRTeEZRVUZGTzFGQlEyNUVMRTFCUVUwc1NVRkJTU3hIUVVGeFFpeEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkZMRU5CUVVNc1RVRkJVU3hGUVVGRkxFbEJRVmNzUlVGQmEwSXNSVUZCUlR0WlFVVm9SaXhOUVVGTkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNUMEZCVHl4SFFVRkhMRWxCUVVrc1EwRkJReXhMUVVGTExFZEJRVWNzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRE8xbEJRemRFTEUxQlFVMHNRMEZCUXl4SFFVRkhMRWxCUVVrc1EwRkJReXhQUVVGUExFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNSMEZCUnl4SlFVRkpMRWRCUVVjc1NVRkJTU3hEUVVGRExFZEJRVWNzUjBGQlJ5eEpRVUZKTEVOQlFVTTdXVUZGT1VRc1NVRkJTU3hUUVVGVExFZEJRWGxDTEVWQlFVVXNRMEZCUXp0WlFVTjZReXhOUVVGTkxHdENRVUZyUWl4SFFVRkhMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eFRRVUZUTEVOQlFVTTdXVUZGYmtRc1NVRkJTU3hyUWtGQmEwSXNSVUZCUnp0blFrRkRka0lzUzBGQlN5eEpRVUZKTEV0QlFVc3NSMEZCVlN4RFFVRkRMRVZCUVVVc1MwRkJTeXhIUVVGSExHdENRVUZyUWl4RFFVRkRMRTFCUVUwc1JVRkJSU3hMUVVGTExFVkJRVVVzUlVGQlJ6dHZRa0ZEZEVVc1RVRkJUU3hOUVVGTkxFZEJRVk03ZDBKQlEyNUNMRU5CUVVNc1JVRkJSU3hyUWtGQmEwSXNRMEZCUXl4SFFVRkhMRWRCUVVjc2EwSkJRV3RDTEVOQlFVTXNSMEZCUnl4SFFVRkhMRXRCUVVzc1IwRkJSeXhyUWtGQmEwSXNRMEZCUXl4TFFVRkxMRWRCUVVjc1MwRkJTenQzUWtGRE4wWXNRMEZCUXl4RlFVRkZMRU5CUVVNN2NVSkJRMHdzUTBGQlFUdHZRa0ZGUkN4VFFVRlRMRU5CUVVNc1NVRkJTU3hEUVVGRE8zZENRVU5pTEVOQlFVTXNSVUZCUlRzMFFrRkRSQ3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEUxQlFVMHNRMEZCUXl4RFFVRkRPelJDUVVObUxFTkJRVU1zUlVGQlJTeERRVUZETEVkQlFVY3NUVUZCVFN4RFFVRkRMRU5CUVVNN2VVSkJRMmhDTzNkQ1FVTkVMRVZCUVVVc1JVRkJSVHMwUWtGRFJpeERRVUZETEVWQlFVVXNRMEZCUXl4SFFVRkhMR3RDUVVGclFpeERRVUZETEV0QlFVc3NSMEZCUnl4TlFVRk5MRU5CUVVNc1EwRkJRenMwUWtGRE1VTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1IwRkJSeXhOUVVGTkxFTkJRVU1zUTBGQlF6dDVRa0ZEYUVJN2QwSkJRMFFzUlVGQlJTeEZRVUZGT3pSQ1FVTkdMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzYTBKQlFXdENMRU5CUVVNc1MwRkJTeXhIUVVGSExFTkJRVU1zUjBGQlJ5eE5RVUZOTEVOQlFVTXNRMEZCUXpzMFFrRkRPVU1zUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4clFrRkJhMElzUTBGQlF5eE5RVUZOTEVkQlFVY3NUVUZCVFN4RFFVRkRMRU5CUVVNN2VVSkJRelZETzNkQ1FVTkVMRWxCUVVrc1JVRkJSU3hyUWtGQmEwSXNRMEZCUXl4SlFVRkpPM0ZDUVVNNVFpeERRVUZETEVOQlFVTTdhVUpCUTBvN1lVRkRSanRaUVVWRUxFOUJRVTg3WjBKQlEwd3NWVUZCVlN4RlFVRkZMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eFZRVUZWTzJkQ1FVTndReXhEUVVGRExFVkJRVVU3YjBKQlEwUXNRMEZCUXl4RlFVRkZMRU5CUVVNN2IwSkJRMG9zUTBGQlF5eEZRVUZGTEVOQlFVTTdhVUpCUTB3N1owSkJRMFFzUlVGQlJTeEZRVUZGTzI5Q1FVTkdMRU5CUVVNc1JVRkJSU3hEUVVGRExFZEJRVWNzU1VGQlNTeERRVUZETEV0QlFVczdiMEpCUTJwQ0xFTkJRVU1zUlVGQlJTeERRVUZETzJsQ1FVTk1PMmRDUVVORUxFVkJRVVVzUlVGQlJUdHZRa0ZEUml4RFFVRkRMRVZCUVVVc1EwRkJReXhIUVVGSExFbEJRVWtzUTBGQlF5eExRVUZMTzI5Q1FVTnFRaXhEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEVsQlFVa3NRMEZCUXl4TlFVRk5PMmxDUVVOdVFqdG5Ra0ZEUkN4RlFVRkZMRVZCUVVVN2IwSkJRMFlzUTBGQlF5eEZRVUZGTEVOQlFVTTdiMEpCUTBvc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eEpRVUZKTEVOQlFVTXNUVUZCVFR0cFFrRkRia0k3WjBKQlJVUXNVMEZCVXl4RlFVRkZMRXRCUVVzc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF5eFRRVUZUTzJkQ1FVTnNReXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRWxCUVVrN1owSkJSWGhDTEVOQlFVTXNSVUZCUlR0dlFrRkRSQ3hEUVVGRExFVkJRVVVzUTBGQlF5eEhRVUZITEVkQlFVYzdiMEpCUTFZc1EwRkJReXhGUVVGRkxFTkJRVU1zUjBGQlJ5eERRVUZETzJsQ1FVTlVPMmRDUVVWRUxFVkJRVVVzUlVGQlJUdHZRa0ZEUml4RFFVRkRMRVZCUVVVc1EwRkJRenRwUWtGRFREdG5Ra0ZGUkN4VFFVRlRPMmRDUVVOVUxGbEJRVmtzUlVGQlJTeFRRVUZUTEVOQlFVTXNUVUZCVFN4SFFVRkhMRU5CUVVNN1lVRkRia01zUTBGQlFUdFJRVU5JTEVOQlFVTXNRMEZCUXl4RFFVRkRPMUZCUlVnc1QwRkJUeXhGUVVGRkxFbEJRVWtzUlVGQlJTeERRVUZETzBsQlEyeENMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJSVWdzVFVGQlRTeEpRVUZKTEVkQlFVYzdVVUZGV0N4blJFRkJaMFE3VVVGRGFFUXNSMEZCUnl4RlFVRkZPMWxCUTBnc1NVRkJTU3hGUVVGRkxFMUJRVTA3V1VGRFdpeExRVUZMTEVWQlFVVXNSMEZCUnl4TFFVRkxMRU5CUVVNc1MwRkJTeXhKUVVGSk8xbEJRM3BDTEUxQlFVMHNSVUZCUlN4SFFVRkhMRXRCUVVzc1EwRkJReXhOUVVGTkxFbEJRVWs3VTBGRE5VSTdVVUZGUkN4elJFRkJjMFE3VVVGRGRFUXNUMEZCVHl4RlFVRkZPMWxCUTFBc1NVRkJTU3hGUVVGRkxFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVTXNRMEZCUXp0WlFVTm1MRXRCUVVzc1JVRkJSU3hMUVVGTExFTkJRVU1zUzBGQlN5eEZRVUZGTEUxQlFVMHNSVUZCUlN4TFFVRkxMRU5CUVVNc1RVRkJUVHRUUVVONlF6dFJRVVZFTEVsQlFVazdVVUZGU2l4VlFVRlZMRVZCUVVVN1dVRkRWaXhKUVVGSkxFVkJRVVVzUzBGQlN5eERRVUZETEZOQlFWTTdXVUZEY2tJc1EwRkJReXhGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVNc1EwRkJReXhGUVVGRk8xbEJRMllzUlVGQlJTeEZRVUZGTEVWQlFVVXNRMEZCUXl4RlFVRkZMRXRCUVVzc1EwRkJReXhMUVVGTExFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlR0WlFVTTFRaXhGUVVGRkxFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNTMEZCU3l4RFFVRkRMRXRCUVVzc1JVRkJSU3hEUVVGRExFVkJRVVVzUzBGQlN5eERRVUZETEUxQlFVMHNSVUZCUlR0WlFVTjJReXhGUVVGRkxFVkJRVVVzUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSU3hMUVVGTExFTkJRVU1zVFVGQlRTeEZRVUZGTzFOQlF6bENPMUZCUlVRc1owSkJRV2RDTEVWQlFVVTdXVUZEYUVJc1IwRkJSeXhGUVVGRkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVc1NVRkJTU3hEUVVGRExHRkJRV0VzUlVGQlJUdFpRVU53UXl4TFFVRkxMRVZCUVVVc1JVRkJSU3hEUVVGRExFVkJRVVVzUTBGQlF5eEpRVUZKTEVOQlFVTXNZVUZCWVN4RlFVRkZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFTkJRVU1zVVVGQlVTeEZRVUZGTzFsQlEyNUVMRTFCUVUwc1JVRkJSeXhGUVVGRkxFTkJRVU1zUlVGQlJTeERRVUZETEVOQlFVTXNTVUZCU1N4RFFVRkRMRkZCUVZFc1EwRkJSU3hGUVVGSExFTkJRVU1zUlVGQlJTeEpRVUZKTEVOQlFVTXNVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFVkJRVVU3V1VGRGVrVXNTVUZCU1N4RlFVRkhMRVZCUVVVc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNVVUZCVVN4SFFVRkhMRWxCUVVrc1EwRkJReXhoUVVGaExFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVXNRMEZCUXl4RlFVRkZPMU5CUXpGRU8xRkJSVVFzVVVGQlVTeEZRVUZGTEVsQlFVazdTMEZEWml4RFFVRkJPMGxCUlVRc1QwRkJUeXhKUVVGSkxFTkJRVU03UVVGRFpDeERRVUZETzBGQmNFcEVMREJEUVc5S1F6dEJRVWxFT3pzN096dEhRVXRITzBGQlEwZ3NVMEZCWjBJc1kwRkJZeXhEUVVGRkxGZEJRV3RDTEVWQlEyeENMRmxCUVhORE8wbEJSWEJGTEUxQlFVMHNTVUZCU1N4SFFVRkhMR3RDUVVGUkxFTkJRVU1zVFVGQlRTeERRVUZETEZkQlFWY3NSVUZCUlN4WlFVRlpMRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU03U1VGRE5VUXNUMEZCVHl4SlFVRkpMRU5CUVVNN1FVRkRaQ3hEUVVGRE8wRkJURVFzZDBOQlMwTWlMQ0p6YjNWeVkyVnpRMjl1ZEdWdWRDSTZXeUpwYlhCdmNuUWdiWFZ6ZEdGamFHVWdabkp2YlNBbmJYVnpkR0ZqYUdVbk8xeHVYRzR2S2lwY2JpQXFJRlJwYkdVZ2RIbHdaWE5jYmlBcUwxeHVaWGh3YjNKMElHVnVkVzBnVkNCN1hHNGdJSFIzSUQwZ0ozUjNKeXd2TDFSeWFYQnNaU0IzYjNKa0lITmpiM0psYzF4dUlDQmtkeUE5SUNka2R5Y3NMeTlFYjNWaWJHVWdkMjl5WkNCelkyOXlaWE5jYmlBZ2RHd2dQU0FuZEd3bkxDOHZWSEpwY0d4bElHeGxkSFJsY2lCelkyOXlaWE5jYmlBZ1pHd2dQU0FuWkd3bkxDOHZSRzkxWW14bElHeGxkSFJsY2lCelkyOXlaWE5jYmlBZ2MzTWdQU0FuYzNNbkxDOHZVM1JoY25RZ2RHbHNaVnh1SUNCbFpTQTlJQ2RsWlNjdkwwVnRjSFI1SUhScGJHVmNibjFjYmx4dVpYaHdiM0owSUdsdWRHVnlabUZqWlNCUWIybHVkQ0I3WEc0Z0lIZzZiblZ0WW1WeU8xeHVJQ0I1T201MWJXSmxjanRjYm4xY2JseHVhVzUwWlhKbVlXTmxJRlJ5YVdGdVoyeGxJSHRjYmlBZ2QybGtkR2c2Ym5WdFltVnlMRnh1SUNCb1pXbG5hSFE2SUc1MWJXSmxjaXhjYmlBZ1oyRndPaUJ1ZFcxaVpYSXNYRzRnSUdGdGIzVnVkRG9nYm5WdFltVnlMRnh1SUNCbWFXeHNPaUJ6ZEhKcGJtY2dYRzU5WEc1Y2JtVjRjRzl5ZENCcGJuUmxjbVpoWTJVZ1ZHaGxiV1VnZTF4dVhHNGdJR0poWTJ0bmNtOTFaRG9nYzNSeWFXNW5MRnh1WEc0Z0lDOHZSMmwyWlhNZ1UxWkhJR2x1ZEdWeWJtRnNJR0Z1WkNCbGVIUmxjbTVoYkNCa2FXMWxjMmx2Ymx4dUlDQjNhV1IwYURvZ2JuVnRZbVZ5TEZ4dUlDQm9aV2xuYUhRNklHNTFiV0psY2l4Y2JseHVJQ0IwYVd4bFQyWm1jMlYwV0RvZ2JuVnRZbVZ5TEZ4dUlDQjBhV3hsVDJabWMyVjBXVG9nYm5WdFltVnlMRnh1SUNCMGFXeGxRMkZ3T2lCdWRXMWlaWElzWEc0Z0lIUnBiR1ZYYVdSMGFEb2diblZ0WW1WeUxGeHVJQ0IwYVd4bFNHVnBaMmgwT2lCdWRXMWlaWElzWEc0Z0lIUnBiR1ZUYVhwbE9pQnVkVzFpWlhKY2JpQWdkSEpwYm1kc1pVOW1abk5sZERvZ2JuVnRZbVZ5TEZ4dVhHNGdJRnRVTG5SM1hUb2dlMXh1SUNBZ0lHSmhZMnRuY205MWJtUTZjM1J5YVc1bkxGeHVJQ0FnSUhSbGVIUkRiMnh2Y2pwemRISnBibWNzWEc0Z0lDQWdkR1Y0ZERvZ2MzUnlhVzVuVzEwc1hHNGdJQ0FnZEhKcFlXNW5iR1Z6UHpvZ1ZISnBZVzVuYkdWY2JpQWdmU3hjYmlBZ1cxUXVaSGRkT2lCN1hHNGdJQ0FnWW1GamEyZHliM1Z1WkRwemRISnBibWNzWEc0Z0lDQWdkR1Y0ZEVOdmJHOXlPbk4wY21sdVp5eGNiaUFnSUNCMFpYaDBPaUJ6ZEhKcGJtZGJYU3hjYmlBZ0lDQjBjbWxoYm1kc1pYTS9PaUJVY21saGJtZHNaVnh1SUNCOUxGeHVJQ0JiVkM1MGJGMDZJSHRjYmlBZ0lDQmlZV05yWjNKdmRXNWtPbk4wY21sdVp5eGNiaUFnSUNCMFpYaDBRMjlzYjNJNmMzUnlhVzVuTEZ4dUlDQWdJSFJsZUhRNklITjBjbWx1WjF0ZExGeHVJQ0FnSUhSeWFXRnVaMnhsY3o4NklGUnlhV0Z1WjJ4bFhHNGdJSDBzWEc0Z0lGdFVMbVJzWFRvZ2UxeHVJQ0FnSUdKaFkydG5jbTkxYm1RNmMzUnlhVzVuTEZ4dUlDQWdJSFJsZUhSRGIyeHZjanB6ZEhKcGJtY3NYRzRnSUNBZ2RHVjRkRG9nYzNSeWFXNW5XMTBzWEc0Z0lDQWdkSEpwWVc1bmJHVnpQem9nVkhKcFlXNW5iR1ZjYmlBZ2ZTeGNiaUFnVzFRdWMzTmRPaUI3WEc0Z0lDQWdZbUZqYTJkeWIzVnVaRHB6ZEhKcGJtY3NYRzRnSUNBZ2RHVjRkRU52Ykc5eU9uTjBjbWx1Wnl4Y2JpQWdJQ0IwWlhoME9pQnpkSEpwYm1kYlhTeGNiaUFnSUNCMGNtbGhibWRzWlhNL09pQlVjbWxoYm1kc1pWeHVJQ0I5TEZ4dUlDQmJWQzVsWlYwNklIdGNiaUFnSUNCaVlXTnJaM0p2ZFc1a09uTjBjbWx1Wnl4Y2JpQWdJQ0IwWlhoMFEyOXNiM0k2YzNSeWFXNW5MRnh1SUNBZ0lIUmxlSFE2SUhOMGNtbHVaMXRkTEZ4dUlDQWdJSFJ5YVdGdVoyeGxjejg2SUZSeWFXRnVaMnhsWEc0Z0lIMGdJQ0FnSUZ4dWZWeHVYRzVjYmx4dVpYaHdiM0owSUdOdmJuTjBJRVJGUmtGVlRGUmZWRWhGVFVVNlZHaGxiV1VnUFNCN1hHNWNiaUFnWW1GamEyZHliM1ZrT2lBbkkyWm1abVptWmljc1hHNWNiaUFnZDJsa2RHZzZJRE14Tnl4Y2JpQWdhR1ZwWjJoME9pQXpNVGNzWEc1Y2JpQWdkR2xzWlU5bVpuTmxkRmc2SURJc1hHNGdJSFJwYkdWUFptWnpaWFJaT2lBeUxGeHVJQ0IwYVd4bFEyRndPaUF5TEZ4dUlDQjBhV3hsU0dWcFoyaDBPaUF4T1N4Y2JpQWdkR2xzWlZkcFpIUm9PaUF4T1N4Y2JseHVJQ0IwYVd4bFUybDZaVG9nTVRrc1hHNGdJSFJ5YVc1bmJHVlBabVp6WlhRNklEQXVNalVzWEc1Y2JpQWdXMVF1ZEhkZE9pQjdMeTlVY21sd2JHVWdkMjl5WkZ4dUlDQWdJR0poWTJ0bmNtOTFibVE2SUNjalJqVTJOVFEySnl4Y2JpQWdJQ0IwWlhoMFEyOXNiM0k2SUNjak1EQXdNREF3Snl4Y2JpQWdJQ0IwWlhoME9pQmJKMVJTU1ZCTVFTY3NJQ2RUUVU1Qkp5d2dKMUJKVTFSRlJWUW5YU3hjYmlBZ0lDQjBjbWxoYm1kc1pYTTZJSHNnZDJsa2RHZzZJRFVzSUdobGFXZG9kRG9nTVM0MUxDQm5ZWEE2SURNc0lHRnRiM1Z1ZERvZ015d2dabWxzYkRvZ0p5TkdOVFkxTkRZbklIMWNiaUFnZlN3Z0lGeHVJQ0JiVkM1a2QxMDZJSHN2TDBSdmRXSnNaU0IzYjNKa1hHNGdJQ0FnWW1GamEyZHliM1Z1WkRvZ0p5TkdRVUpCUVRnbkxGeHVJQ0FnSUhSbGVIUkRiMnh2Y2pvZ0p5TXdNREF3TURBbkxGeHVJQ0FnSUhSbGVIUTZJRnNuVkZWUVRFRW5MQ0FuVTBGT1FTY3NJQ2RRU1ZOVVJVVlVKMTBzWEc0Z0lDQWdkSEpwWVc1bmJHVnpPaUI3SUhkcFpIUm9PaUExTENCb1pXbG5hSFE2SURFdU5Td2daMkZ3T2lBekxDQmhiVzkxYm5RNklESXNJR1pwYkd3NklDY2pSa0ZDUVVFNEp5QjlYRzRnSUgwc0lDQmNiaUFnVzFRdWRHeGRPaUI3THk5VWNtbHdiR1VnYkdWMGRHVnljMXh1SUNBZ0lHSmhZMnRuY205MWJtUTZJQ2NqTkRVNVJFSXhKeXhjYmlBZ0lDQjBaWGgwUTI5c2IzSTZJQ2NqWm1abVptWm1KeXhjYmlBZ0lDQjBaWGgwT2lCYkoxUlNTVkJNUVNjc0lDZExTVkpLUVVsT0p5d2dKMUJKVTFSRlJWUW5YU3hjYmlBZ0lDQjBjbWxoYm1kc1pYTTZJSHNnZDJsa2RHZzZJRFVzSUdobGFXZG9kRG9nTVM0MUxDQm5ZWEE2SURNc0lHRnRiM1Z1ZERvZ015d2dabWxzYkRvZ0p5TTBOVGxFUWpFbklIMWNiaUFnZlN4Y2JpQWdXMVF1Wkd4ZE9pQjdMeTlFYjNWaWJHVWdiR1YwZEdWeVhHNGdJQ0FnWW1GamEyZHliM1Z1WkRvZ0p5TkNPRVEyUkRJbkxGeHVJQ0FnSUhSbGVIUkRiMnh2Y2pvZ0p5TXdNREF3TURBbkxGeHVJQ0FnSUhSbGVIUTZJRnNuVkZWUVRFRW5MQ0FuUzBsU1NrRkpUaWNzSUNkUVNWTlVSVVZVSjEwc1hHNGdJQ0FnZEhKcFlXNW5iR1Z6T2lCN0lIZHBaSFJvT2lBMUxDQm9aV2xuYUhRNklERXVOU3dnWjJGd09pQXpMQ0JoYlc5MWJuUTZJRElzSUdacGJHdzZJQ2NqUWpoRU5rUXlKeUI5WEc0Z0lIMHNYRzRnSUZ0VUxuTnpYVG9nZXk4dlUzUmhjblJjYmlBZ0lDQmlZV05yWjNKdmRXNWtPaUFuSTBaR01EQXdNQ2NzWEc0Z0lDQWdkR1Y0ZEVOdmJHOXlPaUFuSXpBd01EQXdNQ2NzWEc0Z0lDQWdkR1Y0ZERvZ1cxMHNYRzRnSUNBZ2RISnBZVzVuYkdWek9pQjFibVJsWm1sdVpXUmNiaUFnZlN4Y2JpQWdXMVF1WldWZE9pQjdMeTlGYlhCMGVWeHVJQ0FnSUdKaFkydG5jbTkxYm1RNklDY2pRemRETUVFMEp5eGNiaUFnSUNCMFpYaDBRMjlzYjNJNklDY2pNREF3TURBd0p5eGNiaUFnSUNCMFpYaDBPaUJiWFN4Y2JpQWdJQ0IwY21saGJtZHNaWE02SUhWdVpHVm1hVzVsWkZ4dUlDQjlYRzU5WEc1Y2JtbHVkR1Z5Wm1GalpTQlVjbWxoYm1kc1pVTnZiM0prYVc1aGRHVnpJSHRjYmlBZ1l6b2dVRzlwYm5Rc1hHNGdJR015T2lCUWIybHVkQ3hjYmlBZ1l6TTZJRkJ2YVc1MExGeHVJQ0JtYVd4c09pQnpkSEpwYm1kY2JuMWNibHh1YVc1MFpYSm1ZV05sSUZScGJHVkRiMjl5WkdsdVlYUmxjeUI3WEc0Z0lHSmhZMnRuY205MWJtUTZjM1J5YVc1bk8xeHVJQ0J3T2xCdmFXNTBMRnh1SUNCd01qcFFiMmx1ZEN4Y2JpQWdjRE02VUc5cGJuUXNYRzRnSUhBME9sQnZhVzUwTEZ4dVhHNGdJSFE2SUZCdmFXNTBMRnh1SUNCME1qb2dVRzlwYm5Rc1hHNWNiaUFnZEdWNGRFTnZiRzl5T25OMGNtbHVaMXh1SUNCMFpYaDBQenB6ZEhKcGJtZGJYU3dnSUZ4dVhHNGdJR2hoYzFSeWFXRnVaMnhsY3pvZ1ltOXZiR1ZoYml4Y2JpQWdkSEpwWVc1bmJHVnpQem9nVkhKcFlXNW5iR1ZEYjI5eVpHbHVZWFJsYzF0ZFhHNTlYRzVjYm1sdWRHVnlabUZqWlNCU2IzY2dlMXh1SUNCamIyeHpPaUJVYVd4bFEyOXZjbVJwYm1GMFpYTmJYVnh1ZlZ4dVhHNXBiblJsY21aaFkyVWdRbTloY21SVVpXMXdiR0YwWlUxMWMzUmhZMmhsUkdGMFlTQjdYRzRnSUZ4dUlDQnpkbWM2SUh0Y2JpQWdJQ0IzYVdSMGFEcHpkSEpwYm1jc1hHNGdJQ0FnYUdWcFoyaDBPbk4wY21sdVp5eGNiaUFnSUNCbWFXeHNPbk4wY21sdVoxeHVJQ0I5TEZ4dVhHNGdJSFpwWlhkQ2IzZzZJSHRjYmlBZ0lDQnRhVzVZT2lCdWRXMWlaWElzWEc0Z0lDQWdiV2x1V1RvZ2JuVnRZbVZ5TEZ4dUlDQWdJSGRwWkhSb09pQnVkVzFpWlhJc1hHNGdJQ0FnYUdWcFoyaDBPaUJ1ZFcxaVpYSmNiaUFnZlN4Y2JseHVJQ0JpWVdOclozSnZkVzVrT2lCN1hHNGdJQ0FnWm1sc2JEb2djM1J5YVc1bkxGeHVJQ0FnSUhBNklGQnZhVzUwTEZ4dUlDQWdJSEF5T2lCUWIybHVkQ3hjYmlBZ0lDQndNem9nVUc5cGJuUXNYRzRnSUNBZ2NEUTZJRkJ2YVc1MFhHNGdJSDFjYmx4dUlDQXZMMVJ5YVdGdVoyeGxjeUIwWVc1elptOXliU0JqYjI5eVpHbHVZWFJsYzF4dUlDQjBjbWxoYm1kbFZISmhibk5tYjNKdE9pQjdYRzRnSUNBZ2RHOXdPaUJRYjJsdWRDeGNiaUFnSUNCaWIzUjBiMjA2SUZCdmFXNTBMRnh1SUNBZ0lHeGxablE2SUZCdmFXNTBYRzRnSUNBZ2NtbG5hSFE2SUZCdmFXNTBMQ0FnWEc0Z0lIMWNibHh1SUNCMGFXeGxVbTkzY3pvZ1VtOTNXMTFjYm4wZ1hHNWNibVY0Y0c5eWRDQmpiMjV6ZENCaWIyRnlaRTExYzNSaFkyaGxWR1Z0Y0d4aGRHVWdQU0JnSUZ4dVBITjJaeUJjYmlBZ2RtbGxkMEp2ZUQxY0ludDdkbWxsZDBKdmVDNXRhVzVZZlgwZ2UzdDJhV1YzUW05NExtMXBibGw5ZlNCN2UzWnBaWGRDYjNndWQybGtkR2g5ZlNCN2UzWnBaWGRDYjNndWFHVnBaMmgwZlgxY0lpQmNiaUFnZDJsa2RHZzlYQ0o3ZTNOMlp5NTNhV1IwYUgxOVhDSmNiaUFnYUdWcFoyaDBQVndpZTN0emRtY3VhR1ZwWjJoMGZYMWNJbHh1SUNCbWFXeHNQVndpZTN0emRtY3VabWxzYkgxOVhDSWdYRzRnSUhodGJHNXpQVndpYUhSMGNEb3ZMM2QzZHk1M015NXZjbWN2TWpBd01DOXpkbWRjSWo1Y2JseHVJQ0E4YzNSNWJHVStYRzRnSUNBZ0tpQjdYRzRnSUNBZ0lDQm1iMjUwTFhOcGVtVTZJREl1T0hCME95QWdJQ0FnSUZ4dUlDQWdJQ0FnWm05dWRDMW1ZVzFwYkhrNklITmhibk10YzJWeWFXWTdYRzRnSUNBZ2ZWeHVJQ0FnSUM1d2IybHVkSE1nZXlBZ0lDQWdJQ0FnSUNBZ0lDQmNiaUFnSUNBZ0lHWnZiblF0ZDJWcFoyaDBPaUJpYjJ4a095QWdJQ0FnSUNCY2JpQWdJQ0I5WEc0Z0lEd3ZjM1I1YkdVK1hHNGdJRnh1SUNBOGNHRjBhQ0JtYVd4c1BWd2llM3RpWVdOclozSnZkVzVrTG1acGJHeDlmVndpSUdROVhDSk5JSHQ3WW1GamEyZHliM1Z1WkM1d0xuaDlmU3g3ZTJKaFkydG5jbTkxYm1RdWNDNTVmWDBnVENCN2UySmhZMnRuY205MWJtUXVjREl1ZUgxOUxIdDdZbUZqYTJkeWIzVnVaQzV3TWk1NWZYMGdUQ0I3ZTJKaFkydG5jbTkxYm1RdWNETXVlSDE5TEh0N1ltRmphMmR5YjNWdVpDNXdNeTU1ZlgwZ1RDQjdlMkpoWTJ0bmNtOTFibVF1Y0RRdWVIMTlMSHQ3WW1GamEyZHliM1Z1WkM1d05DNTVmWDBnZWx3aUx6NWNibHh1WEc1Y2JpQWdlM3NqZEdsc1pWSnZkM045ZlZ4dUlDQWdJSHQ3STJOdmJITjlmVnh1SUNBZ0lDQWdQSEJoZEdnZ1ptbHNiRDFjSW50N1ltRmphMmR5YjNWdVpIMTlYQ0lnSUdROVhDSk5JSHQ3Y0M1NGZYMHNlM3R3TG5sOWZTQk1JSHQ3Y0RJdWVIMTlMSHQ3Y0RJdWVYMTlJRXdnZTN0d015NTRmWDBzZTN0d015NTVmWDBnVENCN2UzQTBMbmg5ZlN4N2UzQTBMbmw5ZlNCNlhDSXZQbHh1WEc0Z0lDQWdJQ0I3ZXlOb1lYTlVjbWxoYm1kc1pYTjlmVnh1SUNBZ0lDQWdYRzRnSUNBZ0lDQWdJRnh1SUNBZ0lDQWdJQ0E4WnlCMGNtRnVjMlp2Y20wOVhDSjBjbUZ1YzJ4aGRHVW9lM3QwY21saGJtZGxWSEpoYm5ObWIzSnRMblJ2Y0M1NGZYMGdlM3QwY21saGJtZGxWSEpoYm5ObWIzSnRMblJ2Y0M1NWZYMHBYQ0lnUGx4dUlDQWdJQ0FnSUNCN2V5TjBjbWxoYm1kc1pYTjlmVnh1SUNBZ0lDQWdJQ0FnSUR4d1lYUm9JR1pwYkd3OVhDSjdlMlpwYkd4OWZWd2lJR1E5WENKTklIdDdZeTU0Zlgwc2UzdGpMbmw5ZlNCTUlIdDdZekl1ZUgxOUxIdDdZekl1ZVgxOUlFd2dlM3RqTXk1NGZYMHNlM3RqTXk1NWZYMGdlbHdpTHo0Z0lDQWdJQ0JjYmlBZ0lDQWdJQ0FnZTNzdmRISnBZVzVuYkdWemZYMWNiaUFnSUNBZ0lDQWdQQzluUGx4dVhHNGdJQ0FnSUNBZ0lEeG5JSFJ5WVc1elptOXliVDFjSW5SeVlXNXpiR0YwWlNoN2UzUnlhV0Z1WjJWVWNtRnVjMlp2Y20wdWNtbG5hSFF1ZUgxOUlIdDdkSEpwWVc1blpWUnlZVzV6Wm05eWJTNXlhV2RvZEM1NWZYMHBJSEp2ZEdGMFpTZzVNQ0I3ZTNBeUxuaDlmU0I3ZTNBeUxubDlmU2xjSWlBK1hHNGdJQ0FnSUNBZ0lIdDdJM1J5YVdGdVoyeGxjMzE5WEc0Z0lDQWdJQ0FnSUNBZ1BIQmhkR2dnWm1sc2JEMWNJbnQ3Wm1sc2JIMTlYQ0lnWkQxY0lrMGdlM3RqTG5oOWZTeDdlMk11ZVgxOUlFd2dlM3RqTWk1NGZYMHNlM3RqTWk1NWZYMGdUQ0I3ZTJNekxuaDlmU3g3ZTJNekxubDlmU0I2WENJdlBpQWdJQ0FnSUZ4dUlDQWdJQ0FnSUNCN2V5OTBjbWxoYm1kc1pYTjlmVnh1SUNBZ0lDQWdJQ0E4TDJjK1hHNWNiaUFnSUNBZ0lDQWdQR2NnZEhKaGJuTm1iM0p0UFZ3aWRISmhibk5zWVhSbEtIdDdkSEpwWVc1blpWUnlZVzV6Wm05eWJTNWliM1IwYjIwdWVIMTlJSHQ3ZEhKcFlXNW5aVlJ5WVc1elptOXliUzVpYjNSMGIyMHVlWDE5S1NCeWIzUmhkR1VvTVRnd0lIdDdjREl1ZUgxOUlIdDdjREl1ZVgxOUtWd2lJRDVjYmlBZ0lDQWdJQ0FnZTNzamRISnBZVzVuYkdWemZYMWNiaUFnSUNBZ0lDQWdJQ0E4Y0dGMGFDQm1hV3hzUFZ3aWUzdG1hV3hzZlgxY0lpQmtQVndpVFNCN2UyTXVlSDE5TEh0N1l5NTVmWDBnVENCN2UyTXlMbmg5ZlN4N2UyTXlMbmw5ZlNCTUlIdDdZek11ZUgxOUxIdDdZek11ZVgxOUlIcGNJaTgrSUNBZ0lDQWdYRzRnSUNBZ0lDQWdJSHQ3TDNSeWFXRnVaMnhsYzMxOVhHNGdJQ0FnSUNBZ0lEd3ZaejVjYmx4dUlDQWdJQ0FnSUNBOFp5QjBjbUZ1YzJadmNtMDlYQ0owY21GdWMyeGhkR1VvZTN0MGNtbGhibWRsVkhKaGJuTm1iM0p0TG14bFpuUXVlSDE5SUh0N2RISnBZVzVuWlZSeVlXNXpabTl5YlM1c1pXWjBMbmw5ZlNrZ2NtOTBZWFJsS0RJM01DQjdlM0F5TG5oOWZTQjdlM0F5TG5sOWZTbGNJaUErWEc0Z0lDQWdJQ0FnSUh0N0kzUnlhV0Z1WjJ4bGMzMTlYRzRnSUNBZ0lDQWdJQ0FnUEhCaGRHZ2dabWxzYkQxY0ludDdabWxzYkgxOVhDSWdaRDFjSWswZ2UzdGpMbmg5ZlN4N2UyTXVlWDE5SUV3Z2UzdGpNaTU0Zlgwc2UzdGpNaTU1ZlgwZ1RDQjdlMk16TG5oOWZTeDdlMk16TG5sOWZTQjZYQ0l2UGlBZ0lDQWdJRnh1SUNBZ0lDQWdJQ0I3ZXk5MGNtbGhibWRzWlhOOWZWeHVJQ0FnSUNBZ0lDQThMMmMrSUNBZ0lDQWdJQ0JjYmx4dUlDQWdJQ0FnZTNzdmFHRnpWSEpwWVc1bmJHVnpmWDFjYmx4dUlDQWdJQ0FnZTNzamRHVjRkQzVzWlc1bmRHaDlmVnh1SUNBZ0lDQWdQR2NnZEhKaGJuTm1iM0p0UFZ3aWRISmhibk5zWVhSbEtIdDdkQzU0ZlgwZ2UzdDBMbmw5ZlNsY0lqNWNiaUFnSUNBZ0lDQWdQSFJsZUhRZ1kyeGhjM005WENKd2IybHVkSE5jSWlCbWFXeHNQVndpZTN0MFpYaDBRMjlzYjNKOWZWd2lQbHh1SUNBZ0lDQWdJQ0FnSUh0N0kzUmxlSFI5ZlR4MGMzQmhiaUI0UFZ3aU1Gd2lJR1I1UFZ3aU15NDFjSFJjSWo1N2V5NTlmVHd2ZEhOd1lXNCtlM3N2ZEdWNGRIMTlYRzRnSUNBZ0lDQWdJRHd2ZEdWNGRENWNiaUFnSUNBZ0lEd3ZaejVjYmlBZ0lDQWdJSHQ3TDNSbGVIUXViR1Z1WjNSb2ZYMGdJQ0JjYmlBZ0lDQWdJRnh1WEc1Y2JpQWdJQ0I3ZXk5amIyeHpmWDFjYmlBZ2Uzc3ZkR2xzWlZKdmQzTjlmVnh1UEM5emRtYytYRzVnT3lBZ1hHNWNiaThxS2x4dUlDb2dWMjl5YTNNZ2QybDBhQ0J5Wlc1a1pYSkNiMkZ5WkZOV1J5Z3BJR1oxYm1OMGFXOXVJR0o1SUhCeWIzWnBaR2x1WnlCTmRYTjBZV05vWlNCa1lYUmhJR1p2Y2lCMGFHVWdablZ1WTNScGIyNHVYRzRnS2lCQWNHRnlZVzBnZTFSb1pXMWxmU0IwYUdWdFpTQjBhR1Z0WlNCY2JpQXFJRUJ5WlhSMWNtNXpJSHRDYjJGeVpGUmxiWEJzWVhSbFRYVnpkR0ZqYUdWRVlYUmhmU0JrWVhSaFhHNGdLaTljYm1WNGNHOXlkQ0JtZFc1amRHbHZiaUJqY21WaGRHVkNiMkZ5WkVSaGRHRW9JSFJvWlcxbE9sUm9aVzFsSUNrNlFtOWhjbVJVWlcxd2JHRjBaVTExYzNSaFkyaGxSR0YwWVNCN1hHNWNiaUFnTHlvcVhHNGdJQ0FxSUhSM0lEMGdkSEpwY0d4bElIZHZjbVFnYzJOdmNtVmNiaUFnSUNvZ1pIY2dQU0JrYjNWaWJHVWdkMjl5WkNCelkyOXlaVnh1SUNBZ0tpQjBiQ0E5SUhSeWFYQnNaU0JzWlhSMFpYSWdjMk52Y21WY2JpQWdJQ29nWkd3Z1BTQmtiM1ZpYkdVZ2JHVjBkR1Z5SUhOamIzSmxYRzRnSUNBcUlITjBJRDBnYzNSaGNuUmNiaUFnSUNvZ1pXVWdQU0JsYlhCMGVWeHVJQ0FnS2k5Y2JpQWdJR052Ym5OMElIUnBiR1Z6SUQwZ1cxeHVJQ0FnSUZ0VUxuUjNMRlF1WldVc1ZDNWxaU3hVTG1Sc0xGUXVaV1VzVkM1bFpTeFVMbVZsTEZRdWRIY3NWQzVsWlN4VUxtVmxMRlF1WldVc1ZDNWtiQ3hVTG1WbExGUXVaV1VzVkM1MGQxMHNYRzRnSUNBZ1cxUXVaV1VzVkM1a2R5eFVMbVZsTEZRdVpXVXNWQzVsWlN4VUxuUnNMRlF1WldVc1ZDNWxaU3hVTG1WbExGUXVkR3dzVkM1bFpTeFVMbVZsTEZRdVpXVXNWQzVrZHl4VUxtVmxYU3hjYmlBZ0lDQmJWQzVsWlN4VUxtVmxMRlF1Wkhjc1ZDNWxaU3hVTG1WbExGUXVaV1VzVkM1bFpTeFVMbVZsTEZRdVpXVXNWQzVsWlN4VUxtVmxMRlF1WldVc1ZDNWtkeXhVTG1WbExGUXVaV1ZkTEZ4dUlDQWdJRnRVTG1Sc0xGUXVaV1VzVkM1bFpTeFVMbVIzTEZRdVpXVXNWQzVsWlN4VUxtVmxMRlF1Wkd3c1ZDNWxaU3hVTG1WbExGUXVaV1VzVkM1a2R5eFVMbVZsTEZRdVpXVXNWQzVrYkYwc1hHNGdJQ0FnVzFRdVpXVXNWQzVsWlN4VUxtVmxMRlF1WldVc1ZDNWtkeXhVTG1WbExGUXVaV1VzVkM1bFpTeFVMbVZsTEZRdVpXVXNWQzVrZHl4VUxtVmxMRlF1WldVc1ZDNWxaU3hVTG1WbFhTeGNiaUFnSUNCYlZDNWxaU3hVTG5Sc0xGUXVaV1VzVkM1bFpTeFVMbVZsTEZRdWRHd3NWQzVsWlN4VUxtVmxMRlF1WldVc1ZDNTBiQ3hVTG1WbExGUXVaV1VzVkM1bFpTeFVMblJzTEZRdVpXVmRMRnh1SUNBZ0lGdFVMbVZsTEZRdVpXVXNWQzVrYkN4VUxtVmxMRlF1WldVc1ZDNWxaU3hVTG1Sc0xGUXVaV1VzVkM1a2JDeFVMbVZsTEZRdVpXVXNWQzVsWlN4VUxtUnNMRlF1WldVc1ZDNWxaVjBzWEc0Z0lDQWdXMVF1ZEhjc1ZDNWxaU3hVTG1WbExGUXVaR3dzVkM1bFpTeFVMbVZsTEZRdVpXVXNWQzV6Y3l4VUxtVmxMRlF1WldVc1ZDNWxaU3hVTG1Sc0xGUXVaV1VzVkM1bFpTeFVMblIzWFN3Z0lDQWdYRzRnSUNBZ1cxUXVaV1VzVkM1bFpTeFVMbVJzTEZRdVpXVXNWQzVsWlN4VUxtVmxMRlF1Wkd3c1ZDNWxaU3hVTG1Sc0xGUXVaV1VzVkM1bFpTeFVMbVZsTEZRdVpHd3NWQzVsWlN4VUxtVmxYU3hjYmlBZ0lDQmJWQzVsWlN4VUxuUnNMRlF1WldVc1ZDNWxaU3hVTG1WbExGUXVkR3dzVkM1bFpTeFVMbVZsTEZRdVpXVXNWQzUwYkN4VUxtVmxMRlF1WldVc1ZDNWxaU3hVTG5Sc0xGUXVaV1ZkTENBZ0lDQmNiaUFnSUNCYlZDNWxaU3hVTG1WbExGUXVaV1VzVkM1bFpTeFVMbVIzTEZRdVpXVXNWQzVsWlN4VUxtVmxMRlF1WldVc1ZDNWxaU3hVTG1SM0xGUXVaV1VzVkM1bFpTeFVMbVZsTEZRdVpXVmRMRnh1SUNBZ0lGdFVMbVJzTEZRdVpXVXNWQzVsWlN4VUxtUjNMRlF1WldVc1ZDNWxaU3hVTG1WbExGUXVaR3dzVkM1bFpTeFVMbVZsTEZRdVpXVXNWQzVrZHl4VUxtVmxMRlF1WldVc1ZDNWtiRjBzWEc0Z0lDQWdXMVF1WldVc1ZDNWxaU3hVTG1SM0xGUXVaV1VzVkM1bFpTeFVMbVZsTEZRdVpXVXNWQzVsWlN4VUxtVmxMRlF1WldVc1ZDNWxaU3hVTG1WbExGUXVaSGNzVkM1bFpTeFVMbVZsWFN4Y2JpQWdJQ0JiVkM1bFpTeFVMbVIzTEZRdVpXVXNWQzVsWlN4VUxtVmxMRlF1ZEd3c1ZDNWxaU3hVTG1WbExGUXVaV1VzVkM1MGJDeFVMbVZsTEZRdVpXVXNWQzVsWlN4VUxtUjNMRlF1WldWZExGeHVJQ0FnSUZ0VUxuUjNMRlF1WldVc1ZDNWxaU3hVTG1Sc0xGUXVaV1VzVkM1bFpTeFVMbVZsTEZRdWRIY3NWQzVsWlN4VUxtVmxMRlF1WldVc1ZDNWtiQ3hVTG1WbExGUXVaV1VzVkM1MGQxMHNJQ0FnSUNBZ0lDQWdJQ0JjYmlBZ1hWeHVYRzRnSUdOdmJuTjBJSFJwYkdVZ1BTQjdYRzRnSUNBZ2VFOW1abk5sZERvZ2RHaGxiV1V1ZEdsc1pVOW1abk5sZEZnc1hHNGdJQ0FnZVU5bVpuTmxkRG9nZEdobGJXVXVkR2xzWlU5bVpuTmxkRmtzWEc0Z0lDQWdkMmxrZEdnNklIUm9aVzFsTG5ScGJHVlhhV1IwYUN4Y2JpQWdJQ0JvWldsbmRHZzZJSFJvWlcxbExuUnBiR1ZJWldsbmFIUXNYRzRnSUNBZ1kyRndPaUIwYUdWdFpTNTBhV3hsUTJGd0xGeHVYRzRnSUNBZ2RHbHNaVk5wZW1VNklIUm9aVzFsTG5ScGJHVlRhWHBsTEZ4dUlDQWdJSFJ5YVc1bmJHVlBabVp6WlhRNklIUm9aVzFsTG5SeWFXNW5iR1ZQWm1aelpYUmNiaUFnZlR0Y2JseHVJQ0JqYjI1emRDQnliM2R6SUQwZ2RHbHNaWE11YldGd0tDQW9jbTkzT2xSYlhTd2djbTkzU1RwdWRXMWlaWElwT2xKdmR5QTlQaUI3WEc0Z0lDQWdZMjl1YzNRZ1kyOXNjenBVYVd4bFEyOXZjbVJwYm1GMFpYTmJYU0E5SUhKdmR5NXRZWEFvSUNoamIyeDFiVzQ2VkN3Z1kyOXNTVHB1ZFcxaVpYSXBPbFJwYkdWRGIyOXlaR2x1WVhSbGN5QTlQaUI3SUNBZ0lGeHVJQ0JjYmlBZ0lDQWdJR052Ym5OMElIZ2dQU0IwYVd4bExuaFBabVp6WlhRZ0t5QjBhV3hsTG5kcFpIUm9JQ29nWTI5c1NTQXJJSFJwYkdVdVkyRndJQ29nWTI5c1NUdGNiaUFnSUNBZ0lHTnZibk4wSUhrZ1BTQjBhV3hsTG5sUFptWnpaWFFnS3lCMGFXeGxMbWhsYVdkMGFDQXFJSEp2ZDBrZ0t5QjBhV3hsTG1OaGNDQXFJSEp2ZDBrN0lDQWdJQ0FnSUNBZ1hHNGdJQ0FnSUNCY2JpQWdJQ0FnSUd4bGRDQjBjbWxoYm1kc1pYTTZWSEpwWVc1bmJHVkRiMjl5WkdsdVlYUmxjMXRkSUQwZ1cxMDdYRzRnSUNBZ0lDQmpiMjV6ZENCMGNtbGhibWRzWlVSbFptbHVhWFJwYjI0Z1BTQjBhR1Z0WlZ0amIyeDFiVzVkTG5SeWFXRnVaMnhsY3p0Y2JseHVJQ0FnSUNBZ2FXWW9JSFJ5YVdGdVoyeGxSR1ZtYVc1cGRHbHZiaUFwSUh0Y2JpQWdJQ0FnSUNBZ1ptOXlLQ0JzWlhRZ2FXNWtaWGc2Ym5WdFltVnlJRDBnTURzZ2FXNWtaWGdnUENCMGNtbGhibWRzWlVSbFptbHVhWFJwYjI0dVlXMXZkVzUwT3lCcGJtUmxlQ3NySUNrZ2UxeHVJQ0FnSUNBZ0lDQWdJR052Ym5OMElHOW1abk5sZERwUWIybHVkQ0E5SUh0Y2JpQWdJQ0FnSUNBZ0lDQWdJSGc2SUhSeWFXRnVaMnhsUkdWbWFXNXBkR2x2Ymk1bllYQWdLeUIwY21saGJtZHNaVVJsWm1sdWFYUnBiMjR1WjJGd0lDb2dhVzVrWlhnZ0t5QjBjbWxoYm1kc1pVUmxabWx1YVhScGIyNHVkMmxrZEdnZ0tpQnBibVJsZUN3Z1hHNGdJQ0FnSUNBZ0lDQWdJQ0I1T2lBd1hHNGdJQ0FnSUNBZ0lDQWdmU0FnSUNBZ0lDQWdJQ0JjYmx4dUlDQWdJQ0FnSUNBZ0lIUnlhV0Z1WjJ4bGN5NXdkWE5vS0h0Y2JpQWdJQ0FnSUNBZ0lDQWdJR002SUhzZ1hHNGdJQ0FnSUNBZ0lDQWdJQ0FnSUhnNklIZ2dLeUJ2Wm1aelpYUXVlQ3dnWEc0Z0lDQWdJQ0FnSUNBZ0lDQWdJSGs2SUhrZ0t5QnZabVp6WlhRdWVWeHVJQ0FnSUNBZ0lDQWdJQ0FnZlN4Y2JpQWdJQ0FnSUNBZ0lDQWdJR015T2lCN0lGeHVJQ0FnSUNBZ0lDQWdJQ0FnSUNCNE9pQjRJQ3NnZEhKcFlXNW5iR1ZFWldacGJtbDBhVzl1TG5kcFpIUm9JQ3NnYjJabWMyVjBMbmdzSUZ4dUlDQWdJQ0FnSUNBZ0lDQWdJQ0I1T2lCNUlDc2diMlptYzJWMExubGNiaUFnSUNBZ0lDQWdJQ0FnSUgwc1hHNGdJQ0FnSUNBZ0lDQWdJQ0JqTXpvZ2V5QmNiaUFnSUNBZ0lDQWdJQ0FnSUNBZ2VEb2dlQ0FySUhSeWFXRnVaMnhsUkdWbWFXNXBkR2x2Ymk1M2FXUjBhQ0F2SURJZ0t5QnZabVp6WlhRdWVDd2dJRnh1SUNBZ0lDQWdJQ0FnSUNBZ0lDQjVPaUI1SUMwZ2RISnBZVzVuYkdWRVpXWnBibWwwYVc5dUxtaGxhV2RvZENBcklHOW1abk5sZEM1NVhHNGdJQ0FnSUNBZ0lDQWdJQ0I5TEZ4dUlDQWdJQ0FnSUNBZ0lDQWdabWxzYkRvZ2RISnBZVzVuYkdWRVpXWnBibWwwYVc5dUxtWnBiR3dzWEc0Z0lDQWdJQ0FnSUNBZ2ZTazdYRzRnSUNBZ0lDQWdJSDBnWEc0Z0lDQWdJQ0I5SUNBZ0lDQWdYRzVjYmlBZ0lDQWdJSEpsZEhWeWJpQjdYRzRnSUNBZ0lDQWdJR0poWTJ0bmNtOTFibVE2SUhSb1pXMWxXMk52YkhWdGJsMHVZbUZqYTJkeWIzVnVaQ3hjYmlBZ0lDQWdJQ0FnY0RvZ2V5QmNiaUFnSUNBZ0lDQWdJQ0I0T2lCNExDQmNiaUFnSUNBZ0lDQWdJQ0I1T2lCNUlGeHVJQ0FnSUNBZ0lDQjlMRnh1SUNBZ0lDQWdJQ0J3TWpvZ2V5QmNiaUFnSUNBZ0lDQWdJQ0I0T2lCNElDc2dkR2xzWlM1M2FXUjBhQ3dnWEc0Z0lDQWdJQ0FnSUNBZ2VUb2dlU0JjYmlBZ0lDQWdJQ0FnZlN4Y2JpQWdJQ0FnSUNBZ2NETTZJSHNnWEc0Z0lDQWdJQ0FnSUNBZ2VEb2dlQ0FySUhScGJHVXVkMmxrZEdnc0lGeHVJQ0FnSUNBZ0lDQWdJSGs2SUhrZ0t5QjBhV3hsTG1obGFXZDBhQ0JjYmlBZ0lDQWdJQ0FnZlN4Y2JpQWdJQ0FnSUNBZ2NEUTZJSHNnWEc0Z0lDQWdJQ0FnSUNBZ2VEb2dlQ3dnWEc0Z0lDQWdJQ0FnSUNBZ2VUb2dlU0FySUhScGJHVXVhR1ZwWjNSb1hHNGdJQ0FnSUNBZ0lIMHNYRzRnSUZ4dUlDQWdJQ0FnSUNCMFpYaDBRMjlzYjNJNklIUm9aVzFsVzJOdmJIVnRibDB1ZEdWNGRFTnZiRzl5TEZ4dUlDQWdJQ0FnSUNCMFpYaDBPaUIwYUdWdFpWdGpiMngxYlc1ZExuUmxlSFFzWEc0Z0lGeHVJQ0FnSUNBZ0lDQjBPaUI3WEc0Z0lDQWdJQ0FnSUNBZ2VEb2dlQ0FySURFdU5TeGNiaUFnSUNBZ0lDQWdJQ0I1T2lCNUlDc2dNbHh1SUNBZ0lDQWdJQ0I5TEZ4dUlDQmNiaUFnSUNBZ0lDQWdkREk2SUh0Y2JpQWdJQ0FnSUNBZ0lDQjRMQ0I1WEc0Z0lDQWdJQ0FnSUgwc1hHNGdJQ0FnSUNBZ0lGeHVJQ0FnSUNBZ0lDQjBjbWxoYm1kc1pYTXNYRzRnSUNBZ0lDQWdJR2hoYzFSeWFXRnVaMnhsY3pvZ2RISnBZVzVuYkdWekxteGxibWQwYUNBK0lEQmNiaUFnSUNBZ0lIMWNiaUFnSUNCOUtUdGNiaUFnWEc0Z0lDQWdjbVYwZFhKdUlIc2dZMjlzY3lCOU8xeHVJQ0I5S1R0Y2JseHVJQ0JqYjI1emRDQmtZWFJoSUQwZ2UxeHVYRzRnSUNBZ0x5OVVhR1Z6WlNCallXNGdZbVVnZFhObFpDQjBieUJ6WTJGc1pTQjBhR2x1WnlCMGJ5Qm1hVzVoYkNCemFYcGxYRzRnSUNBZ2MzWm5PaUI3SUZ4dUlDQWdJQ0FnWm1sc2JEb2dKMjV2Ym1VbkxGeHVJQ0FnSUNBZ2QybGtkR2c2SUdBa2UzUm9aVzFsTG5kcFpIUm9mVzF0WUN4Y2JpQWdJQ0FnSUdobGFXZG9kRG9nWUNSN2RHaGxiV1V1YUdWcFoyaDBmVzF0WUZ4dUlDQWdJSDBzWEc0Z0lGeHVJQ0FnSUM4dlNXNTBaWEp1WVd3Z1kyOXZjbVJwYm1GMFpTQnplWE4wWlcwc0lHVjJaWEpsZEdocGJtY2dabTlzYkc5M2N5QjBhR2x6SVZ4dUlDQWdJSFpwWlhkQ2IzZzZJSHRjYmlBZ0lDQWdJRzFwYmxnNklEQXNJRzFwYmxrNk1DeGNiaUFnSUNBZ0lIZHBaSFJvT2lCMGFHVnRaUzUzYVdSMGFDd2dhR1ZwWjJoME9pQjBhR1Z0WlM1b1pXbG5hSFJjYmlBZ0lDQjlMRnh1WEc0Z0lDQWdkR2xzWlN4Y2JseHVJQ0FnSUdKaFkydG5jbTkxYm1RNklIdGNiaUFnSUNBZ0lHWnBiR3c2SUhSb1pXMWxMbUpoWTJ0bmNtOTFaQ3hjYmlBZ0lDQWdJSEE2SUhzZ2VEb3dMQ0I1T2pBZ2ZTeGNiaUFnSUNBZ0lIQXlPaUI3SUhnNklIUm9aVzFsTG5kcFpIUm9MQ0I1T2lBd0lIMHNYRzRnSUNBZ0lDQndNem9nZXlCNE9pQjBhR1Z0WlM1M2FXUjBhQ3dnZVRvZ2RHaGxiV1V1YUdWcFoyaDBJSDBzWEc0Z0lDQWdJQ0J3TkRvZ2V5QjRPaUF3TENCNU9pQjBhR1Z0WlM1b1pXbG5hSFFnZlN3Z0lDQWdJQ0JjYmlBZ0lDQjlMRnh1WEc0Z0lDQWdkSEpwWVc1blpWUnlZVzV6Wm05eWJUb2dlMXh1SUNBZ0lDQWdkRzl3T2lCN0lIZzZJREFzSUhrNklIUnBiR1V1ZEhKcGJtZHNaVTltWm5ObGRDQjlMRnh1SUNBZ0lDQWdjbWxuYUhRNklIc2dlRG9nTFhScGJHVXVkSEpwYm1kc1pVOW1abk5sZEN3Z2VUb2dkR2xzWlM1MGFXeGxVMmw2WlNCOUxGeHVJQ0FnSUNBZ1ltOTBkRzl0T2lBZ2V5QjRPaUF0S0hScGJHVXVkR2xzWlZOcGVtVWdLU0FzSUhrNklIUnBiR1V1ZEdsc1pWTnBlbVVnTFNCMGFXeGxMblJ5YVc1bmJHVlBabVp6WlhRZ2ZTeGNiaUFnSUNBZ0lHeGxablE2SUNCN0lIZzZJQzBvZEdsc1pTNTBhV3hsVTJsNlpTQXRJSFJwYkdVdWRISnBibWRzWlU5bVpuTmxkQ2tzSUhrNklEQWdmU3dnWEc0Z0lDQWdmU3dnWEc1Y2JpQWdJQ0IwYVd4bFVtOTNjem9nY205M2MxeHVJQ0I5WEc1Y2JpQWdjbVYwZFhKdUlHUmhkR0U3WEc1OVhHNWNibHh1WEc0dktpcGNiaUFxSUVOeVpXRjBaU0JDYjJGeVpDQnpkbWNnYVdOdmJseHVJQ29nUUhCaGNtRnRJSE4yWjFSbGJYQnNZWFJsSUVKdllYSmtKM01nYzNabklIUmxiWEJzWVhSbFhHNGdLaUJBY0dGeVlXMGdiWFZ6ZEdGamFHVkVZWFJoSUcxMWMzUmhZMmhsSUdSaGRHRWdabTl5SUdKdllYSmtYRzRnS2lCQWNtVjBkWEp1Y3lCemRtY2dhV052Ymx4dUlDb3ZYRzVsZUhCdmNuUWdablZ1WTNScGIyNGdjbVZ1WkdWeVFtOWhjbVJUVmtjb0lITjJaMVJsYlhCc1lYUmxPbk4wY21sdVp5d2dYRzRnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lDQWdJQ0FnSUNBZ0lHMTFjM1JoWTJobFJHRjBZVHBDYjJGeVpGUmxiWEJzWVhSbFRYVnpkR0ZqYUdWRVlYUmhJQ2s2YzNSeWFXNW5JSHRjYmlBZ1hHNGdJR052Ym5OMElHaDBiV3dnUFNCdGRYTjBZV05vWlM1eVpXNWtaWElvYzNablZHVnRjR3hoZEdVc0lHMTFjM1JoWTJobFJHRjBZU3dnZTMwcE95QWdYRzRnSUhKbGRIVnliaUJvZEcxc08xeHVmVnh1WEc0aVhYMD0iLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2F3YWl0ZXIgPSAodGhpcyAmJiB0aGlzLl9fYXdhaXRlcikgfHwgZnVuY3Rpb24gKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xuICAgIGZ1bmN0aW9uIGFkb3B0KHZhbHVlKSB7IHJldHVybiB2YWx1ZSBpbnN0YW5jZW9mIFAgPyB2YWx1ZSA6IG5ldyBQKGZ1bmN0aW9uIChyZXNvbHZlKSB7IHJlc29sdmUodmFsdWUpOyB9KTsgfVxuICAgIHJldHVybiBuZXcgKFAgfHwgKFAgPSBQcm9taXNlKSkoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XG4gICAgICAgIGZ1bmN0aW9uIHJlamVjdGVkKHZhbHVlKSB7IHRyeSB7IHN0ZXAoZ2VuZXJhdG9yW1widGhyb3dcIl0odmFsdWUpKTsgfSBjYXRjaCAoZSkgeyByZWplY3QoZSk7IH0gfVxuICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfVxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XG4gICAgfSk7XG59O1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZXhwb3J0cy5jb252ZXJ0U1ZHdG9DYW52YXMgPSBleHBvcnRzLnRvUG5nID0gZXhwb3J0cy5kZWJvdW5jZSA9IHZvaWQgMDtcbmZ1bmN0aW9uIGRlYm91bmNlKGNhbGxiYWNrLCB0aW1lb3V0ID0gMzAwKSB7XG4gICAgbGV0IHRpbWVyO1xuICAgIGZ1bmN0aW9uIHdyYXBwZXIoLi4uYXJncykge1xuICAgICAgICBjbGVhclRpbWVvdXQodGltZXIpO1xuICAgICAgICB0aW1lciA9IHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgICAgY2FsbGJhY2suYXBwbHkod3JhcHBlciwgYXJncyk7XG4gICAgICAgIH0sIHRpbWVvdXQpO1xuICAgIH1cbiAgICByZXR1cm4gd3JhcHBlcjtcbn1cbmV4cG9ydHMuZGVib3VuY2UgPSBkZWJvdW5jZTtcbmNvbnN0IGNhbnZnXzEgPSByZXF1aXJlKFwiY2FudmdcIik7XG5mdW5jdGlvbiB0b1BuZyhkYXRhKSB7XG4gICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgcHJlc2V0ID0gY2FudmdfMS5wcmVzZXRzLm9mZnNjcmVlbigpO1xuICAgICAgICBjb25zdCB7IHdpZHRoLCBoZWlnaHQsIHN2ZyB9ID0gZGF0YTtcbiAgICAgICAgY29uc3QgY2FudmFzID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgY29uc3QgY3R4ID0gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgIGNvbnN0IHYgPSB5aWVsZCBjYW52Z18xLkNhbnZnLmZyb21TdHJpbmcoY3R4LCBzdmcsIHByZXNldCk7XG4gICAgICAgIHYucmVzaXplKHdpZHRoLCBoZWlnaHQsICd4TWlkWU1pZCBtZWV0Jyk7XG4gICAgICAgIC8vIFJlbmRlciBvbmx5IGZpcnN0IGZyYW1lLCBpZ25vcmluZyBhbmltYXRpb25zIGFuZCBtb3VzZS5cbiAgICAgICAgeWllbGQgdi5yZW5kZXIoKTtcbiAgICAgICAgY29uc3QgYmxvYiA9IHlpZWxkIGNhbnZhcy5jb252ZXJ0VG9CbG9iKCk7XG4gICAgICAgIGNvbnN0IHBuZ1VybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG4gICAgICAgIHJldHVybiBwbmdVcmw7XG4gICAgfSk7XG59XG5leHBvcnRzLnRvUG5nID0gdG9Qbmc7XG5mdW5jdGlvbiBjb252ZXJ0U1ZHdG9DYW52YXMoZGF0YSkge1xuICAgIGNvbnN0IHsgd2lkdGgsIGhlaWdodCwgc3ZnIH0gPSBkYXRhO1xuICAgIGxldCBjYW52ZyA9IG51bGw7XG4gICAgd2luZG93Lm9ubG9hZCA9ICgpID0+IF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHtcbiAgICAgICAgY29uc3QgY2FudmFzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignY2FudmFzJyk7XG4gICAgICAgIGNvbnN0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBjYW52ZyA9IGNhbnZnXzEuQ2FudmcuZnJvbVN0cmluZyhjdHgsIHN2Zywge30pO1xuICAgICAgICAvLyBTdGFydCBTVkcgcmVuZGVyaW5nIHdpdGggYW5pbWF0aW9ucyBhbmQgbW91c2UgaGFuZGxpbmcuXG4gICAgICAgIGNhbnZnLnN0YXJ0KCk7XG4gICAgfSk7XG4gICAgd2luZG93Lm9uYmVmb3JldW5sb2FkID0gKCkgPT4ge1xuICAgICAgICBjYW52Zy5zdG9wKCk7XG4gICAgfTtcbn1cbmV4cG9ydHMuY29udmVydFNWR3RvQ2FudmFzID0gY29udmVydFNWR3RvQ2FudmFzO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYUdWc2NHVnljeTVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYklpNHVMeTR1TDNOeVl5OWpiR2xsYm5RdmFHVnNjR1Z5Y3k1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU96czdPenM3T3pzN096czdRVUZCUVN4VFFVRm5RaXhSUVVGUkxFTkJRVVVzVVVGQmFVSXNSVUZCUlN4VlFVRnBRaXhIUVVGSE8wbEJSUzlFTEVsQlFVa3NTMEZCVXl4RFFVRkRPMGxCUldRc1UwRkJVeXhQUVVGUExFTkJRVU1zUjBGQlJ5eEpRVUZYTzFGQlF6ZENMRmxCUVZrc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF6dFJRVU53UWl4TFFVRkxMRWRCUVVjc1ZVRkJWU3hEUVVGRExFZEJRVWNzUlVGQlJUdFpRVU4wUWl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRkxFOUJRVThzUlVGQlJTeEpRVUZKTEVOQlFVVXNRMEZCUXp0UlFVTnNReXhEUVVGRExFVkJRVVVzVDBGQlR5eERRVUZETEVOQlFVTTdTVUZEWkN4RFFVRkRPMGxCUlVRc1QwRkJUeXhQUVVGUExFTkJRVU03UVVGRGFrSXNRMEZCUXp0QlFWcEVMRFJDUVZsRE8wRkJSVVFzYVVOQlFYVkRPMEZCVTNaRExGTkJRWE5DTEV0QlFVc3NRMEZCUXl4SlFVRnBRanM3VVVGRk0wTXNUVUZCVFN4TlFVRk5MRWRCUVVjc1pVRkJUeXhEUVVGRExGTkJRVk1zUlVGQlJTeERRVUZCTzFGQlJXeERMRTFCUVUwc1JVRkRTaXhMUVVGTExFVkJRMHdzVFVGQlRTeEZRVU5PTEVkQlFVY3NSVUZEU2l4SFFVRkhMRWxCUVVrc1EwRkJRenRSUVVWVUxFMUJRVTBzVFVGQlRTeEhRVUZITEVsQlFVa3NaVUZCWlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hOUVVGTkxFTkJRVU1zUTBGQlF6dFJRVU5zUkN4TlFVRk5MRWRCUVVjc1IwRkJSeXhOUVVGTkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NRMEZCVVN4RFFVRkZPMUZCUXpWRExFMUJRVTBzUTBGQlF5eEhRVUZITEUxQlFVMHNZVUZCU3l4RFFVRkRMRlZCUVZVc1EwRkJReXhIUVVGSExFVkJRVVVzUjBGQlJ5eEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkJPMUZCUld4RUxFTkJRVU1zUTBGQlF5eE5RVUZOTEVOQlFVTXNTMEZCU3l4RlFVRkZMRTFCUVUwc1JVRkJSU3hsUVVGbExFTkJRVU1zUTBGQlFUdFJRVVY0UXl3d1JFRkJNRVE3VVVGRE1VUXNUVUZCVFN4RFFVRkRMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVUU3VVVGRmFFSXNUVUZCVFN4SlFVRkpMRWRCUVVjc1RVRkJUU3hOUVVGTkxFTkJRVU1zWVVGQllTeEZRVUZGTEVOQlFVRTdVVUZEZWtNc1RVRkJUU3hOUVVGTkxFZEJRVWNzUjBGQlJ5eERRVUZETEdWQlFXVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRVHRSUVVWNFF5eFBRVUZQTEUxQlFVMHNRMEZCUVR0SlFVTm1MRU5CUVVNN1EwRkJRVHRCUVhaQ1JDeHpRa0YxUWtNN1FVRkZSQ3hUUVVGblFpeHJRa0ZCYTBJc1EwRkJReXhKUVVGcFFqdEpRVVZzUkN4TlFVRk5MRVZCUTBvc1MwRkJTeXhGUVVOTUxFMUJRVTBzUlVGRFRpeEhRVUZITEVWQlEwb3NSMEZCUnl4SlFVRkpMRU5CUVVNN1NVRkZWQ3hKUVVGSkxFdEJRVXNzUjBGQlR5eEpRVUZKTEVOQlFVTTdTVUZGY2tJc1RVRkJUU3hEUVVGRExFMUJRVTBzUjBGQlJ5eEhRVUZUTEVWQlFVVTdVVUZEZWtJc1RVRkJUU3hOUVVGTkxFZEJRVWNzVVVGQlVTeERRVUZETEdGQlFXRXNRMEZCUXl4UlFVRlJMRU5CUVhOQ0xFTkJRVU03VVVGRGNrVXNUVUZCVFN4SFFVRkhMRWRCUVVjc1RVRkJUU3hEUVVGRExGVkJRVlVzUTBGQlF5eEpRVUZKTEVOQlFUWkNMRU5CUVVNN1VVRkZhRVVzUzBGQlN5eEhRVUZITEdGQlFVc3NRMEZCUXl4VlFVRlZMRU5CUVVNc1IwRkJSeXhGUVVGRkxFZEJRVWNzUlVGQlJTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVVjJReXd3UkVGQk1FUTdVVUZETVVRc1MwRkJTeXhEUVVGRExFdEJRVXNzUlVGQlJTeERRVUZETzBsQlEyaENMRU5CUVVNc1EwRkJRU3hEUVVGRE8wbEJSVVlzVFVGQlRTeERRVUZETEdOQlFXTXNSMEZCUnl4SFFVRkhMRVZCUVVVN1VVRkRNMElzUzBGQlN5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRPMGxCUTJZc1EwRkJReXhEUVVGRE8wRkJRMG9zUTBGQlF6dEJRWFpDUkN4blJFRjFRa01pTENKemIzVnlZMlZ6UTI5dWRHVnVkQ0k2V3lKbGVIQnZjblFnWm5WdVkzUnBiMjRnWkdWaWIzVnVZMlVvSUdOaGJHeGlZV05yT2taMWJtTjBhVzl1TENCMGFXMWxiM1YwT201MWJXSmxjaUE5SURNd01DQXBJSHRjYmx4dUlDQnNaWFFnZEdsdFpYSTZZVzU1TzF4dVhHNGdJR1oxYm1OMGFXOXVJSGR5WVhCd1pYSW9MaTR1WVhKbmN6b2dZVzU1VzEwcElIdGNiaUFnSUNCamJHVmhjbFJwYldWdmRYUW9kR2x0WlhJcE8xeHVJQ0FnSUhScGJXVnlJRDBnYzJWMFZHbHRaVzkxZENnb0tTQTlQaUI3WEc0Z0lDQWdJQ0JqWVd4c1ltRmpheTVoY0hCc2VTZ2dkM0poY0hCbGNpd2dZWEpuY3lBcE8xeHVJQ0FnSUgwc0lIUnBiV1Z2ZFhRcE8xeHVJQ0I5WEc1Y2JpQWdjbVYwZFhKdUlIZHlZWEJ3WlhJN1hHNTlYRzVjYm1sdGNHOXlkQ0I3SUVOaGJuWm5MQ0J3Y21WelpYUnpJSDBnWm5KdmJTQW5ZMkZ1ZG1jbk8xeHVYRzVsZUhCdmNuUWdhVzUwWlhKbVlXTmxJRlJ2VUc1blQzQjBhVzl1Y3lCN1hHNGdJSGRwWkhSb09pQnVkVzFpWlhJc1hHNGdJR2hsYVdkb2REb2diblZ0WW1WeUxGeHVJQ0J6ZG1jNklITjBjbWx1WjF4dWZWeHVYRzVjYm1WNGNHOXlkQ0JoYzNsdVl5Qm1kVzVqZEdsdmJpQjBiMUJ1Wnloa1lYUmhPbFJ2VUc1blQzQjBhVzl1Y3lrZ2UxeHVJQ0JjYmlBZ1kyOXVjM1FnY0hKbGMyVjBJRDBnY0hKbGMyVjBjeTV2Wm1aelkzSmxaVzRvS1Z4dVhHNGdJR052Ym5OMElIdGNiaUFnSUNCM2FXUjBhQ3hjYmlBZ0lDQm9aV2xuYUhRc1hHNGdJQ0FnYzNablhHNGdJSDBnUFNCa1lYUmhPMXh1WEc0Z0lHTnZibk4wSUdOaGJuWmhjeUE5SUc1bGR5QlBabVp6WTNKbFpXNURZVzUyWVhNb2QybGtkR2dzSUdobGFXZG9kQ2s3WEc0Z0lHTnZibk4wSUdOMGVDQTlJR05oYm5aaGN5NW5aWFJEYjI1MFpYaDBLQ2N5WkNjcElHRnpJR0Z1ZVNBN1hHNGdJR052Ym5OMElIWWdQU0JoZDJGcGRDQkRZVzUyWnk1bWNtOXRVM1J5YVc1bktHTjBlQ3dnYzNabkxDQndjbVZ6WlhRcFhHNGdJRnh1SUNCMkxuSmxjMmw2WlNoM2FXUjBhQ3dnYUdWcFoyaDBMQ0FuZUUxcFpGbE5hV1FnYldWbGRDY3BYRzVjYmlBZ0x5OGdVbVZ1WkdWeUlHOXViSGtnWm1seWMzUWdabkpoYldVc0lHbG5ibTl5YVc1bklHRnVhVzFoZEdsdmJuTWdZVzVrSUcxdmRYTmxMbHh1SUNCaGQyRnBkQ0IyTG5KbGJtUmxjaWdwWEc1Y2JpQWdZMjl1YzNRZ1lteHZZaUE5SUdGM1lXbDBJR05oYm5aaGN5NWpiMjUyWlhKMFZHOUNiRzlpS0NsY2JpQWdZMjl1YzNRZ2NHNW5WWEpzSUQwZ1ZWSk1MbU55WldGMFpVOWlhbVZqZEZWU1RDaGliRzlpS1Z4dVhHNGdJSEpsZEhWeWJpQndibWRWY214Y2JuMWNibHh1Wlhod2IzSjBJR1oxYm1OMGFXOXVJR052Ym5abGNuUlRWa2QwYjBOaGJuWmhjeWhrWVhSaE9sUnZVRzVuVDNCMGFXOXVjeWtnZTF4dVhHNGdJR052Ym5OMElIdGNiaUFnSUNCM2FXUjBhQ3hjYmlBZ0lDQm9aV2xuYUhRc1hHNGdJQ0FnYzNablhHNGdJSDBnUFNCa1lYUmhPMXh1WEc0Z0lHeGxkQ0JqWVc1Mlp6cGhibmtnUFNCdWRXeHNPeUFnWEc1Y2JpQWdkMmx1Wkc5M0xtOXViRzloWkNBOUlHRnplVzVqSUNncElEMCtJSHRjYmlBZ0lDQmpiMjV6ZENCallXNTJZWE1nUFNCa2IyTjFiV1Z1ZEM1eGRXVnllVk5sYkdWamRHOXlLQ2RqWVc1MllYTW5LU0JoY3lCSVZFMU1RMkZ1ZG1GelJXeGxiV1Z1ZER0Y2JpQWdJQ0JqYjI1emRDQmpkSGdnUFNCallXNTJZWE11WjJWMFEyOXVkR1Y0ZENnbk1tUW5LU0JoY3lCRFlXNTJZWE5TWlc1a1pYSnBibWREYjI1MFpYaDBNa1E3WEc0Z0lGeHVJQ0FnSUdOaGJuWm5JRDBnUTJGdWRtY3Vabkp2YlZOMGNtbHVaeWhqZEhnc0lITjJaeXdnZTMwcE8xeHVJQ0JjYmlBZ0lDQXZMeUJUZEdGeWRDQlRWa2NnY21WdVpHVnlhVzVuSUhkcGRHZ2dZVzVwYldGMGFXOXVjeUJoYm1RZ2JXOTFjMlVnYUdGdVpHeHBibWN1WEc0Z0lDQWdZMkZ1ZG1jdWMzUmhjblFvS1R0Y2JpQWdmVHRjYmlBZ1hHNGdJSGRwYm1SdmR5NXZibUpsWm05eVpYVnViRzloWkNBOUlDZ3BJRDArSUh0Y2JpQWdJQ0JqWVc1Mlp5NXpkRzl3S0NrN1hHNGdJSDA3WEc1OUlsMTkiLCJcInVzZSBzdHJpY3RcIjtcbnZhciBfX2ltcG9ydERlZmF1bHQgPSAodGhpcyAmJiB0aGlzLl9faW1wb3J0RGVmYXVsdCkgfHwgZnVuY3Rpb24gKG1vZCkge1xuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgXCJkZWZhdWx0XCI6IG1vZCB9O1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IG11c3RhY2hlXzEgPSBfX2ltcG9ydERlZmF1bHQocmVxdWlyZShcIm11c3RhY2hlXCIpKTtcbmNvbnN0IGJvYXJkXzEgPSByZXF1aXJlKFwiLi9ib2FyZFwiKTtcbmNvbnN0IGhlbHBlcnNfMSA9IHJlcXVpcmUoXCIuL2hlbHBlcnNcIik7XG5jb25zdCBIQVVTS0FfVEhFTUUgPSBPYmplY3QuYXNzaWduKE9iamVjdC5hc3NpZ24oe30sIGJvYXJkXzEuREVGQVVMVF9USEVNRSksIHsgYmFja2dyb3VkOiAnIzJEMUQyMCcsIFtib2FyZF8xLlQudHddOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjRjk3MjE4JyxcbiAgICAgICAgdGV4dENvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIHRleHQ6IFsnVFJJUExBJywgJ1NBTkEnLCAnUElTVEVFVCddLFxuICAgICAgICB0cmlhbmdsZXM6IHsgd2lkdGg6IDUsIGhlaWdodDogMiwgZ2FwOiAxLCBhbW91bnQ6IDMsIGZpbGw6ICcjRjk3MjE4JyB9XG4gICAgfSwgW2JvYXJkXzEuVC5kd106IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyNFNDM3NEQnLFxuICAgICAgICB0ZXh0Q29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgdGV4dDogWydUVVBMQScsICdTQU5BJywgJ1BJU1RFRVQnXSxcbiAgICAgICAgdHJpYW5nbGVzOiB7IHdpZHRoOiA1LCBoZWlnaHQ6IDIsIGdhcDogMywgYW1vdW50OiAyLCBmaWxsOiAnI0U0Mzc0RCcgfVxuICAgIH0sIFtib2FyZF8xLlQudGxdOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjNkFBQTI0JyxcbiAgICAgICAgdGV4dENvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIHRleHQ6IFsnVFJJUExBJywgJ0tJUkpBSU4nLCAnUElTVEVFVCddLFxuICAgICAgICB0cmlhbmdsZXM6IHsgd2lkdGg6IDUsIGhlaWdodDogMiwgZ2FwOiAxLCBhbW91bnQ6IDMsIGZpbGw6ICcjNkFBQTI0JyB9XG4gICAgfSwgW2JvYXJkXzEuVC5kbF06IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyM0QThCQzUnLFxuICAgICAgICB0ZXh0Q29sb3I6ICcjZmZmZmZmJyxcbiAgICAgICAgdGV4dDogWydUVVBMQScsICdLSVJKQUlOJywgJ1BJU1RFRVQnXSxcbiAgICAgICAgdHJpYW5nbGVzOiB7IHdpZHRoOiA1LCBoZWlnaHQ6IDIsIGdhcDogMywgYW1vdW50OiAyLCBmaWxsOiAnIzRBOEJDNScgfVxuICAgIH0sIFtib2FyZF8xLlQuc3NdOiB7XG4gICAgICAgIGJhY2tncm91bmQ6ICcjREQzNzNCJyxcbiAgICAgICAgdGV4dENvbG9yOiAnI2ZmZmZmZicsXG4gICAgICAgIHRleHQ6IFtdXG4gICAgfSwgW2JvYXJkXzEuVC5lZV06IHtcbiAgICAgICAgYmFja2dyb3VuZDogJyNmZmZmZmYnLFxuICAgICAgICB0ZXh0Q29sb3I6ICcjMDAwMDAwJyxcbiAgICAgICAgdGV4dDogW11cbiAgICB9IH0pO1xuY29uc3QgbXVzdGFjaGVEYXRhID0gKDAsIGJvYXJkXzEuY3JlYXRlQm9hcmREYXRhKShIQVVTS0FfVEhFTUUpO1xuY29uc3Qgc3ZnSHRtbCA9ICgwLCBib2FyZF8xLnJlbmRlckJvYXJkU1ZHKShib2FyZF8xLmJvYXJkTXVzdGFjaGVUZW1wbGF0ZSwgbXVzdGFjaGVEYXRhKTtcbmZ1bmN0aW9uIHJlbmRlckRvY3VtZW50KCkge1xuICAgIGNvbnN0IGRvY3VtZW50SHRtbCA9IG11c3RhY2hlXzEuZGVmYXVsdC5yZW5kZXIoYFxuICB7e3tzdmd9fX1cbiAgXG4gIDxzdHlsZT5cbiAgYSB7XG4gICAgZm9udC1zaXplOiAyMHB4O1xuICAgIGRpc3BsYXk6IG5vbmU7XG5cbiAgfVxuICBpbWcge1xuICAgIG1heC13aWR0aDogMTAwJTtcbiAgICBoZWlnaHQ6IDEwMCU7IFxuICB9XG5cbiAgPC9zdHlsZT4gIFxuICA8aW1nIGlkPVwiYm9hcmRcIiBhbHQ9XCJCb2FyZFwiPlxuICBgLCB7IHN2Zzogc3ZnSHRtbCB9KTtcbiAgICBkb2N1bWVudC5ib2R5LmlubmVySFRNTCA9IGRvY3VtZW50SHRtbDtcbiAgICAvL0NvbnZlcnQgdG8gUE5HIGltYWdlIGFuZCBpbnNlcnQgaXQgdG8gRE9NXG4gICAgKDAsIGhlbHBlcnNfMS50b1BuZykoe1xuICAgICAgICB3aWR0aDogMzAwMCxcbiAgICAgICAgaGVpZ2h0OiAzMDAwLFxuICAgICAgICBzdmc6IHN2Z0h0bWxcbiAgICB9KS50aGVuKChwbmdVcmwpID0+IHtcbiAgICAgICAgY29uc3QgaW1nID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignaW1nI2JvYXJkJyk7XG4gICAgICAgIGltZy5zcmMgPSBwbmdVcmw7XG4gICAgfSk7XG59XG5yZW5kZXJEb2N1bWVudCgpO1xuLy9jb252ZXJ0U1ZHdG9DYW52YXMoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWFXNWtaWGd1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SXVMaTh1TGk5emNtTXZZMnhwWlc1MEwybHVaR1Y0TG5SeklsMHNJbTVoYldWeklqcGJYU3dpYldGd2NHbHVaM01pT2lJN096czdPMEZCUVVFc2QwUkJRV2RETzBGQlJXaERMRzFEUVVFd1J6dEJRVU14Unl4MVEwRkJhME03UVVGRmJFTXNUVUZCVFN4WlFVRlpMRzFEUVVWaUxIRkNRVUZoTEV0QlJXaENMRk5CUVZNc1JVRkJSU3hUUVVGVExFVkJSWEJDTEVOQlFVTXNVMEZCUXl4RFFVRkRMRVZCUVVVc1EwRkJReXhGUVVGRk8xRkJRMDRzVlVGQlZTeEZRVUZGTEZOQlFWTTdVVUZEY2tJc1UwRkJVeXhGUVVGRkxGTkJRVk03VVVGRGNFSXNTVUZCU1N4RlFVRkZMRU5CUVVNc1VVRkJVU3hGUVVGRkxFMUJRVTBzUlVGQlJTeFRRVUZUTEVOQlFVTTdVVUZEYmtNc1UwRkJVeXhGUVVGRkxFVkJRVVVzUzBGQlN5eEZRVUZGTEVOQlFVTXNSVUZCUlN4TlFVRk5MRVZCUVVVc1EwRkJReXhGUVVGRkxFZEJRVWNzUlVGQlJTeERRVUZETEVWQlFVVXNUVUZCVFN4RlFVRkZMRU5CUVVNc1JVRkJSU3hKUVVGSkxFVkJRVVVzVTBGQlV5eEZRVUZGTzB0QlEzWkZMRVZCUTBRc1EwRkJReXhUUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVTdVVUZEVGl4VlFVRlZMRVZCUVVVc1UwRkJVenRSUVVOeVFpeFRRVUZUTEVWQlFVVXNVMEZCVXp0UlFVTndRaXhKUVVGSkxFVkJRVVVzUTBGQlF5eFBRVUZQTEVWQlFVVXNUVUZCVFN4RlFVRkZMRk5CUVZNc1EwRkJRenRSUVVOc1F5eFRRVUZUTEVWQlFVVXNSVUZCUlN4TFFVRkxMRVZCUVVVc1EwRkJReXhGUVVGRkxFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNSMEZCUnl4RlFVRkZMRU5CUVVNc1JVRkJSU3hOUVVGTkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVsQlFVa3NSVUZCUlN4VFFVRlRMRVZCUVVVN1MwRkRka1VzUlVGRFJDeERRVUZETEZOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1JVRkJSVHRSUVVOT0xGVkJRVlVzUlVGQlJTeFRRVUZUTzFGQlEzSkNMRk5CUVZNc1JVRkJSU3hUUVVGVE8xRkJRM0JDTEVsQlFVa3NSVUZCUlN4RFFVRkRMRkZCUVZFc1JVRkJSU3hUUVVGVExFVkJRVVVzVTBGQlV5eERRVUZETzFGQlEzUkRMRk5CUVZNc1JVRkJSU3hGUVVGRkxFdEJRVXNzUlVGQlJTeERRVUZETEVWQlFVVXNUVUZCVFN4RlFVRkZMRU5CUVVNc1JVRkJSU3hIUVVGSExFVkJRVVVzUTBGQlF5eEZRVUZGTEUxQlFVMHNSVUZCUlN4RFFVRkRMRVZCUVVVc1NVRkJTU3hGUVVGRkxGTkJRVk1zUlVGQlJUdExRVU4yUlN4RlFVTkVMRU5CUVVNc1UwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eEZRVUZGTzFGQlEwNHNWVUZCVlN4RlFVRkZMRk5CUVZNN1VVRkRja0lzVTBGQlV5eEZRVUZGTEZOQlFWTTdVVUZEY0VJc1NVRkJTU3hGUVVGRkxFTkJRVU1zVDBGQlR5eEZRVUZGTEZOQlFWTXNSVUZCUlN4VFFVRlRMRU5CUVVNN1VVRkRja01zVTBGQlV5eEZRVUZGTEVWQlFVVXNTMEZCU3l4RlFVRkZMRU5CUVVNc1JVRkJSU3hOUVVGTkxFVkJRVVVzUTBGQlF5eEZRVUZGTEVkQlFVY3NSVUZCUlN4RFFVRkRMRVZCUVVVc1RVRkJUU3hGUVVGRkxFTkJRVU1zUlVGQlJTeEpRVUZKTEVWQlFVVXNVMEZCVXl4RlFVRkZPMHRCUTNaRkxFVkJRMFFzUTBGQlF5eFRRVUZETEVOQlFVTXNSVUZCUlN4RFFVRkRMRVZCUVVVN1VVRkRUaXhWUVVGVkxFVkJRVVVzVTBGQlV6dFJRVU55UWl4VFFVRlRMRVZCUVVVc1UwRkJVenRSUVVOd1FpeEpRVUZKTEVWQlFVVXNSVUZCUlR0TFFVTlVMRVZCUTBRc1EwRkJReXhUUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVWQlFVVTdVVUZEVGl4VlFVRlZMRVZCUVVVc1UwRkJVenRSUVVOeVFpeFRRVUZUTEVWQlFVVXNVMEZCVXp0UlFVTndRaXhKUVVGSkxFVkJRVVVzUlVGQlJUdExRVU5VTEVkQlEwWXNRMEZCUVR0QlFVVkVMRTFCUVUwc1dVRkJXU3hIUVVGSExFbEJRVUVzZFVKQlFXVXNSVUZCUlN4WlFVRlpMRU5CUVVVc1EwRkJRVHRCUVVOd1JDeE5RVUZOTEU5QlFVOHNSMEZCUnl4SlFVRkJMSE5DUVVGakxFVkJRVVVzTmtKQlFYRkNMRVZCUVVVc1dVRkJXU3hEUVVGRkxFTkJRVU03UVVGRmRFVXNVMEZCVXl4alFVRmpPMGxCUTNKQ0xFMUJRVTBzV1VGQldTeEhRVUZWTEd0Q1FVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRE96czdPenM3T3pzN096czdPenM3TzBkQlowSXpReXhGUVVGRkxFVkJRVU1zUjBGQlJ5eEZRVUZGTEU5QlFVOHNSVUZCUXl4RFFVRkRMRU5CUVVNN1NVRkZia0lzVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRWRCUVVjc1dVRkJXU3hEUVVGRE8wbEJSWFpETERKRFFVRXlRenRKUVVNelF5eEpRVUZCTEdWQlFVc3NSVUZCUXp0UlFVTktMRXRCUVVzc1JVRkJSU3hKUVVGSk8xRkJRMWdzVFVGQlRTeEZRVUZGTEVsQlFVazdVVUZEV2l4SFFVRkhMRVZCUVVVc1QwRkJUenRMUVVOaUxFTkJRVU1zUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSVHRSUVVOcVFpeE5RVUZOTEVkQlFVY3NSMEZCUnl4UlFVRlJMRU5CUVVNc1lVRkJZU3hEUVVGRExGZEJRVmNzUTBGQmNVSXNRMEZCUXp0UlFVTndSU3hIUVVGSExFTkJRVU1zUjBGQlJ5eEhRVUZITEUxQlFVMHNRMEZCUVR0SlFVTnNRaXhEUVVGRExFTkJRVU1zUTBGQlFUdEJRVU5LTEVOQlFVTTdRVUZGUkN4alFVRmpMRVZCUVVVc1EwRkJRenRCUVVkcVFpeDFRa0ZCZFVJaUxDSnpiM1Z5WTJWelEyOXVkR1Z1ZENJNld5SnBiWEJ2Y25RZ2JYVnpkR0ZqYUdVZ1puSnZiU0FuYlhWemRHRmphR1VuTzF4dVhHNXBiWEJ2Y25RZ2V5QmliMkZ5WkUxMWMzUmhZMmhsVkdWdGNHeGhkR1VzSUhKbGJtUmxja0p2WVhKa1UxWkhMQ0JqY21WaGRHVkNiMkZ5WkVSaGRHRXNJRVJGUmtGVlRGUmZWRWhGVFVVc0lGUm9aVzFsTENCVUlIMGdabkp2YlNBbkxpOWliMkZ5WkNjN1hHNXBiWEJ2Y25RZ2V5QjBiMUJ1WnlCOUlHWnliMjBnSnk0dmFHVnNjR1Z5Y3ljN1hHNWNibU52Ym5OMElFaEJWVk5MUVY5VVNFVk5SVHBVYUdWdFpTQTlJSHRjYmx4dUlDQXVMaTVFUlVaQlZVeFVYMVJJUlUxRkxGeHVYRzRnSUdKaFkydG5jbTkxWkRvZ0p5TXlSREZFTWpBbkxGeHVYRzRnSUZ0VUxuUjNYVG9nZXk4dlZISnBjR3hsSUhkdmNtUmNiaUFnSUNCaVlXTnJaM0p2ZFc1a09pQW5JMFk1TnpJeE9DY3NYRzRnSUNBZ2RHVjRkRU52Ykc5eU9pQW5JMlptWm1abVppY3NYRzRnSUNBZ2RHVjRkRG9nV3lkVVVrbFFURUVuTENBblUwRk9RU2NzSUNkUVNWTlVSVVZVSjEwc1hHNGdJQ0FnZEhKcFlXNW5iR1Z6T2lCN0lIZHBaSFJvT2lBMUxDQm9aV2xuYUhRNklESXNJR2RoY0RvZ01Td2dZVzF2ZFc1ME9pQXpMQ0JtYVd4c09pQW5JMFk1TnpJeE9DY2dmU0FnSUNCY2JpQWdmU3dnSUZ4dUlDQmJWQzVrZDEwNklIc3ZMMFJ2ZFdKc1pTQjNiM0prWEc0Z0lDQWdZbUZqYTJkeWIzVnVaRG9nSnlORk5ETTNORVFuTEZ4dUlDQWdJSFJsZUhSRGIyeHZjam9nSnlObVptWm1abVluTEZ4dUlDQWdJSFJsZUhRNklGc25WRlZRVEVFbkxDQW5VMEZPUVNjc0lDZFFTVk5VUlVWVUoxMHNYRzRnSUNBZ2RISnBZVzVuYkdWek9pQjdJSGRwWkhSb09pQTFMQ0JvWldsbmFIUTZJRElzSUdkaGNEb2dNeXdnWVcxdmRXNTBPaUF5TENCbWFXeHNPaUFuSTBVME16YzBSQ2NnZlNBZ0lDQmNiaUFnZlN3Z0lGeHVJQ0JiVkM1MGJGMDZJSHN2TDFSeWFYQnNaU0JzWlhSMFpYSnpYRzRnSUNBZ1ltRmphMmR5YjNWdVpEb2dKeU0yUVVGQk1qUW5MRnh1SUNBZ0lIUmxlSFJEYjJ4dmNqb2dKeU5tWm1abVptWW5MRnh1SUNBZ0lIUmxlSFE2SUZzblZGSkpVRXhCSnl3Z0owdEpVa3BCU1U0bkxDQW5VRWxUVkVWRlZDZGRMRnh1SUNBZ0lIUnlhV0Z1WjJ4bGN6b2dleUIzYVdSMGFEb2dOU3dnYUdWcFoyaDBPaUF5TENCbllYQTZJREVzSUdGdGIzVnVkRG9nTXl3Z1ptbHNiRG9nSnlNMlFVRkJNalFuSUgwZ0lDQWdYRzRnSUgwc1hHNGdJRnRVTG1Sc1hUb2dleTh2Ukc5MVlteGxJR3hsZEhSbGNseHVJQ0FnSUdKaFkydG5jbTkxYm1RNklDY2pORUU0UWtNMUp5eGNiaUFnSUNCMFpYaDBRMjlzYjNJNklDY2pabVptWm1abUp5eGNiaUFnSUNCMFpYaDBPaUJiSjFSVlVFeEJKeXdnSjB0SlVrcEJTVTRuTENBblVFbFRWRVZGVkNkZExGeHVJQ0FnSUhSeWFXRnVaMnhsY3pvZ2V5QjNhV1IwYURvZ05Td2dhR1ZwWjJoME9pQXlMQ0JuWVhBNklETXNJR0Z0YjNWdWREb2dNaXdnWm1sc2JEb2dKeU0wUVRoQ1F6VW5JSDBnSUNBZ1hHNGdJSDBzWEc0Z0lGdFVMbk56WFRvZ2V5OHZVM1JoY25SY2JpQWdJQ0JpWVdOclozSnZkVzVrT2lBbkkwUkVNemN6UWljc1hHNGdJQ0FnZEdWNGRFTnZiRzl5T2lBbkkyWm1abVptWmljc1hHNGdJQ0FnZEdWNGREb2dXMTFjYmlBZ2ZTeGNiaUFnVzFRdVpXVmRPaUI3THk5RmJYQjBlVnh1SUNBZ0lHSmhZMnRuY205MWJtUTZJQ2NqWm1abVptWm1KeXhjYmlBZ0lDQjBaWGgwUTI5c2IzSTZJQ2NqTURBd01EQXdKeXhjYmlBZ0lDQjBaWGgwT2lCYlhWeHVJQ0I5WEc1OVhHNWNibU52Ym5OMElHMTFjM1JoWTJobFJHRjBZU0E5SUdOeVpXRjBaVUp2WVhKa1JHRjBZU2dnU0VGVlUwdEJYMVJJUlUxRklDbGNibU52Ym5OMElITjJaMGgwYld3Z1BTQnlaVzVrWlhKQ2IyRnlaRk5XUnlnZ1ltOWhjbVJOZFhOMFlXTm9aVlJsYlhCc1lYUmxMQ0J0ZFhOMFlXTm9aVVJoZEdFZ0tUdGNibHh1Wm5WdVkzUnBiMjRnY21WdVpHVnlSRzlqZFcxbGJuUW9LU0I3WEc0Z0lHTnZibk4wSUdSdlkzVnRaVzUwU0hSdGJEcHpkSEpwYm1jZ1BTQnRkWE4wWVdOb1pTNXlaVzVrWlhJb1lGeHVJQ0I3ZTN0emRtZDlmWDFjYmlBZ1hHNGdJRHh6ZEhsc1pUNWNiaUFnWVNCN1hHNGdJQ0FnWm05dWRDMXphWHBsT2lBeU1IQjRPMXh1SUNBZ0lHUnBjM0JzWVhrNklHNXZibVU3WEc1Y2JpQWdmVnh1SUNCcGJXY2dlMXh1SUNBZ0lHMWhlQzEzYVdSMGFEb2dNVEF3SlR0Y2JpQWdJQ0JvWldsbmFIUTZJREV3TUNVN0lGeHVJQ0I5WEc1Y2JpQWdQQzl6ZEhsc1pUNGdJRnh1SUNBOGFXMW5JR2xrUFZ3aVltOWhjbVJjSWlCaGJIUTlYQ0pDYjJGeVpGd2lQbHh1SUNCZ0xDQjdjM1puT2lCemRtZElkRzFzZlNrN1hHNWNiaUFnWkc5amRXMWxiblF1WW05a2VTNXBibTVsY2toVVRVd2dQU0JrYjJOMWJXVnVkRWgwYld3N1hHNWNiaUFnTHk5RGIyNTJaWEowSUhSdklGQk9SeUJwYldGblpTQmhibVFnYVc1elpYSjBJR2wwSUhSdklFUlBUVnh1SUNCMGIxQnVaeWg3WEc0Z0lDQWdkMmxrZEdnNklETXdNREFzWEc0Z0lDQWdhR1ZwWjJoME9pQXpNREF3TEZ4dUlDQWdJSE4yWnpvZ2MzWm5TSFJ0YkZ4dUlDQjlLUzUwYUdWdUtDaHdibWRWY213cElEMCtJSHRjYmlBZ0lDQmpiMjV6ZENCcGJXY2dQU0JrYjJOMWJXVnVkQzV4ZFdWeWVWTmxiR1ZqZEc5eUtDZHBiV2NqWW05aGNtUW5LU0JoY3lCSVZFMU1TVzFoWjJWRmJHVnRaVzUwTzF4dUlDQWdJR2x0Wnk1emNtTWdQU0J3Ym1kVmNteGNiaUFnZlNsY2JuMWNibHh1Y21WdVpHVnlSRzlqZFcxbGJuUW9LVHRjYmx4dVhHNHZMMk52Ym5abGNuUlRWa2QwYjBOaGJuWmhjeWdwTzF4dVhHNWNibHh1WEc1Y2JseHVJbDE5IiwiJ3VzZSBzdHJpY3QnO1xuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuXG52YXIgcmVxdWVzdEFuaW1hdGlvbkZyYW1lID0gcmVxdWlyZSgncmFmJyk7XG52YXIgUkdCQ29sb3IgPSByZXF1aXJlKCdyZ2Jjb2xvcicpO1xudmFyIHN2Z1BhdGhkYXRhID0gcmVxdWlyZSgnc3ZnLXBhdGhkYXRhJyk7XG52YXIgc3RhY2tibHVyQ2FudmFzID0gcmVxdWlyZSgnc3RhY2tibHVyLWNhbnZhcycpO1xuXG5mdW5jdGlvbiBfaW50ZXJvcERlZmF1bHRMZWdhY3kgKGUpIHsgcmV0dXJuIGUgJiYgdHlwZW9mIGUgPT09ICdvYmplY3QnICYmICdkZWZhdWx0JyBpbiBlID8gZSA6IHsgJ2RlZmF1bHQnOiBlIH07IH1cblxudmFyIHJlcXVlc3RBbmltYXRpb25GcmFtZV9fZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9faW50ZXJvcERlZmF1bHRMZWdhY3kocmVxdWVzdEFuaW1hdGlvbkZyYW1lKTtcbnZhciBSR0JDb2xvcl9fZGVmYXVsdCA9IC8qI19fUFVSRV9fKi9faW50ZXJvcERlZmF1bHRMZWdhY3koUkdCQ29sb3IpO1xuXG4vKipcbiAqIE9wdGlvbnMgcHJlc2V0IGZvciBgT2Zmc2NyZWVuQ2FudmFzYC5cbiAqIEBwYXJhbSBjb25maWcgLSBQcmVzZXQgcmVxdWlyZW1lbnRzLlxuICogQHBhcmFtIGNvbmZpZy5ET01QYXJzZXIgLSBYTUwvSFRNTCBwYXJzZXIgZnJvbSBzdHJpbmcgaW50byBET00gRG9jdW1lbnQuXG4gKiBAcmV0dXJucyBQcmVzZXQgb2JqZWN0LlxuICovIGZ1bmN0aW9uIG9mZnNjcmVlbigpIHtcbiAgICBsZXQgeyBET01QYXJzZXI6IERPTVBhcnNlckZhbGxiYWNrICB9ID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiB7fTtcbiAgICBjb25zdCBwcmVzZXQgPSB7XG4gICAgICAgIHdpbmRvdzogbnVsbCxcbiAgICAgICAgaWdub3JlQW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICBpZ25vcmVNb3VzZTogdHJ1ZSxcbiAgICAgICAgRE9NUGFyc2VyOiBET01QYXJzZXJGYWxsYmFjayxcbiAgICAgICAgY3JlYXRlQ2FudmFzICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgfSxcbiAgICAgICAgYXN5bmMgY3JlYXRlSW1hZ2UgKHVybCkge1xuICAgICAgICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaCh1cmwpO1xuICAgICAgICAgICAgY29uc3QgYmxvYiA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKTtcbiAgICAgICAgICAgIGNvbnN0IGltZyA9IGF3YWl0IGNyZWF0ZUltYWdlQml0bWFwKGJsb2IpO1xuICAgICAgICAgICAgcmV0dXJuIGltZztcbiAgICAgICAgfVxuICAgIH07XG4gICAgaWYgKHR5cGVvZiBnbG9iYWxUaGlzLkRPTVBhcnNlciAhPT0gJ3VuZGVmaW5lZCcgfHwgdHlwZW9mIERPTVBhcnNlckZhbGxiYWNrID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBSZWZsZWN0LmRlbGV0ZVByb3BlcnR5KHByZXNldCwgJ0RPTVBhcnNlcicpO1xuICAgIH1cbiAgICByZXR1cm4gcHJlc2V0O1xufVxuXG4vKipcbiAqIE9wdGlvbnMgcHJlc2V0IGZvciBgbm9kZS1jYW52YXNgLlxuICogQHBhcmFtIGNvbmZpZyAtIFByZXNldCByZXF1aXJlbWVudHMuXG4gKiBAcGFyYW0gY29uZmlnLkRPTVBhcnNlciAtIFhNTC9IVE1MIHBhcnNlciBmcm9tIHN0cmluZyBpbnRvIERPTSBEb2N1bWVudC5cbiAqIEBwYXJhbSBjb25maWcuY2FudmFzIC0gYG5vZGUtY2FudmFzYCBleHBvcnRzLlxuICogQHBhcmFtIGNvbmZpZy5mZXRjaCAtIFdIQVRXRy1jb21wYXRpYmxlIGBmZXRjaGAgZnVuY3Rpb24uXG4gKiBAcmV0dXJucyBQcmVzZXQgb2JqZWN0LlxuICovIGZ1bmN0aW9uIG5vZGUocGFyYW0pIHtcbiAgICBsZXQgeyBET01QYXJzZXIgLCBjYW52YXMgLCBmZXRjaCAgfSA9IHBhcmFtO1xuICAgIHJldHVybiB7XG4gICAgICAgIHdpbmRvdzogbnVsbCxcbiAgICAgICAgaWdub3JlQW5pbWF0aW9uOiB0cnVlLFxuICAgICAgICBpZ25vcmVNb3VzZTogdHJ1ZSxcbiAgICAgICAgRE9NUGFyc2VyLFxuICAgICAgICBmZXRjaCxcbiAgICAgICAgY3JlYXRlQ2FudmFzOiBjYW52YXMuY3JlYXRlQ2FudmFzLFxuICAgICAgICBjcmVhdGVJbWFnZTogY2FudmFzLmxvYWRJbWFnZVxuICAgIH07XG59XG5cbnZhciBpbmRleCA9IC8qI19fUFVSRV9fKi9PYmplY3QuZnJlZXplKHtcbiAgX19wcm90b19fOiBudWxsLFxuICBvZmZzY3JlZW46IG9mZnNjcmVlbixcbiAgbm9kZTogbm9kZVxufSk7XG5cbi8qKlxuICogSFRNTC1zYWZlIGNvbXByZXNzIHdoaXRlLXNwYWNlcy5cbiAqIEBwYXJhbSBzdHIgLSBTdHJpbmcgdG8gY29tcHJlc3MuXG4gKiBAcmV0dXJucyBTdHJpbmcuXG4gKi8gZnVuY3Rpb24gY29tcHJlc3NTcGFjZXMoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC8oPyFcXHUzMDAwKVxccysvZ20sICcgJyk7XG59XG4vKipcbiAqIEhUTUwtc2FmZSBsZWZ0IHRyaW0uXG4gKiBAcGFyYW0gc3RyIC0gU3RyaW5nIHRvIHRyaW0uXG4gKiBAcmV0dXJucyBTdHJpbmcuXG4gKi8gZnVuY3Rpb24gdHJpbUxlZnQoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9eW1xcbiBcXHRdKy8sICcnKTtcbn1cbi8qKlxuICogSFRNTC1zYWZlIHJpZ2h0IHRyaW0uXG4gKiBAcGFyYW0gc3RyIC0gU3RyaW5nIHRvIHRyaW0uXG4gKiBAcmV0dXJucyBTdHJpbmcuXG4gKi8gZnVuY3Rpb24gdHJpbVJpZ2h0KHN0cikge1xuICAgIHJldHVybiBzdHIucmVwbGFjZSgvW1xcbiBcXHRdKyQvLCAnJyk7XG59XG4vKipcbiAqIFN0cmluZyB0byBudW1iZXJzIGFycmF5LlxuICogQHBhcmFtIHN0ciAtIE51bWJlcnMgc3RyaW5nLlxuICogQHJldHVybnMgTnVtYmVycyBhcnJheS5cbiAqLyBmdW5jdGlvbiB0b051bWJlcnMoc3RyKSB7XG4gICAgY29uc3QgbWF0Y2hlcyA9IHN0ci5tYXRjaCgvLT8oXFxkKyg/OlxcLlxcZCooPzpbZUVdWystXT9cXGQrKT8pP3xcXC5cXGQrKSg/PVxcRHwkKS9nbSk7XG4gICAgcmV0dXJuIG1hdGNoZXMgPyBtYXRjaGVzLm1hcChwYXJzZUZsb2F0KSA6IFtdO1xufVxuLyoqXG4gKiBTdHJpbmcgdG8gbWF0cml4IHZhbHVlLlxuICogQHBhcmFtIHN0ciAtIE51bWJlcnMgc3RyaW5nLlxuICogQHJldHVybnMgTWF0cml4IHZhbHVlLlxuICovIGZ1bmN0aW9uIHRvTWF0cml4VmFsdWUoc3RyKSB7XG4gICAgY29uc3QgbnVtYmVycyA9IHRvTnVtYmVycyhzdHIpO1xuICAgIGNvbnN0IG1hdHJpeCA9IFtcbiAgICAgICAgbnVtYmVyc1swXSB8fCAwLFxuICAgICAgICBudW1iZXJzWzFdIHx8IDAsXG4gICAgICAgIG51bWJlcnNbMl0gfHwgMCxcbiAgICAgICAgbnVtYmVyc1szXSB8fCAwLFxuICAgICAgICBudW1iZXJzWzRdIHx8IDAsXG4gICAgICAgIG51bWJlcnNbNV0gfHwgMFxuICAgIF07XG4gICAgcmV0dXJuIG1hdHJpeDtcbn1cbi8vIE1pY3Jvc29mdCBFZGdlIGZpeFxuY29uc3QgYWxsVXBwZXJjYXNlID0gL15bQS1aLV0rJC87XG4vKipcbiAqIE5vcm1hbGl6ZSBhdHRyaWJ1dGUgbmFtZS5cbiAqIEBwYXJhbSBuYW1lIC0gQXR0cmlidXRlIG5hbWUuXG4gKiBAcmV0dXJucyBOb3JtYWxpemVkIGF0dHJpYnV0ZSBuYW1lLlxuICovIGZ1bmN0aW9uIG5vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUobmFtZSkge1xuICAgIGlmIChhbGxVcHBlcmNhc2UudGVzdChuYW1lKSkge1xuICAgICAgICByZXR1cm4gbmFtZS50b0xvd2VyQ2FzZSgpO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZTtcbn1cbi8qKlxuICogUGFyc2UgZXh0ZXJuYWwgVVJMLlxuICogQHBhcmFtIHVybCAtIENTUyB1cmwgc3RyaW5nLlxuICogQHJldHVybnMgUGFyc2VkIFVSTC5cbiAqLyBmdW5jdGlvbiBwYXJzZUV4dGVybmFsVXJsKHVybCkge1xuICAgIC8vICAgICAgICAgICAgICAgICAgICAgIHNpbmdsZSBxdW90ZXMgWzJdXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgdiAgICAgICAgIGRvdWJsZSBxdW90ZXMgWzNdXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgdiAgICAgICAgIHYgICAgICAgICBubyBxdW90ZXMgWzRdXG4gICAgLy8gICAgICAgICAgICAgICAgICAgICAgdiAgICAgICAgIHYgICAgICAgICB2XG4gICAgY29uc3QgdXJsTWF0Y2ggPSAvdXJsXFwoKCcoW14nXSspJ3xcIihbXlwiXSspXCJ8KFteJ1wiKV0rKSlcXCkvLmV4ZWModXJsKTtcbiAgICBpZiAoIXVybE1hdGNoKSB7XG4gICAgICAgIHJldHVybiAnJztcbiAgICB9XG4gICAgcmV0dXJuIHVybE1hdGNoWzJdIHx8IHVybE1hdGNoWzNdIHx8IHVybE1hdGNoWzRdIHx8ICcnO1xufVxuLyoqXG4gKiBUcmFuc2Zvcm0gZmxvYXRzIHRvIGludGVnZXJzIGluIHJnYiBjb2xvcnMuXG4gKiBAcGFyYW0gY29sb3IgLSBDb2xvciB0byBub3JtYWxpemUuXG4gKiBAcmV0dXJucyBOb3JtYWxpemVkIGNvbG9yLlxuICovIGZ1bmN0aW9uIG5vcm1hbGl6ZUNvbG9yKGNvbG9yKSB7XG4gICAgaWYgKCFjb2xvci5zdGFydHNXaXRoKCdyZ2InKSkge1xuICAgICAgICByZXR1cm4gY29sb3I7XG4gICAgfVxuICAgIGxldCByZ2JQYXJ0cyA9IDM7XG4gICAgY29uc3Qgbm9ybWFsaXplZENvbG9yID0gY29sb3IucmVwbGFjZSgvXFxkKyhcXC5cXGQrKT8vZywgKG51bSwgaXNGbG9hdCk9PihyZ2JQYXJ0cy0tKSAmJiBpc0Zsb2F0ID8gU3RyaW5nKE1hdGgucm91bmQocGFyc2VGbG9hdChudW0pKSkgOiBudW1cbiAgICApO1xuICAgIHJldHVybiBub3JtYWxpemVkQ29sb3I7XG59XG5cbi8vIHNsaWdodGx5IG1vZGlmaWVkIHZlcnNpb24gb2YgaHR0cHM6Ly9naXRodWIuY29tL2tlZWdhbnN0cmVldC9zcGVjaWZpY2l0eS9ibG9iL21hc3Rlci9zcGVjaWZpY2l0eS5qc1xuY29uc3QgYXR0cmlidXRlUmVnZXggPSAvKFxcW1teXFxdXStcXF0pL2c7XG5jb25zdCBpZFJlZ2V4ID0gLygjW15cXHMrPn4uWzpdKykvZztcbmNvbnN0IGNsYXNzUmVnZXggPSAvKFxcLlteXFxzKz5+Lls6XSspL2c7XG5jb25zdCBwc2V1ZG9FbGVtZW50UmVnZXggPSAvKDo6W15cXHMrPn4uWzpdK3w6Zmlyc3QtbGluZXw6Zmlyc3QtbGV0dGVyfDpiZWZvcmV8OmFmdGVyKS9naTtcbmNvbnN0IHBzZXVkb0NsYXNzV2l0aEJyYWNrZXRzUmVnZXggPSAvKDpbXFx3LV0rXFwoW14pXSpcXCkpL2dpO1xuY29uc3QgcHNldWRvQ2xhc3NSZWdleCA9IC8oOlteXFxzKz5+Lls6XSspL2c7XG5jb25zdCBlbGVtZW50UmVnZXggPSAvKFteXFxzKz5+Lls6XSspL2c7XG5mdW5jdGlvbiBmaW5kU2VsZWN0b3JNYXRjaChzZWxlY3RvciwgcmVnZXgpIHtcbiAgICBjb25zdCBtYXRjaGVzID0gcmVnZXguZXhlYyhzZWxlY3Rvcik7XG4gICAgaWYgKCFtYXRjaGVzKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBzZWxlY3RvcixcbiAgICAgICAgICAgIDBcbiAgICAgICAgXTtcbiAgICB9XG4gICAgcmV0dXJuIFtcbiAgICAgICAgc2VsZWN0b3IucmVwbGFjZShyZWdleCwgJyAnKSxcbiAgICAgICAgbWF0Y2hlcy5sZW5ndGhcbiAgICBdO1xufVxuLyoqXG4gKiBNZWFzdXJlIHNlbGVjdG9yIHNwZWNpZmljaXR5LlxuICogQHBhcmFtIHNlbGVjdG9yIC0gU2VsZWN0b3IgdG8gbWVhc3VyZS5cbiAqIEByZXR1cm5zIFNwZWNpZmljaXR5LlxuICovIGZ1bmN0aW9uIGdldFNlbGVjdG9yU3BlY2lmaWNpdHkoc2VsZWN0b3IpIHtcbiAgICBjb25zdCBzcGVjaWZpY2l0eSA9IFtcbiAgICAgICAgMCxcbiAgICAgICAgMCxcbiAgICAgICAgMFxuICAgIF07XG4gICAgbGV0IGN1cnJlbnRTZWxlY3RvciA9IHNlbGVjdG9yLnJlcGxhY2UoLzpub3RcXCgoW14pXSopXFwpL2csICcgICAgICQxICcpLnJlcGxhY2UoL3tbXFxzXFxTXSovZ20sICcgJyk7XG4gICAgbGV0IGRlbHRhID0gMDtcbiAgICBbY3VycmVudFNlbGVjdG9yLCBkZWx0YV0gPSBmaW5kU2VsZWN0b3JNYXRjaChjdXJyZW50U2VsZWN0b3IsIGF0dHJpYnV0ZVJlZ2V4KTtcbiAgICBzcGVjaWZpY2l0eVsxXSArPSBkZWx0YTtcbiAgICBbY3VycmVudFNlbGVjdG9yLCBkZWx0YV0gPSBmaW5kU2VsZWN0b3JNYXRjaChjdXJyZW50U2VsZWN0b3IsIGlkUmVnZXgpO1xuICAgIHNwZWNpZmljaXR5WzBdICs9IGRlbHRhO1xuICAgIFtjdXJyZW50U2VsZWN0b3IsIGRlbHRhXSA9IGZpbmRTZWxlY3Rvck1hdGNoKGN1cnJlbnRTZWxlY3RvciwgY2xhc3NSZWdleCk7XG4gICAgc3BlY2lmaWNpdHlbMV0gKz0gZGVsdGE7XG4gICAgW2N1cnJlbnRTZWxlY3RvciwgZGVsdGFdID0gZmluZFNlbGVjdG9yTWF0Y2goY3VycmVudFNlbGVjdG9yLCBwc2V1ZG9FbGVtZW50UmVnZXgpO1xuICAgIHNwZWNpZmljaXR5WzJdICs9IGRlbHRhO1xuICAgIFtjdXJyZW50U2VsZWN0b3IsIGRlbHRhXSA9IGZpbmRTZWxlY3Rvck1hdGNoKGN1cnJlbnRTZWxlY3RvciwgcHNldWRvQ2xhc3NXaXRoQnJhY2tldHNSZWdleCk7XG4gICAgc3BlY2lmaWNpdHlbMV0gKz0gZGVsdGE7XG4gICAgW2N1cnJlbnRTZWxlY3RvciwgZGVsdGFdID0gZmluZFNlbGVjdG9yTWF0Y2goY3VycmVudFNlbGVjdG9yLCBwc2V1ZG9DbGFzc1JlZ2V4KTtcbiAgICBzcGVjaWZpY2l0eVsxXSArPSBkZWx0YTtcbiAgICBjdXJyZW50U2VsZWN0b3IgPSBjdXJyZW50U2VsZWN0b3IucmVwbGFjZSgvWypcXHMrPn5dL2csICcgJykucmVwbGFjZSgvWyMuXS9nLCAnICcpO1xuICAgIFtjdXJyZW50U2VsZWN0b3IsIGRlbHRhXSA9IGZpbmRTZWxlY3Rvck1hdGNoKGN1cnJlbnRTZWxlY3RvciwgZWxlbWVudFJlZ2V4KSAvLyBsZ3RtIFtqcy91c2VsZXNzLWFzc2lnbm1lbnQtdG8tbG9jYWxdXG4gICAgO1xuICAgIHNwZWNpZmljaXR5WzJdICs9IGRlbHRhO1xuICAgIHJldHVybiBzcGVjaWZpY2l0eS5qb2luKCcnKTtcbn1cblxuY29uc3QgUFNFVURPX1pFUk8gPSAwLjAwMDAwMDAxO1xuLyoqXG4gKiBWZWN0b3IgbWFnbml0dWRlLlxuICogQHBhcmFtIHZcbiAqIEByZXR1cm5zIE51bWJlciByZXN1bHQuXG4gKi8gZnVuY3Rpb24gdmVjdG9yTWFnbml0dWRlKHYpIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHZbMF0sIDIpICsgTWF0aC5wb3codlsxXSwgMikpO1xufVxuLyoqXG4gKiBSYXRpbyBiZXR3ZWVuIHR3byB2ZWN0b3JzLlxuICogQHBhcmFtIHVcbiAqIEBwYXJhbSB2XG4gKiBAcmV0dXJucyBOdW1iZXIgcmVzdWx0LlxuICovIGZ1bmN0aW9uIHZlY3RvcnNSYXRpbyh1LCB2KSB7XG4gICAgcmV0dXJuICh1WzBdICogdlswXSArIHVbMV0gKiB2WzFdKSAvICh2ZWN0b3JNYWduaXR1ZGUodSkgKiB2ZWN0b3JNYWduaXR1ZGUodikpO1xufVxuLyoqXG4gKiBBbmdsZSBiZXR3ZWVuIHR3byB2ZWN0b3JzLlxuICogQHBhcmFtIHVcbiAqIEBwYXJhbSB2XG4gKiBAcmV0dXJucyBOdW1iZXIgcmVzdWx0LlxuICovIGZ1bmN0aW9uIHZlY3RvcnNBbmdsZSh1LCB2KSB7XG4gICAgcmV0dXJuICh1WzBdICogdlsxXSA8IHVbMV0gKiB2WzBdID8gLTEgOiAxKSAqIE1hdGguYWNvcyh2ZWN0b3JzUmF0aW8odSwgdikpO1xufVxuZnVuY3Rpb24gQ0IxKHQpIHtcbiAgICByZXR1cm4gdCAqIHQgKiB0O1xufVxuZnVuY3Rpb24gQ0IyKHQpIHtcbiAgICByZXR1cm4gMyAqIHQgKiB0ICogKDEgLSB0KTtcbn1cbmZ1bmN0aW9uIENCMyh0KSB7XG4gICAgcmV0dXJuIDMgKiB0ICogKDEgLSB0KSAqICgxIC0gdCk7XG59XG5mdW5jdGlvbiBDQjQodCkge1xuICAgIHJldHVybiAoMSAtIHQpICogKDEgLSB0KSAqICgxIC0gdCk7XG59XG5mdW5jdGlvbiBRQjEodCkge1xuICAgIHJldHVybiB0ICogdDtcbn1cbmZ1bmN0aW9uIFFCMih0KSB7XG4gICAgcmV0dXJuIDIgKiB0ICogKDEgLSB0KTtcbn1cbmZ1bmN0aW9uIFFCMyh0KSB7XG4gICAgcmV0dXJuICgxIC0gdCkgKiAoMSAtIHQpO1xufVxuXG5jbGFzcyBQcm9wZXJ0eSB7XG4gICAgc3RhdGljIGVtcHR5KGRvY3VtZW50KSB7XG4gICAgICAgIHJldHVybiBuZXcgUHJvcGVydHkoZG9jdW1lbnQsICdFTVBUWScsICcnKTtcbiAgICB9XG4gICAgc3BsaXQoKSB7XG4gICAgICAgIGxldCBzZXBhcmF0b3IgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1swXSA6ICcgJztcbiAgICAgICAgY29uc3QgeyBkb2N1bWVudCAsIG5hbWUgIH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4gY29tcHJlc3NTcGFjZXModGhpcy5nZXRTdHJpbmcoKSkudHJpbSgpLnNwbGl0KHNlcGFyYXRvcikubWFwKCh2YWx1ZSk9Pm5ldyBQcm9wZXJ0eShkb2N1bWVudCwgbmFtZSwgdmFsdWUpXG4gICAgICAgICk7XG4gICAgfVxuICAgIGhhc1ZhbHVlKHplcm9Jc1ZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gdGhpcy52YWx1ZTtcbiAgICAgICAgcmV0dXJuIHZhbHVlICE9PSBudWxsICYmIHZhbHVlICE9PSAnJyAmJiAoemVyb0lzVmFsdWUgfHwgdmFsdWUgIT09IDApICYmIHR5cGVvZiB2YWx1ZSAhPT0gJ3VuZGVmaW5lZCc7XG4gICAgfVxuICAgIGlzU3RyaW5nKHJlZ2V4cCkge1xuICAgICAgICBjb25zdCB7IHZhbHVlICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gdHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJztcbiAgICAgICAgaWYgKCFyZXN1bHQgfHwgIXJlZ2V4cCkge1xuICAgICAgICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcmVnZXhwLnRlc3QodmFsdWUpO1xuICAgIH1cbiAgICBpc1VybERlZmluaXRpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmlzU3RyaW5nKC9edXJsXFwoLyk7XG4gICAgfVxuICAgIGlzUGl4ZWxzKCkge1xuICAgICAgICBpZiAoIXRoaXMuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGFzU3RyaW5nID0gdGhpcy5nZXRTdHJpbmcoKTtcbiAgICAgICAgc3dpdGNoKHRydWUpe1xuICAgICAgICAgICAgY2FzZSBhc1N0cmluZy5lbmRzV2l0aCgncHgnKTpcbiAgICAgICAgICAgIGNhc2UgL15bMC05XSskLy50ZXN0KGFzU3RyaW5nKTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHNldFZhbHVlKHZhbHVlKSB7XG4gICAgICAgIHRoaXMudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuICAgIGdldFZhbHVlKGRlZikge1xuICAgICAgICBpZiAodHlwZW9mIGRlZiA9PT0gJ3VuZGVmaW5lZCcgfHwgdGhpcy5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy52YWx1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZGVmO1xuICAgIH1cbiAgICBnZXROdW1iZXIoZGVmKSB7XG4gICAgICAgIGlmICghdGhpcy5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGRlZiA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgUGFyc2UgdW5rbm93biB2YWx1ZS5cbiAgICAgICAgICAgIHJldHVybiBwYXJzZUZsb2F0KGRlZik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyB2YWx1ZSAgfSA9IHRoaXM7XG4gICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgUGFyc2UgdW5rbm93biB2YWx1ZS5cbiAgICAgICAgbGV0IG4gPSBwYXJzZUZsb2F0KHZhbHVlKTtcbiAgICAgICAgaWYgKHRoaXMuaXNTdHJpbmcoLyUkLykpIHtcbiAgICAgICAgICAgIG4gLz0gMTAwO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuO1xuICAgIH1cbiAgICBnZXRTdHJpbmcoZGVmKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZGVmID09PSAndW5kZWZpbmVkJyB8fCB0aGlzLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0eXBlb2YgdGhpcy52YWx1ZSA9PT0gJ3VuZGVmaW5lZCcgPyAnJyA6IFN0cmluZyh0aGlzLnZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU3RyaW5nKGRlZik7XG4gICAgfVxuICAgIGdldENvbG9yKGRlZikge1xuICAgICAgICBsZXQgY29sb3IgPSB0aGlzLmdldFN0cmluZyhkZWYpO1xuICAgICAgICBpZiAodGhpcy5pc05vcm1hbGl6ZWRDb2xvcikge1xuICAgICAgICAgICAgcmV0dXJuIGNvbG9yO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNOb3JtYWxpemVkQ29sb3IgPSB0cnVlO1xuICAgICAgICBjb2xvciA9IG5vcm1hbGl6ZUNvbG9yKGNvbG9yKTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IGNvbG9yO1xuICAgICAgICByZXR1cm4gY29sb3I7XG4gICAgfVxuICAgIGdldERwaSgpIHtcbiAgICAgICAgcmV0dXJuIDk2IC8vIFRPRE86IGNvbXB1dGU/XG4gICAgICAgIDtcbiAgICB9XG4gICAgZ2V0UmVtKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5yb290RW1TaXplO1xuICAgIH1cbiAgICBnZXRFbSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZG9jdW1lbnQuZW1TaXplO1xuICAgIH1cbiAgICBnZXRVbml0cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0U3RyaW5nKCkucmVwbGFjZSgvWzAtOS4tXS9nLCAnJyk7XG4gICAgfVxuICAgIGdldFBpeGVscyhheGlzT3JJc0ZvbnRTaXplKSB7XG4gICAgICAgIGxldCBwcm9jZXNzUGVyY2VudCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzFdIDogZmFsc2U7XG4gICAgICAgIGlmICghdGhpcy5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBbYXhpcywgaXNGb250U2l6ZV0gPSB0eXBlb2YgYXhpc09ySXNGb250U2l6ZSA9PT0gJ2Jvb2xlYW4nID8gW1xuICAgICAgICAgICAgdW5kZWZpbmVkLFxuICAgICAgICAgICAgYXhpc09ySXNGb250U2l6ZVxuICAgICAgICBdIDogW1xuICAgICAgICAgICAgYXhpc09ySXNGb250U2l6ZVxuICAgICAgICBdO1xuICAgICAgICBjb25zdCB7IHZpZXdQb3J0ICB9ID0gdGhpcy5kb2N1bWVudC5zY3JlZW47XG4gICAgICAgIHN3aXRjaCh0cnVlKXtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5pc1N0cmluZygvdm1pbiQvKTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROdW1iZXIoKSAvIDEwMCAqIE1hdGgubWluKHZpZXdQb3J0LmNvbXB1dGVTaXplKCd4JyksIHZpZXdQb3J0LmNvbXB1dGVTaXplKCd5JykpO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmlzU3RyaW5nKC92bWF4JC8pOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlcigpIC8gMTAwICogTWF0aC5tYXgodmlld1BvcnQuY29tcHV0ZVNpemUoJ3gnKSwgdmlld1BvcnQuY29tcHV0ZVNpemUoJ3knKSk7XG4gICAgICAgICAgICBjYXNlIHRoaXMuaXNTdHJpbmcoL3Z3JC8pOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlcigpIC8gMTAwICogdmlld1BvcnQuY29tcHV0ZVNpemUoJ3gnKTtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5pc1N0cmluZygvdmgkLyk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TnVtYmVyKCkgLyAxMDAgKiB2aWV3UG9ydC5jb21wdXRlU2l6ZSgneScpO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmlzU3RyaW5nKC9yZW0kLyk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TnVtYmVyKCkgKiB0aGlzLmdldFJlbSgpO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmlzU3RyaW5nKC9lbSQvKTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROdW1iZXIoKSAqIHRoaXMuZ2V0RW0oKTtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5pc1N0cmluZygvZXgkLyk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TnVtYmVyKCkgKiB0aGlzLmdldEVtKCkgLyAyO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmlzU3RyaW5nKC9weCQvKTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROdW1iZXIoKTtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5pc1N0cmluZygvcHQkLyk6XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZ2V0TnVtYmVyKCkgKiB0aGlzLmdldERwaSgpICogKDEgLyA3Mik7XG4gICAgICAgICAgICBjYXNlIHRoaXMuaXNTdHJpbmcoL3BjJC8pOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlcigpICogMTU7XG4gICAgICAgICAgICBjYXNlIHRoaXMuaXNTdHJpbmcoL2NtJC8pOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlcigpICogdGhpcy5nZXREcGkoKSAvIDIuNTQ7XG4gICAgICAgICAgICBjYXNlIHRoaXMuaXNTdHJpbmcoL21tJC8pOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlcigpICogdGhpcy5nZXREcGkoKSAvIDI1LjQ7XG4gICAgICAgICAgICBjYXNlIHRoaXMuaXNTdHJpbmcoL2luJC8pOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlcigpICogdGhpcy5nZXREcGkoKTtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5pc1N0cmluZygvJSQvKSAmJiBpc0ZvbnRTaXplOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlcigpICogdGhpcy5nZXRFbSgpO1xuICAgICAgICAgICAgY2FzZSB0aGlzLmlzU3RyaW5nKC8lJC8pOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlcigpICogdmlld1BvcnQuY29tcHV0ZVNpemUoYXhpcyk7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbiA9IHRoaXMuZ2V0TnVtYmVyKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwcm9jZXNzUGVyY2VudCAmJiBuIDwgMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG4gKiB2aWV3UG9ydC5jb21wdXRlU2l6ZShheGlzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0TWlsbGlzZWNvbmRzKCkge1xuICAgICAgICBpZiAoIXRoaXMuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuaXNTdHJpbmcoL21zJC8pKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROdW1iZXIoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5nZXROdW1iZXIoKSAqIDEwMDA7XG4gICAgfVxuICAgIGdldFJhZGlhbnMoKSB7XG4gICAgICAgIGlmICghdGhpcy5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgICAgICBzd2l0Y2godHJ1ZSl7XG4gICAgICAgICAgICBjYXNlIHRoaXMuaXNTdHJpbmcoL2RlZyQvKTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROdW1iZXIoKSAqIChNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5pc1N0cmluZygvZ3JhZCQvKTpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROdW1iZXIoKSAqIChNYXRoLlBJIC8gMjAwKTtcbiAgICAgICAgICAgIGNhc2UgdGhpcy5pc1N0cmluZygvcmFkJC8pOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldE51bWJlcigpO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5nZXROdW1iZXIoKSAqIChNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBnZXREZWZpbml0aW9uKCkge1xuICAgICAgICBjb25zdCBhc1N0cmluZyA9IHRoaXMuZ2V0U3RyaW5nKCk7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gLyMoW14pJ1wiXSspLy5leGVjKGFzU3RyaW5nKTtcbiAgICAgICAgY29uc3QgbmFtZSA9IChtYXRjaCA9PT0gbnVsbCB8fCBtYXRjaCA9PT0gdm9pZCAwID8gdm9pZCAwIDogbWF0Y2hbMV0pIHx8IGFzU3RyaW5nO1xuICAgICAgICByZXR1cm4gdGhpcy5kb2N1bWVudC5kZWZpbml0aW9uc1tuYW1lXTtcbiAgICB9XG4gICAgZ2V0RmlsbFN0eWxlRGVmaW5pdGlvbihlbGVtZW50LCBvcGFjaXR5KSB7XG4gICAgICAgIGxldCBkZWYgPSB0aGlzLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgaWYgKCFkZWYpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIC8vIGdyYWRpZW50XG4gICAgICAgIGlmICh0eXBlb2YgZGVmLmNyZWF0ZUdyYWRpZW50ID09PSAnZnVuY3Rpb24nICYmICdnZXRCb3VuZGluZ0JveCcgaW4gZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlZi5jcmVhdGVHcmFkaWVudCh0aGlzLmRvY3VtZW50LmN0eCwgZWxlbWVudCwgb3BhY2l0eSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gcGF0dGVyblxuICAgICAgICBpZiAodHlwZW9mIGRlZi5jcmVhdGVQYXR0ZXJuID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICBpZiAoZGVmLmdldEhyZWZBdHRyaWJ1dGUoKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGF0dGVyblRyYW5zZm9ybSA9IGRlZi5nZXRBdHRyaWJ1dGUoJ3BhdHRlcm5UcmFuc2Zvcm0nKTtcbiAgICAgICAgICAgICAgICBkZWYgPSBkZWYuZ2V0SHJlZkF0dHJpYnV0ZSgpLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgICAgICAgICBpZiAoZGVmICYmIHBhdHRlcm5UcmFuc2Zvcm0uaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgICAgICBkZWYuZ2V0QXR0cmlidXRlKCdwYXR0ZXJuVHJhbnNmb3JtJywgdHJ1ZSkuc2V0VmFsdWUocGF0dGVyblRyYW5zZm9ybS52YWx1ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGRlZikge1xuICAgICAgICAgICAgICAgIHJldHVybiBkZWYuY3JlYXRlUGF0dGVybih0aGlzLmRvY3VtZW50LmN0eCwgZWxlbWVudCwgb3BhY2l0eSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGdldFRleHRCYXNlbGluZSgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGtleSA9IHRoaXMuZ2V0U3RyaW5nKCk7XG4gICAgICAgIHJldHVybiBQcm9wZXJ0eS50ZXh0QmFzZWxpbmVNYXBwaW5nW2tleV0gfHwgbnVsbDtcbiAgICB9XG4gICAgYWRkT3BhY2l0eShvcGFjaXR5KSB7XG4gICAgICAgIGxldCB2YWx1ZSA9IHRoaXMuZ2V0Q29sb3IoKTtcbiAgICAgICAgY29uc3QgbGVuID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICBsZXQgY29tbWFzID0gMDtcbiAgICAgICAgLy8gU2ltdWxhdGUgb2xkIFJHQkNvbG9yIHZlcnNpb24sIHdoaWNoIGNhbid0IHBhcnNlIHJnYmEuXG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgICAgICBpZiAodmFsdWVbaV0gPT09ICcsJykge1xuICAgICAgICAgICAgICAgIGNvbW1hcysrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGNvbW1hcyA9PT0gMykge1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChvcGFjaXR5Lmhhc1ZhbHVlKCkgJiYgdGhpcy5pc1N0cmluZygpICYmIGNvbW1hcyAhPT0gMykge1xuICAgICAgICAgICAgY29uc3QgY29sb3IgPSBuZXcgUkdCQ29sb3JfX2RlZmF1bHRbXCJkZWZhdWx0XCJdKHZhbHVlKTtcbiAgICAgICAgICAgIGlmIChjb2xvci5vaykge1xuICAgICAgICAgICAgICAgIGNvbG9yLmFscGhhID0gb3BhY2l0eS5nZXROdW1iZXIoKTtcbiAgICAgICAgICAgICAgICB2YWx1ZSA9IGNvbG9yLnRvUkdCQSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgUHJvcGVydHkodGhpcy5kb2N1bWVudCwgdGhpcy5uYW1lLCB2YWx1ZSk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBuYW1lLCB2YWx1ZSl7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICAgICAgdGhpcy5uYW1lID0gbmFtZTtcbiAgICAgICAgdGhpcy52YWx1ZSA9IHZhbHVlO1xuICAgICAgICB0aGlzLmlzTm9ybWFsaXplZENvbG9yID0gZmFsc2U7XG4gICAgfVxufVxuUHJvcGVydHkudGV4dEJhc2VsaW5lTWFwcGluZyA9IHtcbiAgICAnYmFzZWxpbmUnOiAnYWxwaGFiZXRpYycsXG4gICAgJ2JlZm9yZS1lZGdlJzogJ3RvcCcsXG4gICAgJ3RleHQtYmVmb3JlLWVkZ2UnOiAndG9wJyxcbiAgICAnbWlkZGxlJzogJ21pZGRsZScsXG4gICAgJ2NlbnRyYWwnOiAnbWlkZGxlJyxcbiAgICAnYWZ0ZXItZWRnZSc6ICdib3R0b20nLFxuICAgICd0ZXh0LWFmdGVyLWVkZ2UnOiAnYm90dG9tJyxcbiAgICAnaWRlb2dyYXBoaWMnOiAnaWRlb2dyYXBoaWMnLFxuICAgICdhbHBoYWJldGljJzogJ2FscGhhYmV0aWMnLFxuICAgICdoYW5naW5nJzogJ2hhbmdpbmcnLFxuICAgICdtYXRoZW1hdGljYWwnOiAnYWxwaGFiZXRpYydcbn07XG5cbmNsYXNzIFZpZXdQb3J0IHtcbiAgICBjbGVhcigpIHtcbiAgICAgICAgdGhpcy52aWV3UG9ydHMgPSBbXTtcbiAgICB9XG4gICAgc2V0Q3VycmVudCh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHRoaXMudmlld1BvcnRzLnB1c2goe1xuICAgICAgICAgICAgd2lkdGgsXG4gICAgICAgICAgICBoZWlnaHRcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbW92ZUN1cnJlbnQoKSB7XG4gICAgICAgIHRoaXMudmlld1BvcnRzLnBvcCgpO1xuICAgIH1cbiAgICBnZXRSb290KCkge1xuICAgICAgICBjb25zdCBbcm9vdF0gPSB0aGlzLnZpZXdQb3J0cztcbiAgICAgICAgaWYgKCFyb290KSB7XG4gICAgICAgICAgICByZXR1cm4gZ2V0RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByb290O1xuICAgIH1cbiAgICBnZXRDdXJyZW50KCkge1xuICAgICAgICBjb25zdCB7IHZpZXdQb3J0cyAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGN1cnJlbnQgPSB2aWV3UG9ydHNbdmlld1BvcnRzLmxlbmd0aCAtIDFdO1xuICAgICAgICBpZiAoIWN1cnJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBnZXREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN1cnJlbnQ7XG4gICAgfVxuICAgIGdldCB3aWR0aCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0Q3VycmVudCgpLndpZHRoO1xuICAgIH1cbiAgICBnZXQgaGVpZ2h0KCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50KCkuaGVpZ2h0O1xuICAgIH1cbiAgICBjb21wdXRlU2l6ZShkKSB7XG4gICAgICAgIGlmICh0eXBlb2YgZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIHJldHVybiBkO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkID09PSAneCcpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLndpZHRoO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkID09PSAneScpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmhlaWdodDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHRoaXMud2lkdGgsIDIpICsgTWF0aC5wb3codGhpcy5oZWlnaHQsIDIpKSAvIE1hdGguc3FydCgyKTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoKXtcbiAgICAgICAgdGhpcy52aWV3UG9ydHMgPSBbXTtcbiAgICB9XG59XG5WaWV3UG9ydC5ERUZBVUxUX1ZJRVdQT1JUX1dJRFRIID0gODAwO1xuVmlld1BvcnQuREVGQVVMVF9WSUVXUE9SVF9IRUlHSFQgPSA2MDA7XG5mdW5jdGlvbiBnZXREZWZhdWx0KCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHdpZHRoOiBWaWV3UG9ydC5ERUZBVUxUX1ZJRVdQT1JUX1dJRFRILFxuICAgICAgICBoZWlnaHQ6IFZpZXdQb3J0LkRFRkFVTFRfVklFV1BPUlRfSEVJR0hUXG4gICAgfTtcbn1cblxuY2xhc3MgUG9pbnQge1xuICAgIHN0YXRpYyBwYXJzZShwb2ludCkge1xuICAgICAgICBsZXQgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMV0gOiAwO1xuICAgICAgICBjb25zdCBbeCA9IGRlZmF1bHRWYWx1ZSwgeSA9IGRlZmF1bHRWYWx1ZV0gPSB0b051bWJlcnMocG9pbnQpO1xuICAgICAgICByZXR1cm4gbmV3IFBvaW50KHgsIHkpO1xuICAgIH1cbiAgICBzdGF0aWMgcGFyc2VTY2FsZShzY2FsZSkge1xuICAgICAgICBsZXQgZGVmYXVsdFZhbHVlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMV0gOiAxO1xuICAgICAgICBjb25zdCBbeCA9IGRlZmF1bHRWYWx1ZSwgeSA9IHhdID0gdG9OdW1iZXJzKHNjYWxlKTtcbiAgICAgICAgcmV0dXJuIG5ldyBQb2ludCh4LCB5KTtcbiAgICB9XG4gICAgc3RhdGljIHBhcnNlUGF0aChwYXRoKSB7XG4gICAgICAgIGNvbnN0IHBvaW50cyA9IHRvTnVtYmVycyhwYXRoKTtcbiAgICAgICAgY29uc3QgbGVuID0gcG9pbnRzLmxlbmd0aDtcbiAgICAgICAgY29uc3QgcGF0aFBvaW50cyA9IFtdO1xuICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuOyBpICs9IDIpe1xuICAgICAgICAgICAgcGF0aFBvaW50cy5wdXNoKG5ldyBQb2ludChwb2ludHNbaV0sIHBvaW50c1tpICsgMV0pKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcGF0aFBvaW50cztcbiAgICB9XG4gICAgYW5nbGVUbyhwb2ludCkge1xuICAgICAgICByZXR1cm4gTWF0aC5hdGFuMihwb2ludC55IC0gdGhpcy55LCBwb2ludC54IC0gdGhpcy54KTtcbiAgICB9XG4gICAgYXBwbHlUcmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgICAgIGNvbnN0IHsgeCAsIHkgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB4cCA9IHggKiB0cmFuc2Zvcm1bMF0gKyB5ICogdHJhbnNmb3JtWzJdICsgdHJhbnNmb3JtWzRdO1xuICAgICAgICBjb25zdCB5cCA9IHggKiB0cmFuc2Zvcm1bMV0gKyB5ICogdHJhbnNmb3JtWzNdICsgdHJhbnNmb3JtWzVdO1xuICAgICAgICB0aGlzLnggPSB4cDtcbiAgICAgICAgdGhpcy55ID0geXA7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKHgsIHkpe1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgIH1cbn1cblxuY2xhc3MgTW91c2Uge1xuICAgIGlzV29ya2luZygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud29ya2luZztcbiAgICB9XG4gICAgc3RhcnQoKSB7XG4gICAgICAgIGlmICh0aGlzLndvcmtpbmcpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHNjcmVlbiAsIG9uQ2xpY2sgLCBvbk1vdXNlTW92ZSAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IHNjcmVlbi5jdHguY2FudmFzO1xuICAgICAgICBjYW52YXMub25jbGljayA9IG9uQ2xpY2s7XG4gICAgICAgIGNhbnZhcy5vbm1vdXNlbW92ZSA9IG9uTW91c2VNb3ZlO1xuICAgICAgICB0aGlzLndvcmtpbmcgPSB0cnVlO1xuICAgIH1cbiAgICBzdG9wKCkge1xuICAgICAgICBpZiAoIXRoaXMud29ya2luZykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGNhbnZhcyA9IHRoaXMuc2NyZWVuLmN0eC5jYW52YXM7XG4gICAgICAgIHRoaXMud29ya2luZyA9IGZhbHNlO1xuICAgICAgICBjYW52YXMub25jbGljayA9IG51bGw7XG4gICAgICAgIGNhbnZhcy5vbm1vdXNlbW92ZSA9IG51bGw7XG4gICAgfVxuICAgIGhhc0V2ZW50cygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMud29ya2luZyAmJiB0aGlzLmV2ZW50cy5sZW5ndGggPiAwO1xuICAgIH1cbiAgICBydW5FdmVudHMoKSB7XG4gICAgICAgIGlmICghdGhpcy53b3JraW5nKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBzY3JlZW46IGRvY3VtZW50ICwgZXZlbnRzICwgZXZlbnRFbGVtZW50cyAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHsgc3R5bGUgIH0gPSBkb2N1bWVudC5jdHguY2FudmFzO1xuICAgICAgICBsZXQgZWxlbWVudDtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS1jb25kaXRpb25cbiAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICBzdHlsZS5jdXJzb3IgPSAnJztcbiAgICAgICAgfVxuICAgICAgICBldmVudHMuZm9yRWFjaCgocGFyYW0sIGkpPT57XG4gICAgICAgICAgICBsZXQgeyBydW4gIH0gPSBwYXJhbTtcbiAgICAgICAgICAgIGVsZW1lbnQgPSBldmVudEVsZW1lbnRzW2ldO1xuICAgICAgICAgICAgd2hpbGUoZWxlbWVudCl7XG4gICAgICAgICAgICAgICAgcnVuKGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIGRvbmUgcnVubmluZywgY2xlYXJcbiAgICAgICAgdGhpcy5ldmVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5ldmVudEVsZW1lbnRzID0gW107XG4gICAgfVxuICAgIGNoZWNrUGF0aChlbGVtZW50LCBjdHgpIHtcbiAgICAgICAgaWYgKCF0aGlzLndvcmtpbmcgfHwgIWN0eCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgZXZlbnRzICwgZXZlbnRFbGVtZW50cyAgfSA9IHRoaXM7XG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKChwYXJhbSwgaSk9PntcbiAgICAgICAgICAgIGxldCB7IHggLCB5ICB9ID0gcGFyYW07XG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LWNvbmRpdGlvblxuICAgICAgICAgICAgaWYgKCFldmVudEVsZW1lbnRzW2ldICYmIGN0eC5pc1BvaW50SW5QYXRoICYmIGN0eC5pc1BvaW50SW5QYXRoKHgsIHkpKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRFbGVtZW50c1tpXSA9IGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjaGVja0JvdW5kaW5nQm94KGVsZW1lbnQsIGJvdW5kaW5nQm94KSB7XG4gICAgICAgIGlmICghdGhpcy53b3JraW5nIHx8ICFib3VuZGluZ0JveCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgZXZlbnRzICwgZXZlbnRFbGVtZW50cyAgfSA9IHRoaXM7XG4gICAgICAgIGV2ZW50cy5mb3JFYWNoKChwYXJhbSwgaSk9PntcbiAgICAgICAgICAgIGxldCB7IHggLCB5ICB9ID0gcGFyYW07XG4gICAgICAgICAgICBpZiAoIWV2ZW50RWxlbWVudHNbaV0gJiYgYm91bmRpbmdCb3guaXNQb2ludEluQm94KHgsIHkpKSB7XG4gICAgICAgICAgICAgICAgZXZlbnRFbGVtZW50c1tpXSA9IGVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBtYXBYWSh4LCB5KSB7XG4gICAgICAgIGNvbnN0IHsgd2luZG93ICwgY3R4ICB9ID0gdGhpcy5zY3JlZW47XG4gICAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHgsIHkpO1xuICAgICAgICBsZXQgZWxlbWVudCA9IGN0eC5jYW52YXM7XG4gICAgICAgIHdoaWxlKGVsZW1lbnQpe1xuICAgICAgICAgICAgcG9pbnQueCAtPSBlbGVtZW50Lm9mZnNldExlZnQ7XG4gICAgICAgICAgICBwb2ludC55IC09IGVsZW1lbnQub2Zmc2V0VG9wO1xuICAgICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQub2Zmc2V0UGFyZW50O1xuICAgICAgICB9XG4gICAgICAgIGlmICh3aW5kb3cgPT09IG51bGwgfHwgd2luZG93ID09PSB2b2lkIDAgPyB2b2lkIDAgOiB3aW5kb3cuc2Nyb2xsWCkge1xuICAgICAgICAgICAgcG9pbnQueCArPSB3aW5kb3cuc2Nyb2xsWDtcbiAgICAgICAgfVxuICAgICAgICBpZiAod2luZG93ID09PSBudWxsIHx8IHdpbmRvdyA9PT0gdm9pZCAwID8gdm9pZCAwIDogd2luZG93LnNjcm9sbFkpIHtcbiAgICAgICAgICAgIHBvaW50LnkgKz0gd2luZG93LnNjcm9sbFk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBvaW50O1xuICAgIH1cbiAgICBvbkNsaWNrKGV2ZW50KSB7XG4gICAgICAgIGNvbnN0IHsgeCAsIHkgIH0gPSB0aGlzLm1hcFhZKGV2ZW50LmNsaWVudFgsIGV2ZW50LmNsaWVudFkpO1xuICAgICAgICB0aGlzLmV2ZW50cy5wdXNoKHtcbiAgICAgICAgICAgIHR5cGU6ICdvbmNsaWNrJyxcbiAgICAgICAgICAgIHgsXG4gICAgICAgICAgICB5LFxuICAgICAgICAgICAgcnVuIChldmVudFRhcmdldCkge1xuICAgICAgICAgICAgICAgIGlmIChldmVudFRhcmdldC5vbkNsaWNrKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VGFyZ2V0Lm9uQ2xpY2soKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBvbk1vdXNlTW92ZShldmVudCkge1xuICAgICAgICBjb25zdCB7IHggLCB5ICB9ID0gdGhpcy5tYXBYWShldmVudC5jbGllbnRYLCBldmVudC5jbGllbnRZKTtcbiAgICAgICAgdGhpcy5ldmVudHMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnb25tb3VzZW1vdmUnLFxuICAgICAgICAgICAgeCxcbiAgICAgICAgICAgIHksXG4gICAgICAgICAgICBydW4gKGV2ZW50VGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgaWYgKGV2ZW50VGFyZ2V0Lm9uTW91c2VNb3ZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGV2ZW50VGFyZ2V0Lm9uTW91c2VNb3ZlKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG4gICAgY29uc3RydWN0b3Ioc2NyZWVuKXtcbiAgICAgICAgdGhpcy5zY3JlZW4gPSBzY3JlZW47XG4gICAgICAgIHRoaXMud29ya2luZyA9IGZhbHNlO1xuICAgICAgICB0aGlzLmV2ZW50cyA9IFtdO1xuICAgICAgICB0aGlzLmV2ZW50RWxlbWVudHMgPSBbXTtcbiAgICAgICAgdGhpcy5vbkNsaWNrID0gdGhpcy5vbkNsaWNrLmJpbmQodGhpcyk7XG4gICAgICAgIHRoaXMub25Nb3VzZU1vdmUgPSB0aGlzLm9uTW91c2VNb3ZlLmJpbmQodGhpcyk7XG4gICAgfVxufVxuXG5jb25zdCBkZWZhdWx0V2luZG93ID0gdHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiBudWxsO1xuY29uc3QgZGVmYXVsdEZldGNoJDEgPSB0eXBlb2YgZmV0Y2ggIT09ICd1bmRlZmluZWQnID8gZmV0Y2guYmluZCh1bmRlZmluZWQpIC8vIGBmZXRjaGAgZGVwZW5kcyBvbiBjb250ZXh0OiBgc29tZU9iamVjdC5mZXRjaCguLi4pYCB3aWxsIHRocm93IGVycm9yLlxuIDogdW5kZWZpbmVkO1xuY2xhc3MgU2NyZWVuIHtcbiAgICB3YWl0KGNoZWNrZXIpIHtcbiAgICAgICAgdGhpcy53YWl0cy5wdXNoKGNoZWNrZXIpO1xuICAgIH1cbiAgICByZWFkeSgpIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1taXN1c2VkLXByb21pc2VzXG4gICAgICAgIGlmICghdGhpcy5yZWFkeVByb21pc2UpIHtcbiAgICAgICAgICAgIHJldHVybiBQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5yZWFkeVByb21pc2U7XG4gICAgfVxuICAgIGlzUmVhZHkoKSB7XG4gICAgICAgIGlmICh0aGlzLmlzUmVhZHlMb2NrKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpc1JlYWR5TG9jayA9IHRoaXMud2FpdHMuZXZlcnkoKF8pPT5fKClcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGlzUmVhZHlMb2NrKSB7XG4gICAgICAgICAgICB0aGlzLndhaXRzID0gW107XG4gICAgICAgICAgICBpZiAodGhpcy5yZXNvbHZlUmVhZHkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnJlc29sdmVSZWFkeSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuaXNSZWFkeUxvY2sgPSBpc1JlYWR5TG9jaztcbiAgICAgICAgcmV0dXJuIGlzUmVhZHlMb2NrO1xuICAgIH1cbiAgICBzZXREZWZhdWx0cyhjdHgpIHtcbiAgICAgICAgLy8gaW5pdGlhbCB2YWx1ZXMgYW5kIGRlZmF1bHRzXG4gICAgICAgIGN0eC5zdHJva2VTdHlsZSA9ICdyZ2JhKDAsMCwwLDApJztcbiAgICAgICAgY3R4LmxpbmVDYXAgPSAnYnV0dCc7XG4gICAgICAgIGN0eC5saW5lSm9pbiA9ICdtaXRlcic7XG4gICAgICAgIGN0eC5taXRlckxpbWl0ID0gNDtcbiAgICB9XG4gICAgc2V0Vmlld0JveChwYXJhbSkge1xuICAgICAgICBsZXQgeyBkb2N1bWVudCAsIGN0eCAsIGFzcGVjdFJhdGlvICwgd2lkdGggLCBkZXNpcmVkV2lkdGggLCBoZWlnaHQgLCBkZXNpcmVkSGVpZ2h0ICwgbWluWCA9MCAsIG1pblkgPTAgLCByZWZYICwgcmVmWSAsIGNsaXAgPWZhbHNlICwgY2xpcFggPTAgLCBjbGlwWSA9MCAgfSA9IHBhcmFtO1xuICAgICAgICAvLyBhc3BlY3QgcmF0aW8gLSBodHRwOi8vd3d3LnczLm9yZy9UUi9TVkcvY29vcmRzLmh0bWwjUHJlc2VydmVBc3BlY3RSYXRpb0F0dHJpYnV0ZVxuICAgICAgICBjb25zdCBjbGVhbkFzcGVjdFJhdGlvID0gY29tcHJlc3NTcGFjZXMoYXNwZWN0UmF0aW8pLnJlcGxhY2UoL15kZWZlclxccy8sICcnKSAvLyBpZ25vcmUgZGVmZXJcbiAgICAgICAgO1xuICAgICAgICBjb25zdCBbYXNwZWN0UmF0aW9BbGlnbiwgYXNwZWN0UmF0aW9NZWV0T3JTbGljZV0gPSBjbGVhbkFzcGVjdFJhdGlvLnNwbGl0KCcgJyk7XG4gICAgICAgIGNvbnN0IGFsaWduID0gYXNwZWN0UmF0aW9BbGlnbiB8fCAneE1pZFlNaWQnO1xuICAgICAgICBjb25zdCBtZWV0T3JTbGljZSA9IGFzcGVjdFJhdGlvTWVldE9yU2xpY2UgfHwgJ21lZXQnO1xuICAgICAgICAvLyBjYWxjdWxhdGUgc2NhbGVcbiAgICAgICAgY29uc3Qgc2NhbGVYID0gd2lkdGggLyBkZXNpcmVkV2lkdGg7XG4gICAgICAgIGNvbnN0IHNjYWxlWSA9IGhlaWdodCAvIGRlc2lyZWRIZWlnaHQ7XG4gICAgICAgIGNvbnN0IHNjYWxlTWluID0gTWF0aC5taW4oc2NhbGVYLCBzY2FsZVkpO1xuICAgICAgICBjb25zdCBzY2FsZU1heCA9IE1hdGgubWF4KHNjYWxlWCwgc2NhbGVZKTtcbiAgICAgICAgbGV0IGZpbmFsRGVzaXJlZFdpZHRoID0gZGVzaXJlZFdpZHRoO1xuICAgICAgICBsZXQgZmluYWxEZXNpcmVkSGVpZ2h0ID0gZGVzaXJlZEhlaWdodDtcbiAgICAgICAgaWYgKG1lZXRPclNsaWNlID09PSAnbWVldCcpIHtcbiAgICAgICAgICAgIGZpbmFsRGVzaXJlZFdpZHRoICo9IHNjYWxlTWluO1xuICAgICAgICAgICAgZmluYWxEZXNpcmVkSGVpZ2h0ICo9IHNjYWxlTWluO1xuICAgICAgICB9XG4gICAgICAgIGlmIChtZWV0T3JTbGljZSA9PT0gJ3NsaWNlJykge1xuICAgICAgICAgICAgZmluYWxEZXNpcmVkV2lkdGggKj0gc2NhbGVNYXg7XG4gICAgICAgICAgICBmaW5hbERlc2lyZWRIZWlnaHQgKj0gc2NhbGVNYXg7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVmWFByb3AgPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsICdyZWZYJywgcmVmWCk7XG4gICAgICAgIGNvbnN0IHJlZllQcm9wID0gbmV3IFByb3BlcnR5KGRvY3VtZW50LCAncmVmWScsIHJlZlkpO1xuICAgICAgICBjb25zdCBoYXNSZWZzID0gcmVmWFByb3AuaGFzVmFsdWUoKSAmJiByZWZZUHJvcC5oYXNWYWx1ZSgpO1xuICAgICAgICBpZiAoaGFzUmVmcykge1xuICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgtc2NhbGVNaW4gKiByZWZYUHJvcC5nZXRQaXhlbHMoJ3gnKSwgLXNjYWxlTWluICogcmVmWVByb3AuZ2V0UGl4ZWxzKCd5JykpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjbGlwKSB7XG4gICAgICAgICAgICBjb25zdCBzY2FsZWRDbGlwWCA9IHNjYWxlTWluICogY2xpcFg7XG4gICAgICAgICAgICBjb25zdCBzY2FsZWRDbGlwWSA9IHNjYWxlTWluICogY2xpcFk7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgICAgICBjdHgubW92ZVRvKHNjYWxlZENsaXBYLCBzY2FsZWRDbGlwWSk7XG4gICAgICAgICAgICBjdHgubGluZVRvKHdpZHRoLCBzY2FsZWRDbGlwWSk7XG4gICAgICAgICAgICBjdHgubGluZVRvKHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICAgICAgY3R4LmxpbmVUbyhzY2FsZWRDbGlwWCwgaGVpZ2h0KTtcbiAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5jbGlwKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFoYXNSZWZzKSB7XG4gICAgICAgICAgICBjb25zdCBpc01lZXRNaW5ZID0gbWVldE9yU2xpY2UgPT09ICdtZWV0JyAmJiBzY2FsZU1pbiA9PT0gc2NhbGVZO1xuICAgICAgICAgICAgY29uc3QgaXNTbGljZU1heFkgPSBtZWV0T3JTbGljZSA9PT0gJ3NsaWNlJyAmJiBzY2FsZU1heCA9PT0gc2NhbGVZO1xuICAgICAgICAgICAgY29uc3QgaXNNZWV0TWluWCA9IG1lZXRPclNsaWNlID09PSAnbWVldCcgJiYgc2NhbGVNaW4gPT09IHNjYWxlWDtcbiAgICAgICAgICAgIGNvbnN0IGlzU2xpY2VNYXhYID0gbWVldE9yU2xpY2UgPT09ICdzbGljZScgJiYgc2NhbGVNYXggPT09IHNjYWxlWDtcbiAgICAgICAgICAgIGlmIChhbGlnbi5zdGFydHNXaXRoKCd4TWlkJykgJiYgKGlzTWVldE1pblkgfHwgaXNTbGljZU1heFkpKSB7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSh3aWR0aCAvIDIgLSBmaW5hbERlc2lyZWRXaWR0aCAvIDIsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFsaWduLmVuZHNXaXRoKCdZTWlkJykgJiYgKGlzTWVldE1pblggfHwgaXNTbGljZU1heFgpKSB7XG4gICAgICAgICAgICAgICAgY3R4LnRyYW5zbGF0ZSgwLCBoZWlnaHQgLyAyIC0gZmluYWxEZXNpcmVkSGVpZ2h0IC8gMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWxpZ24uc3RhcnRzV2l0aCgneE1heCcpICYmIChpc01lZXRNaW5ZIHx8IGlzU2xpY2VNYXhZKSkge1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUod2lkdGggLSBmaW5hbERlc2lyZWRXaWR0aCwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoYWxpZ24uZW5kc1dpdGgoJ1lNYXgnKSAmJiAoaXNNZWV0TWluWCB8fCBpc1NsaWNlTWF4WCkpIHtcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKDAsIGhlaWdodCAtIGZpbmFsRGVzaXJlZEhlaWdodCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gc2NhbGVcbiAgICAgICAgc3dpdGNoKHRydWUpe1xuICAgICAgICAgICAgY2FzZSBhbGlnbiA9PT0gJ25vbmUnOlxuICAgICAgICAgICAgICAgIGN0eC5zY2FsZShzY2FsZVgsIHNjYWxlWSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIG1lZXRPclNsaWNlID09PSAnbWVldCc6XG4gICAgICAgICAgICAgICAgY3R4LnNjYWxlKHNjYWxlTWluLCBzY2FsZU1pbik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIG1lZXRPclNsaWNlID09PSAnc2xpY2UnOlxuICAgICAgICAgICAgICAgIGN0eC5zY2FsZShzY2FsZU1heCwgc2NhbGVNYXgpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIC8vIHRyYW5zbGF0ZVxuICAgICAgICBjdHgudHJhbnNsYXRlKC1taW5YLCAtbWluWSk7XG4gICAgfVxuICAgIHN0YXJ0KGVsZW1lbnQpIHtcbiAgICAgICAgbGV0IHsgZW5hYmxlUmVkcmF3ID1mYWxzZSAsIGlnbm9yZU1vdXNlID1mYWxzZSAsIGlnbm9yZUFuaW1hdGlvbiA9ZmFsc2UgLCBpZ25vcmVEaW1lbnNpb25zID1mYWxzZSAsIGlnbm9yZUNsZWFyID1mYWxzZSAsIGZvcmNlUmVkcmF3ICwgc2NhbGVXaWR0aCAsIHNjYWxlSGVpZ2h0ICwgb2Zmc2V0WCAsIG9mZnNldFkgIH0gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1sxXSA6IHt9O1xuICAgICAgICBjb25zdCB7IG1vdXNlICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgZnJhbWVEdXJhdGlvbiA9IDEwMDAgLyBTY3JlZW4uRlJBTUVSQVRFO1xuICAgICAgICB0aGlzLmZyYW1lRHVyYXRpb24gPSBmcmFtZUR1cmF0aW9uO1xuICAgICAgICB0aGlzLnJlYWR5UHJvbWlzZSA9IG5ldyBQcm9taXNlKChyZXNvbHZlKT0+e1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlUmVhZHkgPSByZXNvbHZlO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuaXNSZWFkeSgpKSB7XG4gICAgICAgICAgICB0aGlzLnJlbmRlcihlbGVtZW50LCBpZ25vcmVEaW1lbnNpb25zLCBpZ25vcmVDbGVhciwgc2NhbGVXaWR0aCwgc2NhbGVIZWlnaHQsIG9mZnNldFgsIG9mZnNldFkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghZW5hYmxlUmVkcmF3KSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbGV0IG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgIGxldCB0aGVuID0gbm93O1xuICAgICAgICBsZXQgZGVsdGEgPSAwO1xuICAgICAgICBjb25zdCB0aWNrID0gKCk9PntcbiAgICAgICAgICAgIG5vdyA9IERhdGUubm93KCk7XG4gICAgICAgICAgICBkZWx0YSA9IG5vdyAtIHRoZW47XG4gICAgICAgICAgICBpZiAoZGVsdGEgPj0gZnJhbWVEdXJhdGlvbikge1xuICAgICAgICAgICAgICAgIHRoZW4gPSBub3cgLSBkZWx0YSAlIGZyYW1lRHVyYXRpb247XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuc2hvdWxkVXBkYXRlKGlnbm9yZUFuaW1hdGlvbiwgZm9yY2VSZWRyYXcpKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucmVuZGVyKGVsZW1lbnQsIGlnbm9yZURpbWVuc2lvbnMsIGlnbm9yZUNsZWFyLCBzY2FsZVdpZHRoLCBzY2FsZUhlaWdodCwgb2Zmc2V0WCwgb2Zmc2V0WSk7XG4gICAgICAgICAgICAgICAgICAgIG1vdXNlLnJ1bkV2ZW50cygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IHJlcXVlc3RBbmltYXRpb25GcmFtZV9fZGVmYXVsdFtcImRlZmF1bHRcIl0odGljayk7XG4gICAgICAgIH07XG4gICAgICAgIGlmICghaWdub3JlTW91c2UpIHtcbiAgICAgICAgICAgIG1vdXNlLnN0YXJ0KCk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5pbnRlcnZhbElkID0gcmVxdWVzdEFuaW1hdGlvbkZyYW1lX19kZWZhdWx0W1wiZGVmYXVsdFwiXSh0aWNrKTtcbiAgICB9XG4gICAgc3RvcCgpIHtcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJ2YWxJZCkge1xuICAgICAgICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lX19kZWZhdWx0W1wiZGVmYXVsdFwiXS5jYW5jZWwodGhpcy5pbnRlcnZhbElkKTtcbiAgICAgICAgICAgIHRoaXMuaW50ZXJ2YWxJZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5tb3VzZS5zdG9wKCk7XG4gICAgfVxuICAgIHNob3VsZFVwZGF0ZShpZ25vcmVBbmltYXRpb24sIGZvcmNlUmVkcmF3KSB7XG4gICAgICAgIC8vIG5lZWQgdXBkYXRlIGZyb20gYW5pbWF0aW9ucz9cbiAgICAgICAgaWYgKCFpZ25vcmVBbmltYXRpb24pIHtcbiAgICAgICAgICAgIGNvbnN0IHsgZnJhbWVEdXJhdGlvbiAgfSA9IHRoaXM7XG4gICAgICAgICAgICBjb25zdCBzaG91bGRVcGRhdGUxID0gdGhpcy5hbmltYXRpb25zLnJlZHVjZSgoc2hvdWxkVXBkYXRlLCBhbmltYXRpb24pPT5hbmltYXRpb24udXBkYXRlKGZyYW1lRHVyYXRpb24pIHx8IHNob3VsZFVwZGF0ZVxuICAgICAgICAgICAgLCBmYWxzZSk7XG4gICAgICAgICAgICBpZiAoc2hvdWxkVXBkYXRlMSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIC8vIG5lZWQgdXBkYXRlIGZyb20gcmVkcmF3P1xuICAgICAgICBpZiAodHlwZW9mIGZvcmNlUmVkcmF3ID09PSAnZnVuY3Rpb24nICYmIGZvcmNlUmVkcmF3KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5pc1JlYWR5TG9jayAmJiB0aGlzLmlzUmVhZHkoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gbmVlZCB1cGRhdGUgZnJvbSBtb3VzZSBldmVudHM/XG4gICAgICAgIGlmICh0aGlzLm1vdXNlLmhhc0V2ZW50cygpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJlbmRlcihlbGVtZW50LCBpZ25vcmVEaW1lbnNpb25zLCBpZ25vcmVDbGVhciwgc2NhbGVXaWR0aCwgc2NhbGVIZWlnaHQsIG9mZnNldFgsIG9mZnNldFkpIHtcbiAgICAgICAgY29uc3QgeyB2aWV3UG9ydCAsIGN0eCAsIGlzRmlyc3RSZW5kZXIgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBjYW52YXMgPSBjdHguY2FudmFzO1xuICAgICAgICB2aWV3UG9ydC5jbGVhcigpO1xuICAgICAgICBpZiAoY2FudmFzLndpZHRoICYmIGNhbnZhcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHZpZXdQb3J0LnNldEN1cnJlbnQoY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB3aWR0aFN0eWxlID0gZWxlbWVudC5nZXRTdHlsZSgnd2lkdGgnKTtcbiAgICAgICAgY29uc3QgaGVpZ2h0U3R5bGUgPSBlbGVtZW50LmdldFN0eWxlKCdoZWlnaHQnKTtcbiAgICAgICAgaWYgKCFpZ25vcmVEaW1lbnNpb25zICYmIChpc0ZpcnN0UmVuZGVyIHx8IHR5cGVvZiBzY2FsZVdpZHRoICE9PSAnbnVtYmVyJyAmJiB0eXBlb2Ygc2NhbGVIZWlnaHQgIT09ICdudW1iZXInKSkge1xuICAgICAgICAgICAgLy8gc2V0IGNhbnZhcyBzaXplXG4gICAgICAgICAgICBpZiAod2lkdGhTdHlsZS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLndpZHRoID0gd2lkdGhTdHlsZS5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXVubmVjZXNzYXJ5LWNvbmRpdGlvblxuICAgICAgICAgICAgICAgIGlmIChjYW52YXMuc3R5bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY2FudmFzLnN0eWxlLndpZHRoID0gXCJcIi5jb25jYXQoY2FudmFzLndpZHRoLCBcInB4XCIpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChoZWlnaHRTdHlsZS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgY2FudmFzLmhlaWdodCA9IGhlaWdodFN0eWxlLmdldFBpeGVscygneScpO1xuICAgICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdW5uZWNlc3NhcnktY29uZGl0aW9uXG4gICAgICAgICAgICAgICAgaWYgKGNhbnZhcy5zdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICBjYW52YXMuc3R5bGUuaGVpZ2h0ID0gXCJcIi5jb25jYXQoY2FudmFzLmhlaWdodCwgXCJweFwiKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgbGV0IGNXaWR0aCA9IGNhbnZhcy5jbGllbnRXaWR0aCB8fCBjYW52YXMud2lkdGg7XG4gICAgICAgIGxldCBjSGVpZ2h0ID0gY2FudmFzLmNsaWVudEhlaWdodCB8fCBjYW52YXMuaGVpZ2h0O1xuICAgICAgICBpZiAoaWdub3JlRGltZW5zaW9ucyAmJiB3aWR0aFN0eWxlLmhhc1ZhbHVlKCkgJiYgaGVpZ2h0U3R5bGUuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgY1dpZHRoID0gd2lkdGhTdHlsZS5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgICAgIGNIZWlnaHQgPSBoZWlnaHRTdHlsZS5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgfVxuICAgICAgICB2aWV3UG9ydC5zZXRDdXJyZW50KGNXaWR0aCwgY0hlaWdodCk7XG4gICAgICAgIGlmICh0eXBlb2Ygb2Zmc2V0WCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCd4JywgdHJ1ZSkuc2V0VmFsdWUob2Zmc2V0WCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiBvZmZzZXRZID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3knLCB0cnVlKS5zZXRWYWx1ZShvZmZzZXRZKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHNjYWxlV2lkdGggPT09ICdudW1iZXInIHx8IHR5cGVvZiBzY2FsZUhlaWdodCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICAgIGNvbnN0IHZpZXdCb3ggPSB0b051bWJlcnMoZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnKS5nZXRTdHJpbmcoKSk7XG4gICAgICAgICAgICBsZXQgeFJhdGlvID0gMDtcbiAgICAgICAgICAgIGxldCB5UmF0aW8gPSAwO1xuICAgICAgICAgICAgaWYgKHR5cGVvZiBzY2FsZVdpZHRoID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdpZHRoU3R5bGUgPSBlbGVtZW50LmdldFN0eWxlKCd3aWR0aCcpO1xuICAgICAgICAgICAgICAgIGlmICh3aWR0aFN0eWxlLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgeFJhdGlvID0gd2lkdGhTdHlsZS5nZXRQaXhlbHMoJ3gnKSAvIHNjYWxlV2lkdGg7XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmICh2aWV3Qm94WzJdICYmICFpc05hTih2aWV3Qm94WzJdKSkge1xuICAgICAgICAgICAgICAgICAgICB4UmF0aW8gPSB2aWV3Qm94WzJdIC8gc2NhbGVXaWR0aDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHlwZW9mIHNjYWxlSGVpZ2h0ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGhlaWdodFN0eWxlID0gZWxlbWVudC5nZXRTdHlsZSgnaGVpZ2h0Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGhlaWdodFN0eWxlLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgeVJhdGlvID0gaGVpZ2h0U3R5bGUuZ2V0UGl4ZWxzKCd5JykgLyBzY2FsZUhlaWdodDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHZpZXdCb3hbM10gJiYgIWlzTmFOKHZpZXdCb3hbM10pKSB7XG4gICAgICAgICAgICAgICAgICAgIHlSYXRpbyA9IHZpZXdCb3hbM10gLyBzY2FsZUhlaWdodDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoIXhSYXRpbykge1xuICAgICAgICAgICAgICAgIHhSYXRpbyA9IHlSYXRpbztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICgheVJhdGlvKSB7XG4gICAgICAgICAgICAgICAgeVJhdGlvID0geFJhdGlvO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxlbWVudC5nZXRBdHRyaWJ1dGUoJ3dpZHRoJywgdHJ1ZSkuc2V0VmFsdWUoc2NhbGVXaWR0aCk7XG4gICAgICAgICAgICBlbGVtZW50LmdldEF0dHJpYnV0ZSgnaGVpZ2h0JywgdHJ1ZSkuc2V0VmFsdWUoc2NhbGVIZWlnaHQpO1xuICAgICAgICAgICAgY29uc3QgdHJhbnNmb3JtU3R5bGUgPSBlbGVtZW50LmdldFN0eWxlKCd0cmFuc2Zvcm0nLCB0cnVlLCB0cnVlKTtcbiAgICAgICAgICAgIHRyYW5zZm9ybVN0eWxlLnNldFZhbHVlKFwiXCIuY29uY2F0KHRyYW5zZm9ybVN0eWxlLmdldFN0cmluZygpLCBcIiBzY2FsZShcIikuY29uY2F0KDEgLyB4UmF0aW8sIFwiLCBcIikuY29uY2F0KDEgLyB5UmF0aW8sIFwiKVwiKSk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2xlYXIgYW5kIHJlbmRlclxuICAgICAgICBpZiAoIWlnbm9yZUNsZWFyKSB7XG4gICAgICAgICAgICBjdHguY2xlYXJSZWN0KDAsIDAsIGNXaWR0aCwgY0hlaWdodCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxlbWVudC5yZW5kZXIoY3R4KTtcbiAgICAgICAgaWYgKGlzRmlyc3RSZW5kZXIpIHtcbiAgICAgICAgICAgIHRoaXMuaXNGaXJzdFJlbmRlciA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGN0eCwgeyBmZXRjaCA9ZGVmYXVsdEZldGNoJDEgLCB3aW5kb3cgPWRlZmF1bHRXaW5kb3cgIH0gPSB7fSl7XG4gICAgICAgIHRoaXMuY3R4ID0gY3R4O1xuICAgICAgICB0aGlzLnZpZXdQb3J0ID0gbmV3IFZpZXdQb3J0KCk7XG4gICAgICAgIHRoaXMubW91c2UgPSBuZXcgTW91c2UodGhpcyk7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9ucyA9IFtdO1xuICAgICAgICB0aGlzLndhaXRzID0gW107XG4gICAgICAgIHRoaXMuZnJhbWVEdXJhdGlvbiA9IDA7XG4gICAgICAgIHRoaXMuaXNSZWFkeUxvY2sgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5pc0ZpcnN0UmVuZGVyID0gdHJ1ZTtcbiAgICAgICAgdGhpcy5pbnRlcnZhbElkID0gbnVsbDtcbiAgICAgICAgdGhpcy53aW5kb3cgPSB3aW5kb3c7XG4gICAgICAgIGlmICghZmV0Y2gpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGZpbmQgJ2ZldGNoJyBpbiAnZ2xvYmFsVGhpcycsIHBsZWFzZSBwcm92aWRlIGl0IHZpYSBvcHRpb25zXCIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZmV0Y2ggPSBmZXRjaDtcbiAgICB9XG59XG5TY3JlZW4uZGVmYXVsdFdpbmRvdyA9IGRlZmF1bHRXaW5kb3c7XG5TY3JlZW4uZGVmYXVsdEZldGNoID0gZGVmYXVsdEZldGNoJDE7XG5TY3JlZW4uRlJBTUVSQVRFID0gMzA7XG5TY3JlZW4uTUFYX1ZJUlRVQUxfUElYRUxTID0gMzAwMDA7XG5cbmNvbnN0IHsgZGVmYXVsdEZldGNoICB9ID0gU2NyZWVuO1xuY29uc3QgRGVmYXVsdERPTVBhcnNlciA9IHR5cGVvZiBET01QYXJzZXIgIT09ICd1bmRlZmluZWQnID8gRE9NUGFyc2VyIDogdW5kZWZpbmVkO1xuY2xhc3MgUGFyc2VyIHtcbiAgICBhc3luYyBwYXJzZShyZXNvdXJjZSkge1xuICAgICAgICBpZiAocmVzb3VyY2Uuc3RhcnRzV2l0aCgnPCcpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wYXJzZUZyb21TdHJpbmcocmVzb3VyY2UpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmxvYWQocmVzb3VyY2UpO1xuICAgIH1cbiAgICBwYXJzZUZyb21TdHJpbmcoeG1sKSB7XG4gICAgICAgIGNvbnN0IHBhcnNlciA9IG5ldyB0aGlzLkRPTVBhcnNlcigpO1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tEb2N1bWVudChwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhtbCwgJ2ltYWdlL3N2Zyt4bWwnKSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY2hlY2tEb2N1bWVudChwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHhtbCwgJ3RleHQveG1sJykpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNoZWNrRG9jdW1lbnQoZG9jdW1lbnQpIHtcbiAgICAgICAgY29uc3QgcGFyc2VyRXJyb3IgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgncGFyc2VyZXJyb3InKVswXTtcbiAgICAgICAgaWYgKHBhcnNlckVycm9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IocGFyc2VyRXJyb3IudGV4dENvbnRlbnQgfHwgJ1Vua25vd24gcGFyc2UgZXJyb3InKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZG9jdW1lbnQ7XG4gICAgfVxuICAgIGFzeW5jIGxvYWQodXJsKSB7XG4gICAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgdGhpcy5mZXRjaCh1cmwpO1xuICAgICAgICBjb25zdCB4bWwgPSBhd2FpdCByZXNwb25zZS50ZXh0KCk7XG4gICAgICAgIHJldHVybiB0aGlzLnBhcnNlRnJvbVN0cmluZyh4bWwpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcih7IGZldGNoID1kZWZhdWx0RmV0Y2ggLCBET01QYXJzZXIgPURlZmF1bHRET01QYXJzZXIgIH0gPSB7fSl7XG4gICAgICAgIGlmICghZmV0Y2gpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbid0IGZpbmQgJ2ZldGNoJyBpbiAnZ2xvYmFsVGhpcycsIHBsZWFzZSBwcm92aWRlIGl0IHZpYSBvcHRpb25zXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghRE9NUGFyc2VyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW4ndCBmaW5kICdET01QYXJzZXInIGluICdnbG9iYWxUaGlzJywgcGxlYXNlIHByb3ZpZGUgaXQgdmlhIG9wdGlvbnNcIik7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5mZXRjaCA9IGZldGNoO1xuICAgICAgICB0aGlzLkRPTVBhcnNlciA9IERPTVBhcnNlcjtcbiAgICB9XG59XG5cbmNsYXNzIFRyYW5zbGF0ZSB7XG4gICAgYXBwbHkoY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgeCAsIHkgIH0gPSB0aGlzLnBvaW50O1xuICAgICAgICBjdHgudHJhbnNsYXRlKHggfHwgMCwgeSB8fCAwKTtcbiAgICB9XG4gICAgdW5hcHBseShjdHgpIHtcbiAgICAgICAgY29uc3QgeyB4ICwgeSAgfSA9IHRoaXMucG9pbnQ7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoLTEgKiB4IHx8IDAsIC0xICogeSB8fCAwKTtcbiAgICB9XG4gICAgYXBwbHlUb1BvaW50KHBvaW50KSB7XG4gICAgICAgIGNvbnN0IHsgeCAsIHkgIH0gPSB0aGlzLnBvaW50O1xuICAgICAgICBwb2ludC5hcHBseVRyYW5zZm9ybShbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgeCB8fCAwLFxuICAgICAgICAgICAgeSB8fCAwXG4gICAgICAgIF0pO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihfLCBwb2ludCl7XG4gICAgICAgIHRoaXMudHlwZSA9ICd0cmFuc2xhdGUnO1xuICAgICAgICB0aGlzLnBvaW50ID0gUG9pbnQucGFyc2UocG9pbnQpO1xuICAgIH1cbn1cblxuY2xhc3MgUm90YXRlIHtcbiAgICBhcHBseShjdHgpIHtcbiAgICAgICAgY29uc3QgeyBjeCAsIGN5ICwgb3JpZ2luWCAsIG9yaWdpblkgLCBhbmdsZSAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHR4ID0gY3ggKyBvcmlnaW5YLmdldFBpeGVscygneCcpO1xuICAgICAgICBjb25zdCB0eSA9IGN5ICsgb3JpZ2luWS5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSh0eCwgdHkpO1xuICAgICAgICBjdHgucm90YXRlKGFuZ2xlLmdldFJhZGlhbnMoKSk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoLXR4LCAtdHkpO1xuICAgIH1cbiAgICB1bmFwcGx5KGN0eCkge1xuICAgICAgICBjb25zdCB7IGN4ICwgY3kgLCBvcmlnaW5YICwgb3JpZ2luWSAsIGFuZ2xlICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgdHggPSBjeCArIG9yaWdpblguZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGNvbnN0IHR5ID0gY3kgKyBvcmlnaW5ZLmdldFBpeGVscygneScpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKHR4LCB0eSk7XG4gICAgICAgIGN0eC5yb3RhdGUoLTEgKiBhbmdsZS5nZXRSYWRpYW5zKCkpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKC10eCwgLXR5KTtcbiAgICB9XG4gICAgYXBwbHlUb1BvaW50KHBvaW50KSB7XG4gICAgICAgIGNvbnN0IHsgY3ggLCBjeSAsIGFuZ2xlICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgcmFkID0gYW5nbGUuZ2V0UmFkaWFucygpO1xuICAgICAgICBwb2ludC5hcHBseVRyYW5zZm9ybShbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgY3ggfHwgMCxcbiAgICAgICAgICAgIGN5IHx8IDAgLy8gdGhpcy5wLnlcbiAgICAgICAgXSk7XG4gICAgICAgIHBvaW50LmFwcGx5VHJhbnNmb3JtKFtcbiAgICAgICAgICAgIE1hdGguY29zKHJhZCksXG4gICAgICAgICAgICBNYXRoLnNpbihyYWQpLFxuICAgICAgICAgICAgLU1hdGguc2luKHJhZCksXG4gICAgICAgICAgICBNYXRoLmNvcyhyYWQpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSk7XG4gICAgICAgIHBvaW50LmFwcGx5VHJhbnNmb3JtKFtcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAtY3ggfHwgMCxcbiAgICAgICAgICAgIC1jeSB8fCAwIC8vIC10aGlzLnAueVxuICAgICAgICBdKTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIHJvdGF0ZSwgdHJhbnNmb3JtT3JpZ2luKXtcbiAgICAgICAgdGhpcy50eXBlID0gJ3JvdGF0ZSc7XG4gICAgICAgIGNvbnN0IG51bWJlcnMgPSB0b051bWJlcnMocm90YXRlKTtcbiAgICAgICAgdGhpcy5hbmdsZSA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ2FuZ2xlJywgbnVtYmVyc1swXSk7XG4gICAgICAgIHRoaXMub3JpZ2luWCA9IHRyYW5zZm9ybU9yaWdpblswXTtcbiAgICAgICAgdGhpcy5vcmlnaW5ZID0gdHJhbnNmb3JtT3JpZ2luWzFdO1xuICAgICAgICB0aGlzLmN4ID0gbnVtYmVyc1sxXSB8fCAwO1xuICAgICAgICB0aGlzLmN5ID0gbnVtYmVyc1syXSB8fCAwO1xuICAgIH1cbn1cblxuY2xhc3MgU2NhbGUge1xuICAgIGFwcGx5KGN0eCkge1xuICAgICAgICBjb25zdCB7IHNjYWxlOiB7IHggLCB5ICB9ICwgb3JpZ2luWCAsIG9yaWdpblkgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB0eCA9IG9yaWdpblguZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGNvbnN0IHR5ID0gb3JpZ2luWS5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSh0eCwgdHkpO1xuICAgICAgICBjdHguc2NhbGUoeCwgeSB8fCB4KTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSgtdHgsIC10eSk7XG4gICAgfVxuICAgIHVuYXBwbHkoY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgc2NhbGU6IHsgeCAsIHkgIH0gLCBvcmlnaW5YICwgb3JpZ2luWSAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHR4ID0gb3JpZ2luWC5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgY29uc3QgdHkgPSBvcmlnaW5ZLmdldFBpeGVscygneScpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKHR4LCB0eSk7XG4gICAgICAgIGN0eC5zY2FsZSgxIC8geCwgMSAvIHkgfHwgeCk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoLXR4LCAtdHkpO1xuICAgIH1cbiAgICBhcHBseVRvUG9pbnQocG9pbnQpIHtcbiAgICAgICAgY29uc3QgeyB4ICwgeSAgfSA9IHRoaXMuc2NhbGU7XG4gICAgICAgIHBvaW50LmFwcGx5VHJhbnNmb3JtKFtcbiAgICAgICAgICAgIHggfHwgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgeSB8fCAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDBcbiAgICAgICAgXSk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKF8sIHNjYWxlLCB0cmFuc2Zvcm1PcmlnaW4pe1xuICAgICAgICB0aGlzLnR5cGUgPSAnc2NhbGUnO1xuICAgICAgICBjb25zdCBzY2FsZVNpemUgPSBQb2ludC5wYXJzZVNjYWxlKHNjYWxlKTtcbiAgICAgICAgLy8gV29ya2Fyb3VuZCBmb3Igbm9kZS1jYW52YXNcbiAgICAgICAgaWYgKHNjYWxlU2l6ZS54ID09PSAwIHx8IHNjYWxlU2l6ZS55ID09PSAwKSB7XG4gICAgICAgICAgICBzY2FsZVNpemUueCA9IFBTRVVET19aRVJPO1xuICAgICAgICAgICAgc2NhbGVTaXplLnkgPSBQU0VVRE9fWkVSTztcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnNjYWxlID0gc2NhbGVTaXplO1xuICAgICAgICB0aGlzLm9yaWdpblggPSB0cmFuc2Zvcm1PcmlnaW5bMF07XG4gICAgICAgIHRoaXMub3JpZ2luWSA9IHRyYW5zZm9ybU9yaWdpblsxXTtcbiAgICB9XG59XG5cbmNsYXNzIE1hdHJpeCB7XG4gICAgYXBwbHkoY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgb3JpZ2luWCAsIG9yaWdpblkgLCBtYXRyaXggIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB0eCA9IG9yaWdpblguZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGNvbnN0IHR5ID0gb3JpZ2luWS5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSh0eCwgdHkpO1xuICAgICAgICBjdHgudHJhbnNmb3JtKG1hdHJpeFswXSwgbWF0cml4WzFdLCBtYXRyaXhbMl0sIG1hdHJpeFszXSwgbWF0cml4WzRdLCBtYXRyaXhbNV0pO1xuICAgICAgICBjdHgudHJhbnNsYXRlKC10eCwgLXR5KTtcbiAgICB9XG4gICAgdW5hcHBseShjdHgpIHtcbiAgICAgICAgY29uc3QgeyBvcmlnaW5YICwgb3JpZ2luWSAsIG1hdHJpeCAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGEgPSBtYXRyaXhbMF07XG4gICAgICAgIGNvbnN0IGIgPSBtYXRyaXhbMl07XG4gICAgICAgIGNvbnN0IGMgPSBtYXRyaXhbNF07XG4gICAgICAgIGNvbnN0IGQgPSBtYXRyaXhbMV07XG4gICAgICAgIGNvbnN0IGUgPSBtYXRyaXhbM107XG4gICAgICAgIGNvbnN0IGYgPSBtYXRyaXhbNV07XG4gICAgICAgIGNvbnN0IGcgPSAwO1xuICAgICAgICBjb25zdCBoID0gMDtcbiAgICAgICAgY29uc3QgaSA9IDE7XG4gICAgICAgIGNvbnN0IGRldCA9IDEgLyAoYSAqIChlICogaSAtIGYgKiBoKSAtIGIgKiAoZCAqIGkgLSBmICogZykgKyBjICogKGQgKiBoIC0gZSAqIGcpKTtcbiAgICAgICAgY29uc3QgdHggPSBvcmlnaW5YLmdldFBpeGVscygneCcpO1xuICAgICAgICBjb25zdCB0eSA9IG9yaWdpblkuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUodHgsIHR5KTtcbiAgICAgICAgY3R4LnRyYW5zZm9ybShkZXQgKiAoZSAqIGkgLSBmICogaCksIGRldCAqIChmICogZyAtIGQgKiBpKSwgZGV0ICogKGMgKiBoIC0gYiAqIGkpLCBkZXQgKiAoYSAqIGkgLSBjICogZyksIGRldCAqIChiICogZiAtIGMgKiBlKSwgZGV0ICogKGMgKiBkIC0gYSAqIGYpKTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSgtdHgsIC10eSk7XG4gICAgfVxuICAgIGFwcGx5VG9Qb2ludChwb2ludCkge1xuICAgICAgICBwb2ludC5hcHBseVRyYW5zZm9ybSh0aGlzLm1hdHJpeCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKF8sIG1hdHJpeCwgdHJhbnNmb3JtT3JpZ2luKXtcbiAgICAgICAgdGhpcy50eXBlID0gJ21hdHJpeCc7XG4gICAgICAgIHRoaXMubWF0cml4ID0gdG9NYXRyaXhWYWx1ZShtYXRyaXgpO1xuICAgICAgICB0aGlzLm9yaWdpblggPSB0cmFuc2Zvcm1PcmlnaW5bMF07XG4gICAgICAgIHRoaXMub3JpZ2luWSA9IHRyYW5zZm9ybU9yaWdpblsxXTtcbiAgICB9XG59XG5cbmNsYXNzIFNrZXcgZXh0ZW5kcyBNYXRyaXgge1xuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBza2V3LCB0cmFuc2Zvcm1PcmlnaW4pe1xuICAgICAgICBzdXBlcihkb2N1bWVudCwgc2tldywgdHJhbnNmb3JtT3JpZ2luKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3NrZXcnO1xuICAgICAgICB0aGlzLmFuZ2xlID0gbmV3IFByb3BlcnR5KGRvY3VtZW50LCAnYW5nbGUnLCBza2V3KTtcbiAgICB9XG59XG5cbmNsYXNzIFNrZXdYIGV4dGVuZHMgU2tldyB7XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIHNrZXcsIHRyYW5zZm9ybU9yaWdpbil7XG4gICAgICAgIHN1cGVyKGRvY3VtZW50LCBza2V3LCB0cmFuc2Zvcm1PcmlnaW4pO1xuICAgICAgICB0aGlzLnR5cGUgPSAnc2tld1gnO1xuICAgICAgICB0aGlzLm1hdHJpeCA9IFtcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgTWF0aC50YW4odGhpcy5hbmdsZS5nZXRSYWRpYW5zKCkpLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwXG4gICAgICAgIF07XG4gICAgfVxufVxuXG5jbGFzcyBTa2V3WSBleHRlbmRzIFNrZXcge1xuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBza2V3LCB0cmFuc2Zvcm1PcmlnaW4pe1xuICAgICAgICBzdXBlcihkb2N1bWVudCwgc2tldywgdHJhbnNmb3JtT3JpZ2luKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3NrZXdZJztcbiAgICAgICAgdGhpcy5tYXRyaXggPSBbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgTWF0aC50YW4odGhpcy5hbmdsZS5nZXRSYWRpYW5zKCkpLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMFxuICAgICAgICBdO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gcGFyc2VUcmFuc2Zvcm1zKHRyYW5zZm9ybSkge1xuICAgIHJldHVybiBjb21wcmVzc1NwYWNlcyh0cmFuc2Zvcm0pLnRyaW0oKS5yZXBsYWNlKC9cXCkoW2EtekEtWl0pL2csICcpICQxJykucmVwbGFjZSgvXFwpKFxccz8sXFxzPykvZywgJykgJykuc3BsaXQoL1xccyg/PVthLXpdKS8pO1xufVxuZnVuY3Rpb24gcGFyc2VUcmFuc2Zvcm0odHJhbnNmb3JtKSB7XG4gICAgY29uc3QgW3R5cGUgPSAnJywgdmFsdWUgPSAnJ10gPSB0cmFuc2Zvcm0uc3BsaXQoJygnKTtcbiAgICByZXR1cm4gW1xuICAgICAgICB0eXBlLnRyaW0oKSxcbiAgICAgICAgdmFsdWUudHJpbSgpLnJlcGxhY2UoJyknLCAnJylcbiAgICBdO1xufVxuY2xhc3MgVHJhbnNmb3JtIHtcbiAgICBzdGF0aWMgZnJvbUVsZW1lbnQoZG9jdW1lbnQsIGVsZW1lbnQpIHtcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtU3R5bGUgPSBlbGVtZW50LmdldFN0eWxlKCd0cmFuc2Zvcm0nLCBmYWxzZSwgdHJ1ZSk7XG4gICAgICAgIGlmICh0cmFuc2Zvcm1TdHlsZS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBjb25zdCBbdHJhbnNmb3JtT3JpZ2luWFByb3BlcnR5LCB0cmFuc2Zvcm1PcmlnaW5ZUHJvcGVydHkgPSB0cmFuc2Zvcm1PcmlnaW5YUHJvcGVydHldID0gZWxlbWVudC5nZXRTdHlsZSgndHJhbnNmb3JtLW9yaWdpbicsIGZhbHNlLCB0cnVlKS5zcGxpdCgpO1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybU9yaWdpblhQcm9wZXJ0eSAmJiB0cmFuc2Zvcm1PcmlnaW5ZUHJvcGVydHkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmFuc2Zvcm1PcmlnaW4gPSBbXG4gICAgICAgICAgICAgICAgICAgIHRyYW5zZm9ybU9yaWdpblhQcm9wZXJ0eSxcbiAgICAgICAgICAgICAgICAgICAgdHJhbnNmb3JtT3JpZ2luWVByb3BlcnR5XG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IFRyYW5zZm9ybShkb2N1bWVudCwgdHJhbnNmb3JtU3R5bGUuZ2V0U3RyaW5nKCksIHRyYW5zZm9ybU9yaWdpbik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGFwcGx5KGN0eCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybXMuZm9yRWFjaCgodHJhbnNmb3JtKT0+dHJhbnNmb3JtLmFwcGx5KGN0eClcbiAgICAgICAgKTtcbiAgICB9XG4gICAgdW5hcHBseShjdHgpIHtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1zLmZvckVhY2goKHRyYW5zZm9ybSk9PnRyYW5zZm9ybS51bmFwcGx5KGN0eClcbiAgICAgICAgKTtcbiAgICB9XG4gICAgLy8gVE9ETzogYXBwbHlUb1BvaW50IHVudXNlZCAuLi4gcmVtb3ZlP1xuICAgIGFwcGx5VG9Qb2ludChwb2ludCkge1xuICAgICAgICB0aGlzLnRyYW5zZm9ybXMuZm9yRWFjaCgodHJhbnNmb3JtKT0+dHJhbnNmb3JtLmFwcGx5VG9Qb2ludChwb2ludClcbiAgICAgICAgKTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIHRyYW5zZm9ybTEsIHRyYW5zZm9ybU9yaWdpbil7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQgPSBkb2N1bWVudDtcbiAgICAgICAgdGhpcy50cmFuc2Zvcm1zID0gW107XG4gICAgICAgIGNvbnN0IGRhdGEgPSBwYXJzZVRyYW5zZm9ybXModHJhbnNmb3JtMSk7XG4gICAgICAgIGRhdGEuZm9yRWFjaCgodHJhbnNmb3JtKT0+e1xuICAgICAgICAgICAgaWYgKHRyYW5zZm9ybSA9PT0gJ25vbmUnKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgW3R5cGUsIHZhbHVlXSA9IHBhcnNlVHJhbnNmb3JtKHRyYW5zZm9ybSk7XG4gICAgICAgICAgICBjb25zdCBUcmFuc2Zvcm1UeXBlID0gVHJhbnNmb3JtLnRyYW5zZm9ybVR5cGVzW3R5cGVdO1xuICAgICAgICAgICAgaWYgKFRyYW5zZm9ybVR5cGUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnRyYW5zZm9ybXMucHVzaChuZXcgVHJhbnNmb3JtVHlwZSh0aGlzLmRvY3VtZW50LCB2YWx1ZSwgdHJhbnNmb3JtT3JpZ2luKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblRyYW5zZm9ybS50cmFuc2Zvcm1UeXBlcyA9IHtcbiAgICB0cmFuc2xhdGU6IFRyYW5zbGF0ZSxcbiAgICByb3RhdGU6IFJvdGF0ZSxcbiAgICBzY2FsZTogU2NhbGUsXG4gICAgbWF0cml4OiBNYXRyaXgsXG4gICAgc2tld1g6IFNrZXdYLFxuICAgIHNrZXdZOiBTa2V3WVxufTtcblxuY2xhc3MgRWxlbWVudCB7XG4gICAgZ2V0QXR0cmlidXRlKG5hbWUpIHtcbiAgICAgICAgbGV0IGNyZWF0ZUlmTm90RXhpc3RzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgICAgICAgY29uc3QgYXR0ciA9IHRoaXMuYXR0cmlidXRlc1tuYW1lXTtcbiAgICAgICAgaWYgKCFhdHRyICYmIGNyZWF0ZUlmTm90RXhpc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBhdHRyID0gbmV3IFByb3BlcnR5KHRoaXMuZG9jdW1lbnQsIG5hbWUsICcnKTtcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1tuYW1lXSA9IGF0dHI7XG4gICAgICAgICAgICByZXR1cm4gYXR0cjtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXR0ciB8fCBQcm9wZXJ0eS5lbXB0eSh0aGlzLmRvY3VtZW50KTtcbiAgICB9XG4gICAgZ2V0SHJlZkF0dHJpYnV0ZSgpIHtcbiAgICAgICAgbGV0IGhyZWY7XG4gICAgICAgIGZvcihjb25zdCBrZXkgaW4gdGhpcy5hdHRyaWJ1dGVzKXtcbiAgICAgICAgICAgIGlmIChrZXkgPT09ICdocmVmJyB8fCBrZXkuZW5kc1dpdGgoJzpocmVmJykpIHtcbiAgICAgICAgICAgICAgICBocmVmID0gdGhpcy5hdHRyaWJ1dGVzW2tleV07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGhyZWYgfHwgUHJvcGVydHkuZW1wdHkodGhpcy5kb2N1bWVudCk7XG4gICAgfVxuICAgIGdldFN0eWxlKG5hbWUpIHtcbiAgICAgICAgbGV0IGNyZWF0ZUlmTm90RXhpc3RzID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMV0gOiBmYWxzZSwgc2tpcEFuY2VzdG9ycyA9IGFyZ3VtZW50cy5sZW5ndGggPiAyICYmIGFyZ3VtZW50c1syXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzJdIDogZmFsc2U7XG4gICAgICAgIGNvbnN0IHN0eWxlID0gdGhpcy5zdHlsZXNbbmFtZV07XG4gICAgICAgIGlmIChzdHlsZSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0eWxlO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGF0dHIgPSB0aGlzLmdldEF0dHJpYnV0ZShuYW1lKTtcbiAgICAgICAgaWYgKGF0dHIuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgdGhpcy5zdHlsZXNbbmFtZV0gPSBhdHRyIC8vIG1vdmUgdXAgdG8gbWUgdG8gY2FjaGVcbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIHJldHVybiBhdHRyO1xuICAgICAgICB9XG4gICAgICAgIGlmICghc2tpcEFuY2VzdG9ycykge1xuICAgICAgICAgICAgY29uc3QgeyBwYXJlbnQgIH0gPSB0aGlzO1xuICAgICAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcmVudFN0eWxlID0gcGFyZW50LmdldFN0eWxlKG5hbWUpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJlbnRTdHlsZS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJlbnRTdHlsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGNyZWF0ZUlmTm90RXhpc3RzKSB7XG4gICAgICAgICAgICBjb25zdCBzdHlsZSA9IG5ldyBQcm9wZXJ0eSh0aGlzLmRvY3VtZW50LCBuYW1lLCAnJyk7XG4gICAgICAgICAgICB0aGlzLnN0eWxlc1tuYW1lXSA9IHN0eWxlO1xuICAgICAgICAgICAgcmV0dXJuIHN0eWxlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBQcm9wZXJ0eS5lbXB0eSh0aGlzLmRvY3VtZW50KTtcbiAgICB9XG4gICAgcmVuZGVyKGN0eCkge1xuICAgICAgICAvLyBkb24ndCByZW5kZXIgZGlzcGxheT1ub25lXG4gICAgICAgIC8vIGRvbid0IHJlbmRlciB2aXNpYmlsaXR5PWhpZGRlblxuICAgICAgICBpZiAodGhpcy5nZXRTdHlsZSgnZGlzcGxheScpLmdldFN0cmluZygpID09PSAnbm9uZScgfHwgdGhpcy5nZXRTdHlsZSgndmlzaWJpbGl0eScpLmdldFN0cmluZygpID09PSAnaGlkZGVuJykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGlmICh0aGlzLmdldFN0eWxlKCdtYXNrJykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgY29uc3QgbWFzayA9IHRoaXMuZ2V0U3R5bGUoJ21hc2snKS5nZXREZWZpbml0aW9uKCk7XG4gICAgICAgICAgICBpZiAobWFzaykge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlFZmZlY3RzKGN0eCk7XG4gICAgICAgICAgICAgICAgbWFzay5hcHBseShjdHgsIHRoaXMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHRoaXMuZ2V0U3R5bGUoJ2ZpbHRlcicpLmdldFZhbHVlKCdub25lJykgIT09ICdub25lJykge1xuICAgICAgICAgICAgY29uc3QgZmlsdGVyID0gdGhpcy5nZXRTdHlsZSgnZmlsdGVyJykuZ2V0RGVmaW5pdGlvbigpO1xuICAgICAgICAgICAgaWYgKGZpbHRlcikge1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwbHlFZmZlY3RzKGN0eCk7XG4gICAgICAgICAgICAgICAgZmlsdGVyLmFwcGx5KGN0eCwgdGhpcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnNldENvbnRleHQoY3R4KTtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyQ2hpbGRyZW4oY3R4KTtcbiAgICAgICAgICAgIHRoaXMuY2xlYXJDb250ZXh0KGN0eCk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICB9XG4gICAgc2V0Q29udGV4dChfKSB7XG4gICAgLy8gTk8gUkVOREVSXG4gICAgfVxuICAgIGFwcGx5RWZmZWN0cyhjdHgpIHtcbiAgICAgICAgLy8gdHJhbnNmb3JtXG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybSA9IFRyYW5zZm9ybS5mcm9tRWxlbWVudCh0aGlzLmRvY3VtZW50LCB0aGlzKTtcbiAgICAgICAgaWYgKHRyYW5zZm9ybSkge1xuICAgICAgICAgICAgdHJhbnNmb3JtLmFwcGx5KGN0eCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gY2xpcFxuICAgICAgICBjb25zdCBjbGlwUGF0aFN0eWxlUHJvcCA9IHRoaXMuZ2V0U3R5bGUoJ2NsaXAtcGF0aCcsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgaWYgKGNsaXBQYXRoU3R5bGVQcm9wLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGNsaXAgPSBjbGlwUGF0aFN0eWxlUHJvcC5nZXREZWZpbml0aW9uKCk7XG4gICAgICAgICAgICBpZiAoY2xpcCkge1xuICAgICAgICAgICAgICAgIGNsaXAuYXBwbHkoY3R4KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjbGVhckNvbnRleHQoXykge1xuICAgIC8vIE5PIFJFTkRFUlxuICAgIH1cbiAgICByZW5kZXJDaGlsZHJlbihjdHgpIHtcbiAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCk9PntcbiAgICAgICAgICAgIGNoaWxkLnJlbmRlcihjdHgpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgYWRkQ2hpbGQoY2hpbGROb2RlKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gY2hpbGROb2RlIGluc3RhbmNlb2YgRWxlbWVudCA/IGNoaWxkTm9kZSA6IHRoaXMuZG9jdW1lbnQuY3JlYXRlRWxlbWVudChjaGlsZE5vZGUpO1xuICAgICAgICBjaGlsZC5wYXJlbnQgPSB0aGlzO1xuICAgICAgICBpZiAoIUVsZW1lbnQuaWdub3JlQ2hpbGRUeXBlcy5pbmNsdWRlcyhjaGlsZC50eXBlKSkge1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5wdXNoKGNoaWxkKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBtYXRjaGVzU2VsZWN0b3Ioc2VsZWN0b3IpIHtcbiAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgY29uc3QgeyBub2RlICB9ID0gdGhpcztcbiAgICAgICAgaWYgKHR5cGVvZiBub2RlLm1hdGNoZXMgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBub2RlLm1hdGNoZXMoc2VsZWN0b3IpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHN0eWxlQ2xhc3NlcyA9IChyZWYgPSBub2RlLmdldEF0dHJpYnV0ZSkgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWYuY2FsbChub2RlLCAnY2xhc3MnKTtcbiAgICAgICAgaWYgKCFzdHlsZUNsYXNzZXMgfHwgc3R5bGVDbGFzc2VzID09PSAnJykge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBzdHlsZUNsYXNzZXMuc3BsaXQoJyAnKS5zb21lKChzdHlsZUNsYXNzKT0+XCIuXCIuY29uY2F0KHN0eWxlQ2xhc3MpID09PSBzZWxlY3RvclxuICAgICAgICApO1xuICAgIH1cbiAgICBhZGRTdHlsZXNGcm9tU3R5bGVEZWZpbml0aW9uKCkge1xuICAgICAgICBjb25zdCB7IHN0eWxlcyAsIHN0eWxlc1NwZWNpZmljaXR5ICB9ID0gdGhpcy5kb2N1bWVudDtcbiAgICAgICAgbGV0IHN0eWxlUHJvcDtcbiAgICAgICAgZm9yKGNvbnN0IHNlbGVjdG9yIGluIHN0eWxlcyl7XG4gICAgICAgICAgICBpZiAoIXNlbGVjdG9yLnN0YXJ0c1dpdGgoJ0AnKSAmJiB0aGlzLm1hdGNoZXNTZWxlY3RvcihzZWxlY3RvcikpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBzdHlsZSA9IHN0eWxlc1tzZWxlY3Rvcl07XG4gICAgICAgICAgICAgICAgY29uc3Qgc3BlY2lmaWNpdHkgPSBzdHlsZXNTcGVjaWZpY2l0eVtzZWxlY3Rvcl07XG4gICAgICAgICAgICAgICAgaWYgKHN0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGZvcihjb25zdCBuYW1lIGluIHN0eWxlKXtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxldCBleGlzdGluZ1NwZWNpZmljaXR5ID0gdGhpcy5zdHlsZXNTcGVjaWZpY2l0eVtuYW1lXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZXhpc3RpbmdTcGVjaWZpY2l0eSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleGlzdGluZ1NwZWNpZmljaXR5ID0gJzAwMCc7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoc3BlY2lmaWNpdHkgJiYgc3BlY2lmaWNpdHkgPj0gZXhpc3RpbmdTcGVjaWZpY2l0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHN0eWxlUHJvcCA9IHN0eWxlW25hbWVdO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzdHlsZVByb3ApIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHlsZXNbbmFtZV0gPSBzdHlsZVByb3A7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuc3R5bGVzU3BlY2lmaWNpdHlbbmFtZV0gPSBzcGVjaWZpY2l0eTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZW1vdmVTdHlsZXMoZWxlbWVudCwgaWdub3JlU3R5bGVzKSB7XG4gICAgICAgIGNvbnN0IHRvUmVzdG9yZTEgPSBpZ25vcmVTdHlsZXMucmVkdWNlKCh0b1Jlc3RvcmUsIG5hbWUpPT57XG4gICAgICAgICAgICBjb25zdCBzdHlsZVByb3AgPSBlbGVtZW50LmdldFN0eWxlKG5hbWUpO1xuICAgICAgICAgICAgaWYgKCFzdHlsZVByb3AuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0b1Jlc3RvcmU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB2YWx1ZSA9IHN0eWxlUHJvcC5nZXRTdHJpbmcoKTtcbiAgICAgICAgICAgIHN0eWxlUHJvcC5zZXRWYWx1ZSgnJyk7XG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIC4uLnRvUmVzdG9yZSxcbiAgICAgICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgICAgIG5hbWUsXG4gICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfSwgW10pO1xuICAgICAgICByZXR1cm4gdG9SZXN0b3JlMTtcbiAgICB9XG4gICAgcmVzdG9yZVN0eWxlcyhlbGVtZW50LCBzdHlsZXMpIHtcbiAgICAgICAgc3R5bGVzLmZvckVhY2goKHBhcmFtKT0+e1xuICAgICAgICAgICAgbGV0IFtuYW1lLCB2YWx1ZV0gPSBwYXJhbTtcbiAgICAgICAgICAgIGVsZW1lbnQuZ2V0U3R5bGUobmFtZSwgdHJ1ZSkuc2V0VmFsdWUodmFsdWUpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgaXNGaXJzdENoaWxkKCkge1xuICAgICAgICB2YXIgcmVmO1xuICAgICAgICByZXR1cm4gKChyZWYgPSB0aGlzLnBhcmVudCkgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWYuY2hpbGRyZW4uaW5kZXhPZih0aGlzKSkgPT09IDA7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzID0gZmFsc2Upe1xuICAgICAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQ7XG4gICAgICAgIHRoaXMubm9kZSA9IG5vZGU7XG4gICAgICAgIHRoaXMuY2FwdHVyZVRleHROb2RlcyA9IGNhcHR1cmVUZXh0Tm9kZXM7XG4gICAgICAgIHRoaXMudHlwZSA9ICcnO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXMgPSB7fTtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSB7fTtcbiAgICAgICAgdGhpcy5zdHlsZXNTcGVjaWZpY2l0eSA9IHt9O1xuICAgICAgICB0aGlzLmFuaW1hdGlvbkZyb3plbiA9IGZhbHNlO1xuICAgICAgICB0aGlzLmFuaW1hdGlvbkZyb3plblZhbHVlID0gJyc7XG4gICAgICAgIHRoaXMucGFyZW50ID0gbnVsbDtcbiAgICAgICAgdGhpcy5jaGlsZHJlbiA9IFtdO1xuICAgICAgICBpZiAoIW5vZGUgfHwgbm9kZS5ub2RlVHlwZSAhPT0gMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGFkZCBhdHRyaWJ1dGVzXG4gICAgICAgIEFycmF5LmZyb20obm9kZS5hdHRyaWJ1dGVzKS5mb3JFYWNoKChhdHRyaWJ1dGUpPT57XG4gICAgICAgICAgICBjb25zdCBub2RlTmFtZSA9IG5vcm1hbGl6ZUF0dHJpYnV0ZU5hbWUoYXR0cmlidXRlLm5vZGVOYW1lKTtcbiAgICAgICAgICAgIHRoaXMuYXR0cmlidXRlc1tub2RlTmFtZV0gPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsIG5vZGVOYW1lLCBhdHRyaWJ1dGUudmFsdWUpO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5hZGRTdHlsZXNGcm9tU3R5bGVEZWZpbml0aW9uKCk7XG4gICAgICAgIC8vIGFkZCBpbmxpbmUgc3R5bGVzXG4gICAgICAgIGlmICh0aGlzLmdldEF0dHJpYnV0ZSgnc3R5bGUnKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBjb25zdCBzdHlsZXMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnc3R5bGUnKS5nZXRTdHJpbmcoKS5zcGxpdCgnOycpLm1hcCgoXyk9Pl8udHJpbSgpXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgc3R5bGVzLmZvckVhY2goKHN0eWxlKT0+e1xuICAgICAgICAgICAgICAgIGlmICghc3R5bGUpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBbbmFtZSwgdmFsdWVdID0gc3R5bGUuc3BsaXQoJzonKS5tYXAoKF8pPT5fLnRyaW0oKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgaWYgKG5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdHlsZXNbbmFtZV0gPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsIG5hbWUsIHZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGRlZmluaXRpb25zICB9ID0gZG9jdW1lbnQ7XG4gICAgICAgIGNvbnN0IGlkID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2lkJyk7XG4gICAgICAgIC8vIGFkZCBpZFxuICAgICAgICBpZiAoaWQuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgaWYgKCFkZWZpbml0aW9uc1tpZC5nZXRTdHJpbmcoKV0pIHtcbiAgICAgICAgICAgICAgICBkZWZpbml0aW9uc1tpZC5nZXRTdHJpbmcoKV0gPSB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIEFycmF5LmZyb20obm9kZS5jaGlsZE5vZGVzKS5mb3JFYWNoKChjaGlsZE5vZGUpPT57XG4gICAgICAgICAgICBpZiAoY2hpbGROb2RlLm5vZGVUeXBlID09PSAxKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRDaGlsZChjaGlsZE5vZGUpIC8vIEVMRU1FTlRfTk9ERVxuICAgICAgICAgICAgICAgIDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2FwdHVyZVRleHROb2RlcyAmJiAoY2hpbGROb2RlLm5vZGVUeXBlID09PSAzIHx8IGNoaWxkTm9kZS5ub2RlVHlwZSA9PT0gNCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKGNoaWxkTm9kZSk7XG4gICAgICAgICAgICAgICAgaWYgKHRleHROb2RlLmdldFRleHQoKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkQ2hpbGQodGV4dE5vZGUpIC8vIFRFWFRfTk9ERVxuICAgICAgICAgICAgICAgICAgICA7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5FbGVtZW50Lmlnbm9yZUNoaWxkVHlwZXMgPSBbXG4gICAgJ3RpdGxlJ1xuXTtcblxuY2xhc3MgVW5rbm93bkVsZW1lbnQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyl7XG4gICAgICAgIHN1cGVyKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHdyYXBGb250RmFtaWx5KGZvbnRGYW1pbHkpIHtcbiAgICBjb25zdCB0cmltbWVkID0gZm9udEZhbWlseS50cmltKCk7XG4gICAgcmV0dXJuIC9eKCd8XCIpLy50ZXN0KHRyaW1tZWQpID8gdHJpbW1lZCA6IFwiXFxcIlwiLmNvbmNhdCh0cmltbWVkLCBcIlxcXCJcIik7XG59XG5mdW5jdGlvbiBwcmVwYXJlRm9udEZhbWlseShmb250RmFtaWx5KSB7XG4gICAgcmV0dXJuIHR5cGVvZiBwcm9jZXNzID09PSAndW5kZWZpbmVkJyA/IGZvbnRGYW1pbHkgOiBmb250RmFtaWx5LnRyaW0oKS5zcGxpdCgnLCcpLm1hcCh3cmFwRm9udEZhbWlseSkuam9pbignLCcpO1xufVxuLyoqXG4gKiBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9DU1MvZm9udC1zdHlsZVxuICogQHBhcmFtIGZvbnRTdHlsZVxuICogQHJldHVybnMgQ1NTIGZvbnQgc3R5bGUuXG4gKi8gZnVuY3Rpb24gcHJlcGFyZUZvbnRTdHlsZShmb250U3R5bGUpIHtcbiAgICBpZiAoIWZvbnRTdHlsZSkge1xuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNvbnN0IHRhcmdldEZvbnRTdHlsZSA9IGZvbnRTdHlsZS50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBzd2l0Y2godGFyZ2V0Rm9udFN0eWxlKXtcbiAgICAgICAgY2FzZSAnbm9ybWFsJzpcbiAgICAgICAgY2FzZSAnaXRhbGljJzpcbiAgICAgICAgY2FzZSAnb2JsaXF1ZSc6XG4gICAgICAgIGNhc2UgJ2luaGVyaXQnOlxuICAgICAgICBjYXNlICdpbml0aWFsJzpcbiAgICAgICAgY2FzZSAndW5zZXQnOlxuICAgICAgICAgICAgcmV0dXJuIHRhcmdldEZvbnRTdHlsZTtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmICgvXm9ibGlxdWVcXHMrKC18KVxcZCtkZWckLy50ZXN0KHRhcmdldEZvbnRTdHlsZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0Rm9udFN0eWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbn1cbi8qKlxuICogaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZW4tVVMvZG9jcy9XZWIvQ1NTL2ZvbnQtd2VpZ2h0XG4gKiBAcGFyYW0gZm9udFdlaWdodFxuICogQHJldHVybnMgQ1NTIGZvbnQgd2VpZ2h0LlxuICovIGZ1bmN0aW9uIHByZXBhcmVGb250V2VpZ2h0KGZvbnRXZWlnaHQpIHtcbiAgICBpZiAoIWZvbnRXZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBjb25zdCB0YXJnZXRGb250V2VpZ2h0ID0gZm9udFdlaWdodC50cmltKCkudG9Mb3dlckNhc2UoKTtcbiAgICBzd2l0Y2godGFyZ2V0Rm9udFdlaWdodCl7XG4gICAgICAgIGNhc2UgJ25vcm1hbCc6XG4gICAgICAgIGNhc2UgJ2JvbGQnOlxuICAgICAgICBjYXNlICdsaWdodGVyJzpcbiAgICAgICAgY2FzZSAnYm9sZGVyJzpcbiAgICAgICAgY2FzZSAnaW5oZXJpdCc6XG4gICAgICAgIGNhc2UgJ2luaXRpYWwnOlxuICAgICAgICBjYXNlICd1bnNldCc6XG4gICAgICAgICAgICByZXR1cm4gdGFyZ2V0Rm9udFdlaWdodDtcbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgIGlmICgvXltcXGQuXSskLy50ZXN0KHRhcmdldEZvbnRXZWlnaHQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldEZvbnRXZWlnaHQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxufVxuY2xhc3MgRm9udCB7XG4gICAgc3RhdGljIHBhcnNlKCkge1xuICAgICAgICBsZXQgZm9udCA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzBdIDogJycsIGluaGVyaXQgPSBhcmd1bWVudHMubGVuZ3RoID4gMSA/IGFyZ3VtZW50c1sxXSA6IHZvaWQgMDtcbiAgICAgICAgbGV0IGZvbnRTdHlsZSA9ICcnO1xuICAgICAgICBsZXQgZm9udFZhcmlhbnQgPSAnJztcbiAgICAgICAgbGV0IGZvbnRXZWlnaHQgPSAnJztcbiAgICAgICAgbGV0IGZvbnRTaXplID0gJyc7XG4gICAgICAgIGxldCBmb250RmFtaWx5ID0gJyc7XG4gICAgICAgIGNvbnN0IHBhcnRzID0gY29tcHJlc3NTcGFjZXMoZm9udCkudHJpbSgpLnNwbGl0KCcgJyk7XG4gICAgICAgIGNvbnN0IHNldCA9IHtcbiAgICAgICAgICAgIGZvbnRTaXplOiBmYWxzZSxcbiAgICAgICAgICAgIGZvbnRTdHlsZTogZmFsc2UsXG4gICAgICAgICAgICBmb250V2VpZ2h0OiBmYWxzZSxcbiAgICAgICAgICAgIGZvbnRWYXJpYW50OiBmYWxzZVxuICAgICAgICB9O1xuICAgICAgICBwYXJ0cy5mb3JFYWNoKChwYXJ0KT0+e1xuICAgICAgICAgICAgc3dpdGNoKHRydWUpe1xuICAgICAgICAgICAgICAgIGNhc2UgIXNldC5mb250U3R5bGUgJiYgRm9udC5zdHlsZXMuaW5jbHVkZXMocGFydCk6XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJ0ICE9PSAnaW5oZXJpdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvbnRTdHlsZSA9IHBhcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2V0LmZvbnRTdHlsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIXNldC5mb250VmFyaWFudCAmJiBGb250LnZhcmlhbnRzLmluY2x1ZGVzKHBhcnQpOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFydCAhPT0gJ2luaGVyaXQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb250VmFyaWFudCA9IHBhcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2V0LmZvbnRTdHlsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNldC5mb250VmFyaWFudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgIXNldC5mb250V2VpZ2h0ICYmIEZvbnQud2VpZ2h0cy5pbmNsdWRlcyhwYXJ0KTpcbiAgICAgICAgICAgICAgICAgICAgaWYgKHBhcnQgIT09ICdpbmhlcml0Jykge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9udFdlaWdodCA9IHBhcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgc2V0LmZvbnRTdHlsZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNldC5mb250VmFyaWFudCA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIHNldC5mb250V2VpZ2h0ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAhc2V0LmZvbnRTaXplOlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFydCAhPT0gJ2luaGVyaXQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb250U2l6ZSA9IHBhcnQuc3BsaXQoJy8nKVswXSB8fCAnJztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBzZXQuZm9udFN0eWxlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2V0LmZvbnRWYXJpYW50ID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgc2V0LmZvbnRXZWlnaHQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBzZXQuZm9udFNpemUgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICBpZiAocGFydCAhPT0gJ2luaGVyaXQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb250RmFtaWx5ICs9IHBhcnQ7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBuZXcgRm9udChmb250U3R5bGUsIGZvbnRWYXJpYW50LCBmb250V2VpZ2h0LCBmb250U2l6ZSwgZm9udEZhbWlseSwgaW5oZXJpdCk7XG4gICAgfVxuICAgIHRvU3RyaW5nKCkge1xuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgcHJlcGFyZUZvbnRTdHlsZSh0aGlzLmZvbnRTdHlsZSksXG4gICAgICAgICAgICB0aGlzLmZvbnRWYXJpYW50LFxuICAgICAgICAgICAgcHJlcGFyZUZvbnRXZWlnaHQodGhpcy5mb250V2VpZ2h0KSxcbiAgICAgICAgICAgIHRoaXMuZm9udFNpemUsXG4gICAgICAgICAgICAvLyBXcmFwIGZvbnRGYW1pbHkgb25seSBvbiBub2RlanMgYW5kIG9ubHkgZm9yIGNhbnZhcy5jdHhcbiAgICAgICAgICAgIHByZXBhcmVGb250RmFtaWx5KHRoaXMuZm9udEZhbWlseSlcbiAgICAgICAgXS5qb2luKCcgJykudHJpbSgpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihmb250U3R5bGUsIGZvbnRWYXJpYW50LCBmb250V2VpZ2h0LCBmb250U2l6ZSwgZm9udEZhbWlseSwgaW5oZXJpdCl7XG4gICAgICAgIGNvbnN0IGluaGVyaXRGb250ID0gaW5oZXJpdCA/IHR5cGVvZiBpbmhlcml0ID09PSAnc3RyaW5nJyA/IEZvbnQucGFyc2UoaW5oZXJpdCkgOiBpbmhlcml0IDoge307XG4gICAgICAgIHRoaXMuZm9udEZhbWlseSA9IGZvbnRGYW1pbHkgfHwgaW5oZXJpdEZvbnQuZm9udEZhbWlseTtcbiAgICAgICAgdGhpcy5mb250U2l6ZSA9IGZvbnRTaXplIHx8IGluaGVyaXRGb250LmZvbnRTaXplO1xuICAgICAgICB0aGlzLmZvbnRTdHlsZSA9IGZvbnRTdHlsZSB8fCBpbmhlcml0Rm9udC5mb250U3R5bGU7XG4gICAgICAgIHRoaXMuZm9udFdlaWdodCA9IGZvbnRXZWlnaHQgfHwgaW5oZXJpdEZvbnQuZm9udFdlaWdodDtcbiAgICAgICAgdGhpcy5mb250VmFyaWFudCA9IGZvbnRWYXJpYW50IHx8IGluaGVyaXRGb250LmZvbnRWYXJpYW50O1xuICAgIH1cbn1cbkZvbnQuc3R5bGVzID0gJ25vcm1hbHxpdGFsaWN8b2JsaXF1ZXxpbmhlcml0JztcbkZvbnQudmFyaWFudHMgPSAnbm9ybWFsfHNtYWxsLWNhcHN8aW5oZXJpdCc7XG5Gb250LndlaWdodHMgPSAnbm9ybWFsfGJvbGR8Ym9sZGVyfGxpZ2h0ZXJ8MTAwfDIwMHwzMDB8NDAwfDUwMHw2MDB8NzAwfDgwMHw5MDB8aW5oZXJpdCc7XG5cbmNsYXNzIEJvdW5kaW5nQm94IHtcbiAgICBnZXQgeCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMueDE7XG4gICAgfVxuICAgIGdldCB5KCkge1xuICAgICAgICByZXR1cm4gdGhpcy55MTtcbiAgICB9XG4gICAgZ2V0IHdpZHRoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy54MiAtIHRoaXMueDE7XG4gICAgfVxuICAgIGdldCBoZWlnaHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnkyIC0gdGhpcy55MTtcbiAgICB9XG4gICAgYWRkUG9pbnQoeCwgeSkge1xuICAgICAgICBpZiAodHlwZW9mIHggIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBpZiAoaXNOYU4odGhpcy54MSkgfHwgaXNOYU4odGhpcy54MikpIHtcbiAgICAgICAgICAgICAgICB0aGlzLngxID0geDtcbiAgICAgICAgICAgICAgICB0aGlzLngyID0geDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh4IDwgdGhpcy54MSkge1xuICAgICAgICAgICAgICAgIHRoaXMueDEgPSB4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHggPiB0aGlzLngyKSB7XG4gICAgICAgICAgICAgICAgdGhpcy54MiA9IHg7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB5ICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgaWYgKGlzTmFOKHRoaXMueTEpIHx8IGlzTmFOKHRoaXMueTIpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy55MSA9IHk7XG4gICAgICAgICAgICAgICAgdGhpcy55MiA9IHk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoeSA8IHRoaXMueTEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnkxID0geTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh5ID4gdGhpcy55Mikge1xuICAgICAgICAgICAgICAgIHRoaXMueTIgPSB5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGFkZFgoeCkge1xuICAgICAgICB0aGlzLmFkZFBvaW50KHgsIDApO1xuICAgIH1cbiAgICBhZGRZKHkpIHtcbiAgICAgICAgdGhpcy5hZGRQb2ludCgwLCB5KTtcbiAgICB9XG4gICAgYWRkQm91bmRpbmdCb3goYm91bmRpbmdCb3gpIHtcbiAgICAgICAgaWYgKCFib3VuZGluZ0JveCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHsgeDEgLCB5MSAsIHgyICwgeTIgIH0gPSBib3VuZGluZ0JveDtcbiAgICAgICAgdGhpcy5hZGRQb2ludCh4MSwgeTEpO1xuICAgICAgICB0aGlzLmFkZFBvaW50KHgyLCB5Mik7XG4gICAgfVxuICAgIHN1bUN1YmljKHQsIHAwLCBwMSwgcDIsIHAzKSB7XG4gICAgICAgIHJldHVybiBNYXRoLnBvdygxIC0gdCwgMykgKiBwMCArIDMgKiBNYXRoLnBvdygxIC0gdCwgMikgKiB0ICogcDEgKyAzICogKDEgLSB0KSAqIE1hdGgucG93KHQsIDIpICogcDIgKyBNYXRoLnBvdyh0LCAzKSAqIHAzO1xuICAgIH1cbiAgICBiZXppZXJDdXJ2ZUFkZChmb3JYLCBwMCwgcDEsIHAyLCBwMykge1xuICAgICAgICBjb25zdCBiID0gNiAqIHAwIC0gMTIgKiBwMSArIDYgKiBwMjtcbiAgICAgICAgY29uc3QgYSA9IC0zICogcDAgKyA5ICogcDEgLSA5ICogcDIgKyAzICogcDM7XG4gICAgICAgIGNvbnN0IGMgPSAzICogcDEgLSAzICogcDA7XG4gICAgICAgIGlmIChhID09PSAwKSB7XG4gICAgICAgICAgICBpZiAoYiA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHQgPSAtYyAvIGI7XG4gICAgICAgICAgICBpZiAoMCA8IHQgJiYgdCA8IDEpIHtcbiAgICAgICAgICAgICAgICBpZiAoZm9yWCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFkZFgodGhpcy5zdW1DdWJpYyh0LCBwMCwgcDEsIHAyLCBwMykpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWRkWSh0aGlzLnN1bUN1YmljKHQsIHAwLCBwMSwgcDIsIHAzKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGIyYWMgPSBNYXRoLnBvdyhiLCAyKSAtIDQgKiBjICogYTtcbiAgICAgICAgaWYgKGIyYWMgPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdDEgPSAoLWIgKyBNYXRoLnNxcnQoYjJhYykpIC8gKDIgKiBhKTtcbiAgICAgICAgaWYgKDAgPCB0MSAmJiB0MSA8IDEpIHtcbiAgICAgICAgICAgIGlmIChmb3JYKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5hZGRYKHRoaXMuc3VtQ3ViaWModDEsIHAwLCBwMSwgcDIsIHAzKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkWSh0aGlzLnN1bUN1YmljKHQxLCBwMCwgcDEsIHAyLCBwMykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHQyID0gKC1iIC0gTWF0aC5zcXJ0KGIyYWMpKSAvICgyICogYSk7XG4gICAgICAgIGlmICgwIDwgdDIgJiYgdDIgPCAxKSB7XG4gICAgICAgICAgICBpZiAoZm9yWCkge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkWCh0aGlzLnN1bUN1YmljKHQyLCBwMCwgcDEsIHAyLCBwMykpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFkodGhpcy5zdW1DdWJpYyh0MiwgcDAsIHAxLCBwMiwgcDMpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICAvLyBmcm9tIGh0dHA6Ly9ibG9nLmhhY2tlcnMtY2FmZS5uZXQvMjAwOS8wNi9ob3ctdG8tY2FsY3VsYXRlLWJlemllci1jdXJ2ZXMtYm91bmRpbmcuaHRtbFxuICAgIGFkZEJlemllckN1cnZlKHAweCwgcDB5LCBwMXgsIHAxeSwgcDJ4LCBwMnksIHAzeCwgcDN5KSB7XG4gICAgICAgIHRoaXMuYWRkUG9pbnQocDB4LCBwMHkpO1xuICAgICAgICB0aGlzLmFkZFBvaW50KHAzeCwgcDN5KTtcbiAgICAgICAgdGhpcy5iZXppZXJDdXJ2ZUFkZCh0cnVlLCBwMHgsIHAxeCwgcDJ4LCBwM3gpO1xuICAgICAgICB0aGlzLmJlemllckN1cnZlQWRkKGZhbHNlLCBwMHksIHAxeSwgcDJ5LCBwM3kpO1xuICAgIH1cbiAgICBhZGRRdWFkcmF0aWNDdXJ2ZShwMHgsIHAweSwgcDF4LCBwMXksIHAyeCwgcDJ5KSB7XG4gICAgICAgIGNvbnN0IGNwMXggPSBwMHggKyAyIC8gMyAqIChwMXggLSBwMHgpIC8vIENQMSA9IFFQMCArIDIvMyAqKFFQMS1RUDApXG4gICAgICAgIDtcbiAgICAgICAgY29uc3QgY3AxeSA9IHAweSArIDIgLyAzICogKHAxeSAtIHAweSkgLy8gQ1AxID0gUVAwICsgMi8zICooUVAxLVFQMClcbiAgICAgICAgO1xuICAgICAgICBjb25zdCBjcDJ4ID0gY3AxeCArIDEgLyAzICogKHAyeCAtIHAweCkgLy8gQ1AyID0gQ1AxICsgMS8zICooUVAyLVFQMClcbiAgICAgICAgO1xuICAgICAgICBjb25zdCBjcDJ5ID0gY3AxeSArIDEgLyAzICogKHAyeSAtIHAweSkgLy8gQ1AyID0gQ1AxICsgMS8zICooUVAyLVFQMClcbiAgICAgICAgO1xuICAgICAgICB0aGlzLmFkZEJlemllckN1cnZlKHAweCwgcDB5LCBjcDF4LCBjcDJ4LCBjcDF5LCBjcDJ5LCBwMngsIHAyeSk7XG4gICAgfVxuICAgIGlzUG9pbnRJbkJveCh4LCB5KSB7XG4gICAgICAgIGNvbnN0IHsgeDEgLCB5MSAsIHgyICwgeTIgIH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4geDEgPD0geCAmJiB4IDw9IHgyICYmIHkxIDw9IHkgJiYgeSA8PSB5MjtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoeDEgPSBOdW1iZXIuTmFOLCB5MSA9IE51bWJlci5OYU4sIHgyID0gTnVtYmVyLk5hTiwgeTIgPSBOdW1iZXIuTmFOKXtcbiAgICAgICAgdGhpcy54MSA9IHgxO1xuICAgICAgICB0aGlzLnkxID0geTE7XG4gICAgICAgIHRoaXMueDIgPSB4MjtcbiAgICAgICAgdGhpcy55MiA9IHkyO1xuICAgICAgICB0aGlzLmFkZFBvaW50KHgxLCB5MSk7XG4gICAgICAgIHRoaXMuYWRkUG9pbnQoeDIsIHkyKTtcbiAgICB9XG59XG5cbmNsYXNzIFJlbmRlcmVkRWxlbWVudCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNhbGN1bGF0ZU9wYWNpdHkoKSB7XG4gICAgICAgIGxldCBvcGFjaXR5ID0gMTtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzLCBjb25zaXN0ZW50LXRoaXNcbiAgICAgICAgbGV0IGVsZW1lbnQgPSB0aGlzO1xuICAgICAgICB3aGlsZShlbGVtZW50KXtcbiAgICAgICAgICAgIGNvbnN0IG9wYWNpdHlTdHlsZSA9IGVsZW1lbnQuZ2V0U3R5bGUoJ29wYWNpdHknLCBmYWxzZSwgdHJ1ZSkgLy8gbm8gYW5jZXN0b3JzIG9uIHN0eWxlIGNhbGxcbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIGlmIChvcGFjaXR5U3R5bGUuaGFzVmFsdWUodHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICBvcGFjaXR5ICo9IG9wYWNpdHlTdHlsZS5nZXROdW1iZXIoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsZW1lbnQgPSBlbGVtZW50LnBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3BhY2l0eTtcbiAgICB9XG4gICAgc2V0Q29udGV4dChjdHgpIHtcbiAgICAgICAgbGV0IGZyb21NZWFzdXJlID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMV0gOiBmYWxzZTtcbiAgICAgICAgaWYgKCFmcm9tTWVhc3VyZSkge1xuICAgICAgICAgICAgLy8gZmlsbFxuICAgICAgICAgICAgY29uc3QgZmlsbFN0eWxlUHJvcCA9IHRoaXMuZ2V0U3R5bGUoJ2ZpbGwnKTtcbiAgICAgICAgICAgIGNvbnN0IGZpbGxPcGFjaXR5U3R5bGVQcm9wID0gdGhpcy5nZXRTdHlsZSgnZmlsbC1vcGFjaXR5Jyk7XG4gICAgICAgICAgICBjb25zdCBzdHJva2VTdHlsZVByb3AgPSB0aGlzLmdldFN0eWxlKCdzdHJva2UnKTtcbiAgICAgICAgICAgIGNvbnN0IHN0cm9rZU9wYWNpdHlQcm9wID0gdGhpcy5nZXRTdHlsZSgnc3Ryb2tlLW9wYWNpdHknKTtcbiAgICAgICAgICAgIGlmIChmaWxsU3R5bGVQcm9wLmlzVXJsRGVmaW5pdGlvbigpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgZmlsbFN0eWxlID0gZmlsbFN0eWxlUHJvcC5nZXRGaWxsU3R5bGVEZWZpbml0aW9uKHRoaXMsIGZpbGxPcGFjaXR5U3R5bGVQcm9wKTtcbiAgICAgICAgICAgICAgICBpZiAoZmlsbFN0eWxlKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWxsU3R5bGVQcm9wLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICBpZiAoZmlsbFN0eWxlUHJvcC5nZXRTdHJpbmcoKSA9PT0gJ2N1cnJlbnRDb2xvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgZmlsbFN0eWxlUHJvcC5zZXRWYWx1ZSh0aGlzLmdldFN0eWxlKCdjb2xvcicpLmdldENvbG9yKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb25zdCBmaWxsU3R5bGUgPSBmaWxsU3R5bGVQcm9wLmdldENvbG9yKCk7XG4gICAgICAgICAgICAgICAgaWYgKGZpbGxTdHlsZSAhPT0gJ2luaGVyaXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5maWxsU3R5bGUgPSBmaWxsU3R5bGUgPT09ICdub25lJyA/ICdyZ2JhKDAsMCwwLDApJyA6IGZpbGxTdHlsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoZmlsbE9wYWNpdHlTdHlsZVByb3AuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IGZpbGxTdHlsZSA9IG5ldyBQcm9wZXJ0eSh0aGlzLmRvY3VtZW50LCAnZmlsbCcsIGN0eC5maWxsU3R5bGUpLmFkZE9wYWNpdHkoZmlsbE9wYWNpdHlTdHlsZVByb3ApLmdldENvbG9yKCk7XG4gICAgICAgICAgICAgICAgY3R4LmZpbGxTdHlsZSA9IGZpbGxTdHlsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIHN0cm9rZVxuICAgICAgICAgICAgaWYgKHN0cm9rZVN0eWxlUHJvcC5pc1VybERlZmluaXRpb24oKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0cm9rZVN0eWxlID0gc3Ryb2tlU3R5bGVQcm9wLmdldEZpbGxTdHlsZURlZmluaXRpb24odGhpcywgc3Ryb2tlT3BhY2l0eVByb3ApO1xuICAgICAgICAgICAgICAgIGlmIChzdHJva2VTdHlsZSkge1xuICAgICAgICAgICAgICAgICAgICBjdHguc3Ryb2tlU3R5bGUgPSBzdHJva2VTdHlsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHN0cm9rZVN0eWxlUHJvcC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgaWYgKHN0cm9rZVN0eWxlUHJvcC5nZXRTdHJpbmcoKSA9PT0gJ2N1cnJlbnRDb2xvcicpIHtcbiAgICAgICAgICAgICAgICAgICAgc3Ryb2tlU3R5bGVQcm9wLnNldFZhbHVlKHRoaXMuZ2V0U3R5bGUoJ2NvbG9yJykuZ2V0Q29sb3IoKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbnN0IHN0cm9rZVN0eWxlID0gc3Ryb2tlU3R5bGVQcm9wLmdldFN0cmluZygpO1xuICAgICAgICAgICAgICAgIGlmIChzdHJva2VTdHlsZSAhPT0gJ2luaGVyaXQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0cm9rZVN0eWxlID09PSAnbm9uZScgPyAncmdiYSgwLDAsMCwwKScgOiBzdHJva2VTdHlsZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3Ryb2tlT3BhY2l0eVByb3AuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0cm9rZVN0eWxlID0gbmV3IFByb3BlcnR5KHRoaXMuZG9jdW1lbnQsICdzdHJva2UnLCBjdHguc3Ryb2tlU3R5bGUpLmFkZE9wYWNpdHkoc3Ryb2tlT3BhY2l0eVByb3ApLmdldFN0cmluZygpO1xuICAgICAgICAgICAgICAgIGN0eC5zdHJva2VTdHlsZSA9IHN0cm9rZVN0eWxlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3Qgc3Ryb2tlV2lkdGhTdHlsZVByb3AgPSB0aGlzLmdldFN0eWxlKCdzdHJva2Utd2lkdGgnKTtcbiAgICAgICAgICAgIGlmIChzdHJva2VXaWR0aFN0eWxlUHJvcC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbmV3TGluZVdpZHRoID0gc3Ryb2tlV2lkdGhTdHlsZVByb3AuZ2V0UGl4ZWxzKCk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9ICFuZXdMaW5lV2lkdGggPyBQU0VVRE9fWkVSTyAvLyBicm93c2VycyBkb24ndCByZXNwZWN0IDAgKG9yIG5vZGUtY2FudmFzPyA6LSlcbiAgICAgICAgICAgICAgICAgOiBuZXdMaW5lV2lkdGg7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBzdHJva2VMaW5lY2FwU3R5bGVQcm9wID0gdGhpcy5nZXRTdHlsZSgnc3Ryb2tlLWxpbmVjYXAnKTtcbiAgICAgICAgICAgIGNvbnN0IHN0cm9rZUxpbmVqb2luU3R5bGVQcm9wID0gdGhpcy5nZXRTdHlsZSgnc3Ryb2tlLWxpbmVqb2luJyk7XG4gICAgICAgICAgICBjb25zdCBzdHJva2VNaXRlcmxpbWl0UHJvcCA9IHRoaXMuZ2V0U3R5bGUoJ3N0cm9rZS1taXRlcmxpbWl0Jyk7XG4gICAgICAgICAgICAvLyBORUVEIFRFU1RcbiAgICAgICAgICAgIC8vIGNvbnN0IHBvaW50T3JkZXJTdHlsZVByb3AgPSB0aGlzLmdldFN0eWxlKCdwYWludC1vcmRlcicpO1xuICAgICAgICAgICAgY29uc3Qgc3Ryb2tlRGFzaGFycmF5U3R5bGVQcm9wID0gdGhpcy5nZXRTdHlsZSgnc3Ryb2tlLWRhc2hhcnJheScpO1xuICAgICAgICAgICAgY29uc3Qgc3Ryb2tlRGFzaG9mZnNldFByb3AgPSB0aGlzLmdldFN0eWxlKCdzdHJva2UtZGFzaG9mZnNldCcpO1xuICAgICAgICAgICAgaWYgKHN0cm9rZUxpbmVjYXBTdHlsZVByb3AuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIGN0eC5saW5lQ2FwID0gc3Ryb2tlTGluZWNhcFN0eWxlUHJvcC5nZXRTdHJpbmcoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChzdHJva2VMaW5lam9pblN0eWxlUHJvcC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVKb2luID0gc3Ryb2tlTGluZWpvaW5TdHlsZVByb3AuZ2V0U3RyaW5nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoc3Ryb2tlTWl0ZXJsaW1pdFByb3AuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIGN0eC5taXRlckxpbWl0ID0gc3Ryb2tlTWl0ZXJsaW1pdFByb3AuZ2V0TnVtYmVyKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICAvLyBORUVEIFRFU1RcbiAgICAgICAgICAgIC8vIGlmIChwb2ludE9yZGVyU3R5bGVQcm9wLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIC8vICAgLy8gP1xuICAgICAgICAgICAgLy8gICBjdHgucGFpbnRPcmRlciA9IHBvaW50T3JkZXJTdHlsZVByb3AuZ2V0VmFsdWUoKTtcbiAgICAgICAgICAgIC8vIH1cbiAgICAgICAgICAgIGlmIChzdHJva2VEYXNoYXJyYXlTdHlsZVByb3AuaGFzVmFsdWUoKSAmJiBzdHJva2VEYXNoYXJyYXlTdHlsZVByb3AuZ2V0U3RyaW5nKCkgIT09ICdub25lJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGdhcHMgPSB0b051bWJlcnMoc3Ryb2tlRGFzaGFycmF5U3R5bGVQcm9wLmdldFN0cmluZygpKTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGN0eC5zZXRMaW5lRGFzaCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnNldExpbmVEYXNoKGdhcHMpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSAvLyBAdHMtZXhwZWN0LWVycm9yIEhhbmRsZSBicm93c2VyIHByZWZpeC5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGN0eC53ZWJraXRMaW5lRGFzaCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBIYW5kbGUgYnJvd3NlciBwcmVmaXguXG4gICAgICAgICAgICAgICAgICAgIGN0eC53ZWJraXRMaW5lRGFzaCA9IGdhcHM7XG4gICAgICAgICAgICAgICAgfSBlbHNlIC8vIEB0cy1leHBlY3QtZXJyb3IgSGFuZGxlIGJyb3dzZXIgcHJlZml4LlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY3R4Lm1vekRhc2ggIT09ICd1bmRlZmluZWQnICYmICEoZ2Fwcy5sZW5ndGggPT09IDEgJiYgZ2Fwc1swXSA9PT0gMCkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQHRzLWV4cGVjdC1lcnJvciBIYW5kbGUgYnJvd3NlciBwcmVmaXguXG4gICAgICAgICAgICAgICAgICAgIGN0eC5tb3pEYXNoID0gZ2FwcztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gc3Ryb2tlRGFzaG9mZnNldFByb3AuZ2V0UGl4ZWxzKCk7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjdHgubGluZURhc2hPZmZzZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC5saW5lRGFzaE9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICB9IGVsc2UgLy8gQHRzLWV4cGVjdC1lcnJvciBIYW5kbGUgYnJvd3NlciBwcmVmaXguXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjdHgud2Via2l0TGluZURhc2hPZmZzZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSGFuZGxlIGJyb3dzZXIgcHJlZml4LlxuICAgICAgICAgICAgICAgICAgICBjdHgud2Via2l0TGluZURhc2hPZmZzZXQgPSBvZmZzZXQ7XG4gICAgICAgICAgICAgICAgfSBlbHNlIC8vIEB0cy1leHBlY3QtZXJyb3IgSGFuZGxlIGJyb3dzZXIgcHJlZml4LlxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY3R4Lm1vekRhc2hPZmZzZXQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEB0cy1leHBlY3QtZXJyb3IgSGFuZGxlIGJyb3dzZXIgcHJlZml4LlxuICAgICAgICAgICAgICAgICAgICBjdHgubW96RGFzaE9mZnNldCA9IG9mZnNldDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZm9udFxuICAgICAgICB0aGlzLm1vZGlmaWVkRW1TaXplU3RhY2sgPSBmYWxzZTtcbiAgICAgICAgaWYgKHR5cGVvZiBjdHguZm9udCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGNvbnN0IGZvbnRTdHlsZVByb3AgPSB0aGlzLmdldFN0eWxlKCdmb250Jyk7XG4gICAgICAgICAgICBjb25zdCBmb250U3R5bGVTdHlsZVByb3AgPSB0aGlzLmdldFN0eWxlKCdmb250LXN0eWxlJyk7XG4gICAgICAgICAgICBjb25zdCBmb250VmFyaWFudFN0eWxlUHJvcCA9IHRoaXMuZ2V0U3R5bGUoJ2ZvbnQtdmFyaWFudCcpO1xuICAgICAgICAgICAgY29uc3QgZm9udFdlaWdodFN0eWxlUHJvcCA9IHRoaXMuZ2V0U3R5bGUoJ2ZvbnQtd2VpZ2h0Jyk7XG4gICAgICAgICAgICBjb25zdCBmb250U2l6ZVN0eWxlUHJvcCA9IHRoaXMuZ2V0U3R5bGUoJ2ZvbnQtc2l6ZScpO1xuICAgICAgICAgICAgY29uc3QgZm9udEZhbWlseVN0eWxlUHJvcCA9IHRoaXMuZ2V0U3R5bGUoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgICAgICAgICBjb25zdCBmb250ID0gbmV3IEZvbnQoZm9udFN0eWxlU3R5bGVQcm9wLmdldFN0cmluZygpLCBmb250VmFyaWFudFN0eWxlUHJvcC5nZXRTdHJpbmcoKSwgZm9udFdlaWdodFN0eWxlUHJvcC5nZXRTdHJpbmcoKSwgZm9udFNpemVTdHlsZVByb3AuaGFzVmFsdWUoKSA/IFwiXCIuY29uY2F0KGZvbnRTaXplU3R5bGVQcm9wLmdldFBpeGVscyh0cnVlKSwgXCJweFwiKSA6ICcnLCBmb250RmFtaWx5U3R5bGVQcm9wLmdldFN0cmluZygpLCBGb250LnBhcnNlKGZvbnRTdHlsZVByb3AuZ2V0U3RyaW5nKCksIGN0eC5mb250KSk7XG4gICAgICAgICAgICBmb250U3R5bGVTdHlsZVByb3Auc2V0VmFsdWUoZm9udC5mb250U3R5bGUpO1xuICAgICAgICAgICAgZm9udFZhcmlhbnRTdHlsZVByb3Auc2V0VmFsdWUoZm9udC5mb250VmFyaWFudCk7XG4gICAgICAgICAgICBmb250V2VpZ2h0U3R5bGVQcm9wLnNldFZhbHVlKGZvbnQuZm9udFdlaWdodCk7XG4gICAgICAgICAgICBmb250U2l6ZVN0eWxlUHJvcC5zZXRWYWx1ZShmb250LmZvbnRTaXplKTtcbiAgICAgICAgICAgIGZvbnRGYW1pbHlTdHlsZVByb3Auc2V0VmFsdWUoZm9udC5mb250RmFtaWx5KTtcbiAgICAgICAgICAgIGN0eC5mb250ID0gZm9udC50b1N0cmluZygpO1xuICAgICAgICAgICAgaWYgKGZvbnRTaXplU3R5bGVQcm9wLmlzUGl4ZWxzKCkpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRvY3VtZW50LmVtU2l6ZSA9IGZvbnRTaXplU3R5bGVQcm9wLmdldFBpeGVscygpO1xuICAgICAgICAgICAgICAgIHRoaXMubW9kaWZpZWRFbVNpemVTdGFjayA9IHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFmcm9tTWVhc3VyZSkge1xuICAgICAgICAgICAgLy8gZWZmZWN0c1xuICAgICAgICAgICAgdGhpcy5hcHBseUVmZmVjdHMoY3R4KTtcbiAgICAgICAgICAgIC8vIG9wYWNpdHlcbiAgICAgICAgICAgIGN0eC5nbG9iYWxBbHBoYSA9IHRoaXMuY2FsY3VsYXRlT3BhY2l0eSgpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyQ29udGV4dChjdHgpIHtcbiAgICAgICAgc3VwZXIuY2xlYXJDb250ZXh0KGN0eCk7XG4gICAgICAgIGlmICh0aGlzLm1vZGlmaWVkRW1TaXplU3RhY2spIHtcbiAgICAgICAgICAgIHRoaXMuZG9jdW1lbnQucG9wRW1TaXplKCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLm1vZGlmaWVkRW1TaXplU3RhY2sgPSBmYWxzZTtcbiAgICB9XG59XG5cbmNsYXNzIFRleHRFbGVtZW50IGV4dGVuZHMgUmVuZGVyZWRFbGVtZW50IHtcbiAgICBzZXRDb250ZXh0KGN0eCkge1xuICAgICAgICBsZXQgZnJvbU1lYXN1cmUgPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICAgICAgICBzdXBlci5zZXRDb250ZXh0KGN0eCwgZnJvbU1lYXN1cmUpO1xuICAgICAgICBjb25zdCB0ZXh0QmFzZWxpbmUgPSB0aGlzLmdldFN0eWxlKCdkb21pbmFudC1iYXNlbGluZScpLmdldFRleHRCYXNlbGluZSgpIHx8IHRoaXMuZ2V0U3R5bGUoJ2FsaWdubWVudC1iYXNlbGluZScpLmdldFRleHRCYXNlbGluZSgpO1xuICAgICAgICBpZiAodGV4dEJhc2VsaW5lKSB7XG4gICAgICAgICAgICBjdHgudGV4dEJhc2VsaW5lID0gdGV4dEJhc2VsaW5lO1xuICAgICAgICB9XG4gICAgfVxuICAgIGluaXRpYWxpemVDb29yZGluYXRlcygpIHtcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy5sZWFmVGV4dHMgPSBbXTtcbiAgICAgICAgdGhpcy50ZXh0Q2h1bmtTdGFydCA9IDA7XG4gICAgICAgIHRoaXMubWluWCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgICAgdGhpcy5tYXhYID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xuICAgIH1cbiAgICBnZXRCb3VuZGluZ0JveChjdHgpIHtcbiAgICAgICAgaWYgKHRoaXMudHlwZSAhPT0gJ3RleHQnKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5nZXRURWxlbWVudEJvdW5kaW5nQm94KGN0eCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZmlyc3QsIGNhbGN1bGF0ZSBjaGlsZCBwb3NpdGlvbnNcbiAgICAgICAgdGhpcy5pbml0aWFsaXplQ29vcmRpbmF0ZXMoKTtcbiAgICAgICAgdGhpcy5hZGp1c3RDaGlsZENvb3JkaW5hdGVzUmVjdXJzaXZlKGN0eCk7XG4gICAgICAgIGxldCBib3VuZGluZ0JveCA9IG51bGw7XG4gICAgICAgIC8vIHRoZW4gY2FsY3VsYXRlIGJvdW5kaW5nIGJveFxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKF8sIGkpPT57XG4gICAgICAgICAgICBjb25zdCBjaGlsZEJvdW5kaW5nQm94ID0gdGhpcy5nZXRDaGlsZEJvdW5kaW5nQm94KGN0eCwgdGhpcywgdGhpcywgaSk7XG4gICAgICAgICAgICBpZiAoIWJvdW5kaW5nQm94KSB7XG4gICAgICAgICAgICAgICAgYm91bmRpbmdCb3ggPSBjaGlsZEJvdW5kaW5nQm94O1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBib3VuZGluZ0JveC5hZGRCb3VuZGluZ0JveChjaGlsZEJvdW5kaW5nQm94KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZGluZ0JveDtcbiAgICB9XG4gICAgZ2V0Rm9udFNpemUoKSB7XG4gICAgICAgIGNvbnN0IHsgZG9jdW1lbnQgLCBwYXJlbnQgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBpbmhlcml0Rm9udFNpemUgPSBGb250LnBhcnNlKGRvY3VtZW50LmN0eC5mb250KS5mb250U2l6ZTtcbiAgICAgICAgY29uc3QgZm9udFNpemUgPSBwYXJlbnQuZ2V0U3R5bGUoJ2ZvbnQtc2l6ZScpLmdldE51bWJlcihpbmhlcml0Rm9udFNpemUpO1xuICAgICAgICByZXR1cm4gZm9udFNpemU7XG4gICAgfVxuICAgIGdldFRFbGVtZW50Qm91bmRpbmdCb3goY3R4KSB7XG4gICAgICAgIGNvbnN0IGZvbnRTaXplID0gdGhpcy5nZXRGb250U2l6ZSgpO1xuICAgICAgICByZXR1cm4gbmV3IEJvdW5kaW5nQm94KHRoaXMueCwgdGhpcy55IC0gZm9udFNpemUsIHRoaXMueCArIHRoaXMubWVhc3VyZVRleHQoY3R4KSwgdGhpcy55KTtcbiAgICB9XG4gICAgZ2V0R2x5cGgoZm9udCwgdGV4dCwgaSkge1xuICAgICAgICBjb25zdCBjaGFyID0gdGV4dFtpXTtcbiAgICAgICAgbGV0IGdseXBoO1xuICAgICAgICBpZiAoZm9udC5pc0FyYWJpYykge1xuICAgICAgICAgICAgdmFyIHJlZjtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IHRleHQubGVuZ3RoO1xuICAgICAgICAgICAgY29uc3QgcHJldkNoYXIgPSB0ZXh0W2kgLSAxXTtcbiAgICAgICAgICAgIGNvbnN0IG5leHRDaGFyID0gdGV4dFtpICsgMV07XG4gICAgICAgICAgICBsZXQgYXJhYmljRm9ybSA9ICdpc29sYXRlZCc7XG4gICAgICAgICAgICBpZiAoKGkgPT09IDAgfHwgcHJldkNoYXIgPT09ICcgJykgJiYgaSA8IGxlbiAtIDEgJiYgbmV4dENoYXIgIT09ICcgJykge1xuICAgICAgICAgICAgICAgIGFyYWJpY0Zvcm0gPSAndGVybWluYWwnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGkgPiAwICYmIHByZXZDaGFyICE9PSAnICcgJiYgaSA8IGxlbiAtIDEgJiYgbmV4dENoYXIgIT09ICcgJykge1xuICAgICAgICAgICAgICAgIGFyYWJpY0Zvcm0gPSAnbWVkaWFsJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChpID4gMCAmJiBwcmV2Q2hhciAhPT0gJyAnICYmIChpID09PSBsZW4gLSAxIHx8IG5leHRDaGFyID09PSAnICcpKSB7XG4gICAgICAgICAgICAgICAgYXJhYmljRm9ybSA9ICdpbml0aWFsJztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGdseXBoID0gKChyZWYgPSBmb250LmFyYWJpY0dseXBoc1tjaGFyXSkgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWZbYXJhYmljRm9ybV0pIHx8IGZvbnQuZ2x5cGhzW2NoYXJdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgZ2x5cGggPSBmb250LmdseXBoc1tjaGFyXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWdseXBoKSB7XG4gICAgICAgICAgICBnbHlwaCA9IGZvbnQubWlzc2luZ0dseXBoO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBnbHlwaDtcbiAgICB9XG4gICAgZ2V0VGV4dCgpIHtcbiAgICAgICAgcmV0dXJuICcnO1xuICAgIH1cbiAgICBnZXRUZXh0RnJvbU5vZGUobm9kZSkge1xuICAgICAgICBjb25zdCB0ZXh0Tm9kZSA9IG5vZGUgfHwgdGhpcy5ub2RlO1xuICAgICAgICBjb25zdCBjaGlsZE5vZGVzID0gQXJyYXkuZnJvbSh0ZXh0Tm9kZS5wYXJlbnROb2RlLmNoaWxkTm9kZXMpO1xuICAgICAgICBjb25zdCBpbmRleCA9IGNoaWxkTm9kZXMuaW5kZXhPZih0ZXh0Tm9kZSk7XG4gICAgICAgIGNvbnN0IGxhc3RJbmRleCA9IGNoaWxkTm9kZXMubGVuZ3RoIC0gMTtcbiAgICAgICAgbGV0IHRleHQgPSBjb21wcmVzc1NwYWNlcygvLyB0ZXh0Tm9kZS52YWx1ZVxuICAgICAgICAvLyB8fCB0ZXh0Tm9kZS50ZXh0XG4gICAgICAgIHRleHROb2RlLnRleHRDb250ZW50IHx8ICcnKTtcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICB0ZXh0ID0gdHJpbUxlZnQodGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGluZGV4ID09PSBsYXN0SW5kZXgpIHtcbiAgICAgICAgICAgIHRleHQgPSB0cmltUmlnaHQodGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRleHQ7XG4gICAgfVxuICAgIHJlbmRlckNoaWxkcmVuKGN0eCkge1xuICAgICAgICBpZiAodGhpcy50eXBlICE9PSAndGV4dCcpIHtcbiAgICAgICAgICAgIHRoaXMucmVuZGVyVEVsZW1lbnRDaGlsZHJlbihjdHgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIC8vIGZpcnN0LCBjYWxjdWxhdGUgY2hpbGQgcG9zaXRpb25zXG4gICAgICAgIHRoaXMuaW5pdGlhbGl6ZUNvb3JkaW5hdGVzKCk7XG4gICAgICAgIHRoaXMuYWRqdXN0Q2hpbGRDb29yZGluYXRlc1JlY3Vyc2l2ZShjdHgpO1xuICAgICAgICAvLyB0aGVuIHJlbmRlclxuICAgICAgICB0aGlzLmNoaWxkcmVuLmZvckVhY2goKF8sIGkpPT57XG4gICAgICAgICAgICB0aGlzLnJlbmRlckNoaWxkKGN0eCwgdGhpcywgdGhpcywgaSk7XG4gICAgICAgIH0pO1xuICAgICAgICBjb25zdCB7IG1vdXNlICB9ID0gdGhpcy5kb2N1bWVudC5zY3JlZW47XG4gICAgICAgIC8vIERvIG5vdCBjYWxjIGJvdW5kaW5nIGJveCBpZiBtb3VzZSBpcyBub3Qgd29ya2luZy5cbiAgICAgICAgaWYgKG1vdXNlLmlzV29ya2luZygpKSB7XG4gICAgICAgICAgICBtb3VzZS5jaGVja0JvdW5kaW5nQm94KHRoaXMsIHRoaXMuZ2V0Qm91bmRpbmdCb3goY3R4KSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVuZGVyVEVsZW1lbnRDaGlsZHJlbihjdHgpIHtcbiAgICAgICAgY29uc3QgeyBkb2N1bWVudCAsIHBhcmVudCAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHJlbmRlclRleHQgPSB0aGlzLmdldFRleHQoKTtcbiAgICAgICAgY29uc3QgY3VzdG9tRm9udCA9IHBhcmVudC5nZXRTdHlsZSgnZm9udC1mYW1pbHknKS5nZXREZWZpbml0aW9uKCk7XG4gICAgICAgIGlmIChjdXN0b21Gb250KSB7XG4gICAgICAgICAgICBjb25zdCB7IHVuaXRzUGVyRW0gIH0gPSBjdXN0b21Gb250LmZvbnRGYWNlO1xuICAgICAgICAgICAgY29uc3QgY3R4Rm9udCA9IEZvbnQucGFyc2UoZG9jdW1lbnQuY3R4LmZvbnQpO1xuICAgICAgICAgICAgY29uc3QgZm9udFNpemUgPSBwYXJlbnQuZ2V0U3R5bGUoJ2ZvbnQtc2l6ZScpLmdldE51bWJlcihjdHhGb250LmZvbnRTaXplKTtcbiAgICAgICAgICAgIGNvbnN0IGZvbnRTdHlsZSA9IHBhcmVudC5nZXRTdHlsZSgnZm9udC1zdHlsZScpLmdldFN0cmluZyhjdHhGb250LmZvbnRTdHlsZSk7XG4gICAgICAgICAgICBjb25zdCBzY2FsZSA9IGZvbnRTaXplIC8gdW5pdHNQZXJFbTtcbiAgICAgICAgICAgIGNvbnN0IHRleHQgPSBjdXN0b21Gb250LmlzUlRMID8gcmVuZGVyVGV4dC5zcGxpdCgnJykucmV2ZXJzZSgpLmpvaW4oJycpIDogcmVuZGVyVGV4dDtcbiAgICAgICAgICAgIGNvbnN0IGR4ID0gdG9OdW1iZXJzKHBhcmVudC5nZXRBdHRyaWJ1dGUoJ2R4JykuZ2V0U3RyaW5nKCkpO1xuICAgICAgICAgICAgY29uc3QgbGVuID0gdGV4dC5sZW5ndGg7XG4gICAgICAgICAgICBmb3IobGV0IGkgPSAwOyBpIDwgbGVuOyBpKyspe1xuICAgICAgICAgICAgICAgIGNvbnN0IGdseXBoID0gdGhpcy5nZXRHbHlwaChjdXN0b21Gb250LCB0ZXh0LCBpKTtcbiAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKHRoaXMueCwgdGhpcy55KTtcbiAgICAgICAgICAgICAgICBjdHguc2NhbGUoc2NhbGUsIC1zY2FsZSk7XG4gICAgICAgICAgICAgICAgY29uc3QgbHcgPSBjdHgubGluZVdpZHRoO1xuICAgICAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSBjdHgubGluZVdpZHRoICogdW5pdHNQZXJFbSAvIGZvbnRTaXplO1xuICAgICAgICAgICAgICAgIGlmIChmb250U3R5bGUgPT09ICdpdGFsaWMnKSB7XG4gICAgICAgICAgICAgICAgICAgIGN0eC50cmFuc2Zvcm0oMSwgMCwgMC40LCAxLCAwLCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZ2x5cGgucmVuZGVyKGN0eCk7XG4gICAgICAgICAgICAgICAgaWYgKGZvbnRTdHlsZSA9PT0gJ2l0YWxpYycpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LnRyYW5zZm9ybSgxLCAwLCAtMC40LCAxLCAwLCAwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVXaWR0aCA9IGx3O1xuICAgICAgICAgICAgICAgIGN0eC5zY2FsZSgxIC8gc2NhbGUsIC0xIC8gc2NhbGUpO1xuICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoLXRoaXMueCwgLXRoaXMueSk7XG4gICAgICAgICAgICAgICAgdGhpcy54ICs9IGZvbnRTaXplICogKGdseXBoLmhvcml6QWR2WCB8fCBjdXN0b21Gb250Lmhvcml6QWR2WCkgLyB1bml0c1BlckVtO1xuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgZHhbaV0gIT09ICd1bmRlZmluZWQnICYmICFpc05hTihkeFtpXSkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy54ICs9IGR4W2ldO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHggLCB5ICB9ID0gdGhpcztcbiAgICAgICAgLy8gTkVFRCBURVNUXG4gICAgICAgIC8vIGlmIChjdHgucGFpbnRPcmRlciA9PT0gJ3N0cm9rZScpIHtcbiAgICAgICAgLy8gICBpZiAoY3R4LnN0cm9rZVN0eWxlKSB7XG4gICAgICAgIC8vICAgICBjdHguc3Ryb2tlVGV4dChyZW5kZXJUZXh0LCB4LCB5KTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vICAgaWYgKGN0eC5maWxsU3R5bGUpIHtcbiAgICAgICAgLy8gICAgIGN0eC5maWxsVGV4dChyZW5kZXJUZXh0LCB4LCB5KTtcbiAgICAgICAgLy8gICB9XG4gICAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAgIGlmIChjdHguZmlsbFN0eWxlKSB7XG4gICAgICAgICAgICBjdHguZmlsbFRleHQocmVuZGVyVGV4dCwgeCwgeSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5zdHJva2VTdHlsZSkge1xuICAgICAgICAgICAgY3R4LnN0cm9rZVRleHQocmVuZGVyVGV4dCwgeCwgeSk7XG4gICAgICAgIH1cbiAgICAvLyB9XG4gICAgfVxuICAgIGFwcGx5QW5jaG9yaW5nKCkge1xuICAgICAgICBpZiAodGhpcy50ZXh0Q2h1bmtTdGFydCA+PSB0aGlzLmxlYWZUZXh0cy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICAvLyBUaGlzIGlzIGJhc2ljYWxseSB0aGUgXCJBcHBseSBhbmNob3JpbmdcIiBwYXJ0IG9mIGh0dHBzOi8vd3d3LnczLm9yZy9UUi9TVkcyL3RleHQuaHRtbCNUZXh0TGF5b3V0QWxnb3JpdGhtLlxuICAgICAgICAvLyBUaGUgZGlmZmVyZW5jZSBpcyB0aGF0IHdlIGFwcGx5IHRoZSBhbmNob3JpbmcgYXMgc29vbiBhcyBhIGNodW5rIGlzIGZpbmlzaGVkLiBUaGlzIHNhdmVzIHNvbWUgZXh0cmEgbG9vcGluZy5cbiAgICAgICAgLy8gVmVydGljYWwgdGV4dCBpcyBub3Qgc3VwcG9ydGVkLlxuICAgICAgICBjb25zdCBmaXJzdEVsZW1lbnQgPSB0aGlzLmxlYWZUZXh0c1t0aGlzLnRleHRDaHVua1N0YXJ0XTtcbiAgICAgICAgY29uc3QgdGV4dEFuY2hvciA9IGZpcnN0RWxlbWVudC5nZXRTdHlsZSgndGV4dC1hbmNob3InKS5nZXRTdHJpbmcoJ3N0YXJ0Jyk7XG4gICAgICAgIGNvbnN0IGlzUlRMID0gZmFsc2UgLy8gd2UgdHJlYXQgUlRMIGxpa2UgTFRSXG4gICAgICAgIDtcbiAgICAgICAgbGV0IHNoaWZ0ID0gMDtcbiAgICAgICAgaWYgKHRleHRBbmNob3IgPT09ICdzdGFydCcgJiYgIWlzUlRMIHx8IHRleHRBbmNob3IgPT09ICdlbmQnICYmIGlzUlRMKSB7XG4gICAgICAgICAgICBzaGlmdCA9IGZpcnN0RWxlbWVudC54IC0gdGhpcy5taW5YO1xuICAgICAgICB9IGVsc2UgaWYgKHRleHRBbmNob3IgPT09ICdlbmQnICYmICFpc1JUTCB8fCB0ZXh0QW5jaG9yID09PSAnc3RhcnQnICYmIGlzUlRMKSB7XG4gICAgICAgICAgICBzaGlmdCA9IGZpcnN0RWxlbWVudC54IC0gdGhpcy5tYXhYO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc2hpZnQgPSBmaXJzdEVsZW1lbnQueCAtICh0aGlzLm1pblggKyB0aGlzLm1heFgpIC8gMjtcbiAgICAgICAgfVxuICAgICAgICBmb3IobGV0IGkgPSB0aGlzLnRleHRDaHVua1N0YXJ0OyBpIDwgdGhpcy5sZWFmVGV4dHMubGVuZ3RoOyBpKyspe1xuICAgICAgICAgICAgdGhpcy5sZWFmVGV4dHNbaV0ueCArPSBzaGlmdDtcbiAgICAgICAgfVxuICAgICAgICAvLyBzdGFydCBuZXcgY2h1bmtcbiAgICAgICAgdGhpcy5taW5YID0gTnVtYmVyLlBPU0lUSVZFX0lORklOSVRZO1xuICAgICAgICB0aGlzLm1heFggPSBOdW1iZXIuTkVHQVRJVkVfSU5GSU5JVFk7XG4gICAgICAgIHRoaXMudGV4dENodW5rU3RhcnQgPSB0aGlzLmxlYWZUZXh0cy5sZW5ndGg7XG4gICAgfVxuICAgIGFkanVzdENoaWxkQ29vcmRpbmF0ZXNSZWN1cnNpdmUoY3R4KSB7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoXywgaSk9PntcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q2hpbGRDb29yZGluYXRlc1JlY3Vyc2l2ZUNvcmUoY3R4LCB0aGlzLCB0aGlzLCBpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuYXBwbHlBbmNob3JpbmcoKTtcbiAgICB9XG4gICAgYWRqdXN0Q2hpbGRDb29yZGluYXRlc1JlY3Vyc2l2ZUNvcmUoY3R4LCB0ZXh0UGFyZW50LCBwYXJlbnQsIGkxKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gcGFyZW50LmNoaWxkcmVuW2kxXTtcbiAgICAgICAgaWYgKGNoaWxkLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNoaWxkLmNoaWxkcmVuLmZvckVhY2goKF8sIGkpPT57XG4gICAgICAgICAgICAgICAgdGV4dFBhcmVudC5hZGp1c3RDaGlsZENvb3JkaW5hdGVzUmVjdXJzaXZlQ29yZShjdHgsIHRleHRQYXJlbnQsIGNoaWxkLCBpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gb25seSBsZWFmcyBhcmUgcmVsZXZhbnRcbiAgICAgICAgICAgIHRoaXMuYWRqdXN0Q2hpbGRDb29yZGluYXRlcyhjdHgsIHRleHRQYXJlbnQsIHBhcmVudCwgaTEpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGFkanVzdENoaWxkQ29vcmRpbmF0ZXMoY3R4LCB0ZXh0UGFyZW50LCBwYXJlbnQsIGkpIHtcbiAgICAgICAgY29uc3QgY2hpbGQgPSBwYXJlbnQuY2hpbGRyZW5baV07XG4gICAgICAgIGlmICh0eXBlb2YgY2hpbGQubWVhc3VyZVRleHQgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBjaGlsZDtcbiAgICAgICAgfVxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjaGlsZC5zZXRDb250ZXh0KGN0eCwgdHJ1ZSk7XG4gICAgICAgIGNvbnN0IHhBdHRyID0gY2hpbGQuZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICAgIGNvbnN0IHlBdHRyID0gY2hpbGQuZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICAgIGNvbnN0IGR4QXR0ciA9IGNoaWxkLmdldEF0dHJpYnV0ZSgnZHgnKTtcbiAgICAgICAgY29uc3QgZHlBdHRyID0gY2hpbGQuZ2V0QXR0cmlidXRlKCdkeScpO1xuICAgICAgICBjb25zdCBjdXN0b21Gb250ID0gY2hpbGQuZ2V0U3R5bGUoJ2ZvbnQtZmFtaWx5JykuZ2V0RGVmaW5pdGlvbigpO1xuICAgICAgICBjb25zdCBpc1JUTCA9IEJvb2xlYW4oY3VzdG9tRm9udCA9PT0gbnVsbCB8fCBjdXN0b21Gb250ID09PSB2b2lkIDAgPyB2b2lkIDAgOiBjdXN0b21Gb250LmlzUlRMKTtcbiAgICAgICAgaWYgKGkgPT09IDApIHtcbiAgICAgICAgICAgIC8vIEZpcnN0IGNoaWxkcmVuIGluaGVyaXQgYXR0cmlidXRlcyBmcm9tIHBhcmVudChzKS4gUG9zaXRpb25hbCBhdHRyaWJ1dGVzXG4gICAgICAgICAgICAvLyBhcmUgb25seSBpbmhlcml0ZWQgZnJvbSBhIHBhcmVudCB0byBpdCdzIGZpcnN0IGNoaWxkLlxuICAgICAgICAgICAgaWYgKCF4QXR0ci5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgeEF0dHIuc2V0VmFsdWUoY2hpbGQuZ2V0SW5oZXJpdGVkQXR0cmlidXRlKCd4JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCF5QXR0ci5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgeUF0dHIuc2V0VmFsdWUoY2hpbGQuZ2V0SW5oZXJpdGVkQXR0cmlidXRlKCd5JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFkeEF0dHIuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIGR4QXR0ci5zZXRWYWx1ZShjaGlsZC5nZXRJbmhlcml0ZWRBdHRyaWJ1dGUoJ2R4JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFkeUF0dHIuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIGR5QXR0ci5zZXRWYWx1ZShjaGlsZC5nZXRJbmhlcml0ZWRBdHRyaWJ1dGUoJ2R5JykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHdpZHRoID0gY2hpbGQubWVhc3VyZVRleHQoY3R4KTtcbiAgICAgICAgaWYgKGlzUlRMKSB7XG4gICAgICAgICAgICB0ZXh0UGFyZW50LnggLT0gd2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHhBdHRyLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIC8vIGFuIFwieFwiIGF0dHJpYnV0ZSBtYXJrcyB0aGUgc3RhcnQgb2YgYSBuZXcgY2h1bmtcbiAgICAgICAgICAgIHRleHRQYXJlbnQuYXBwbHlBbmNob3JpbmcoKTtcbiAgICAgICAgICAgIGNoaWxkLnggPSB4QXR0ci5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgICAgIGlmIChkeEF0dHIuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIGNoaWxkLnggKz0gZHhBdHRyLmdldFBpeGVscygneCcpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaWYgKGR4QXR0ci5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGV4dFBhcmVudC54ICs9IGR4QXR0ci5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNoaWxkLnggPSB0ZXh0UGFyZW50Lng7XG4gICAgICAgIH1cbiAgICAgICAgdGV4dFBhcmVudC54ID0gY2hpbGQueDtcbiAgICAgICAgaWYgKCFpc1JUTCkge1xuICAgICAgICAgICAgdGV4dFBhcmVudC54ICs9IHdpZHRoO1xuICAgICAgICB9XG4gICAgICAgIGlmICh5QXR0ci5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBjaGlsZC55ID0geUF0dHIuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgICAgICBpZiAoZHlBdHRyLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICBjaGlsZC55ICs9IGR5QXR0ci5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChkeUF0dHIuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIHRleHRQYXJlbnQueSArPSBkeUF0dHIuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZC55ID0gdGV4dFBhcmVudC55O1xuICAgICAgICB9XG4gICAgICAgIHRleHRQYXJlbnQueSA9IGNoaWxkLnk7XG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgY3VycmVudCBjaHVuayBhbmQgaXQncyBib3VuZHNcbiAgICAgICAgdGV4dFBhcmVudC5sZWFmVGV4dHMucHVzaChjaGlsZCk7XG4gICAgICAgIHRleHRQYXJlbnQubWluWCA9IE1hdGgubWluKHRleHRQYXJlbnQubWluWCwgY2hpbGQueCwgY2hpbGQueCArIHdpZHRoKTtcbiAgICAgICAgdGV4dFBhcmVudC5tYXhYID0gTWF0aC5tYXgodGV4dFBhcmVudC5tYXhYLCBjaGlsZC54LCBjaGlsZC54ICsgd2lkdGgpO1xuICAgICAgICBjaGlsZC5jbGVhckNvbnRleHQoY3R4KTtcbiAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cbiAgICBnZXRDaGlsZEJvdW5kaW5nQm94KGN0eCwgdGV4dFBhcmVudCwgcGFyZW50LCBpMikge1xuICAgICAgICBjb25zdCBjaGlsZCA9IHBhcmVudC5jaGlsZHJlbltpMl07XG4gICAgICAgIC8vIG5vdCBhIHRleHQgbm9kZT9cbiAgICAgICAgaWYgKHR5cGVvZiBjaGlsZC5nZXRCb3VuZGluZ0JveCAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgYm91bmRpbmdCb3ggPSBjaGlsZC5nZXRCb3VuZGluZ0JveChjdHgpO1xuICAgICAgICBpZiAoYm91bmRpbmdCb3gpIHtcbiAgICAgICAgICAgIGNoaWxkLmNoaWxkcmVuLmZvckVhY2goKF8sIGkpPT57XG4gICAgICAgICAgICAgICAgY29uc3QgY2hpbGRCb3VuZGluZ0JveCA9IHRleHRQYXJlbnQuZ2V0Q2hpbGRCb3VuZGluZ0JveChjdHgsIHRleHRQYXJlbnQsIGNoaWxkLCBpKTtcbiAgICAgICAgICAgICAgICBib3VuZGluZ0JveC5hZGRCb3VuZGluZ0JveChjaGlsZEJvdW5kaW5nQm94KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib3VuZGluZ0JveDtcbiAgICB9XG4gICAgcmVuZGVyQ2hpbGQoY3R4LCB0ZXh0UGFyZW50LCBwYXJlbnQsIGkzKSB7XG4gICAgICAgIGNvbnN0IGNoaWxkID0gcGFyZW50LmNoaWxkcmVuW2kzXTtcbiAgICAgICAgY2hpbGQucmVuZGVyKGN0eCk7XG4gICAgICAgIGNoaWxkLmNoaWxkcmVuLmZvckVhY2goKF8sIGkpPT57XG4gICAgICAgICAgICB0ZXh0UGFyZW50LnJlbmRlckNoaWxkKGN0eCwgdGV4dFBhcmVudCwgY2hpbGQsIGkpO1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgbWVhc3VyZVRleHQoY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgbWVhc3VyZUNhY2hlICB9ID0gdGhpcztcbiAgICAgICAgaWYgKH5tZWFzdXJlQ2FjaGUpIHtcbiAgICAgICAgICAgIHJldHVybiBtZWFzdXJlQ2FjaGU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVuZGVyVGV4dCA9IHRoaXMuZ2V0VGV4dCgpO1xuICAgICAgICBjb25zdCBtZWFzdXJlID0gdGhpcy5tZWFzdXJlVGFyZ2V0VGV4dChjdHgsIHJlbmRlclRleHQpO1xuICAgICAgICB0aGlzLm1lYXN1cmVDYWNoZSA9IG1lYXN1cmU7XG4gICAgICAgIHJldHVybiBtZWFzdXJlO1xuICAgIH1cbiAgICBtZWFzdXJlVGFyZ2V0VGV4dChjdHgsIHRhcmdldFRleHQpIHtcbiAgICAgICAgaWYgKCF0YXJnZXRUZXh0Lmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBwYXJlbnQgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBjdXN0b21Gb250ID0gcGFyZW50LmdldFN0eWxlKCdmb250LWZhbWlseScpLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgaWYgKGN1c3RvbUZvbnQpIHtcbiAgICAgICAgICAgIGNvbnN0IGZvbnRTaXplID0gdGhpcy5nZXRGb250U2l6ZSgpO1xuICAgICAgICAgICAgY29uc3QgdGV4dCA9IGN1c3RvbUZvbnQuaXNSVEwgPyB0YXJnZXRUZXh0LnNwbGl0KCcnKS5yZXZlcnNlKCkuam9pbignJykgOiB0YXJnZXRUZXh0O1xuICAgICAgICAgICAgY29uc3QgZHggPSB0b051bWJlcnMocGFyZW50LmdldEF0dHJpYnV0ZSgnZHgnKS5nZXRTdHJpbmcoKSk7XG4gICAgICAgICAgICBjb25zdCBsZW4gPSB0ZXh0Lmxlbmd0aDtcbiAgICAgICAgICAgIGxldCBtZWFzdXJlID0gMDtcbiAgICAgICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgICAgICAgICAgY29uc3QgZ2x5cGggPSB0aGlzLmdldEdseXBoKGN1c3RvbUZvbnQsIHRleHQsIGkpO1xuICAgICAgICAgICAgICAgIG1lYXN1cmUgKz0gKGdseXBoLmhvcml6QWR2WCB8fCBjdXN0b21Gb250Lmhvcml6QWR2WCkgKiBmb250U2l6ZSAvIGN1c3RvbUZvbnQuZm9udEZhY2UudW5pdHNQZXJFbTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGR4W2ldICE9PSAndW5kZWZpbmVkJyAmJiAhaXNOYU4oZHhbaV0pKSB7XG4gICAgICAgICAgICAgICAgICAgIG1lYXN1cmUgKz0gZHhbaV07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIG1lYXN1cmU7XG4gICAgICAgIH1cbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby11bm5lY2Vzc2FyeS1jb25kaXRpb25cbiAgICAgICAgaWYgKCFjdHgubWVhc3VyZVRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0YXJnZXRUZXh0Lmxlbmd0aCAqIDEwO1xuICAgICAgICB9XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIHRoaXMuc2V0Q29udGV4dChjdHgsIHRydWUpO1xuICAgICAgICBjb25zdCB7IHdpZHRoOiBtZWFzdXJlICB9ID0gY3R4Lm1lYXN1cmVUZXh0KHRhcmdldFRleHQpO1xuICAgICAgICB0aGlzLmNsZWFyQ29udGV4dChjdHgpO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICByZXR1cm4gbWVhc3VyZTtcbiAgICB9XG4gICAgLyoqXG4gICAqIEluaGVyaXRzIHBvc2l0aW9uYWwgYXR0cmlidXRlcyBmcm9tIHtAbGluayBUZXh0RWxlbWVudH0gcGFyZW50KHMpLiBBdHRyaWJ1dGVzXG4gICAqIGFyZSBvbmx5IGluaGVyaXRlZCBmcm9tIGEgcGFyZW50IHRvIGl0cyBmaXJzdCBjaGlsZC5cbiAgICogQHBhcmFtIG5hbWUgLSBUaGUgYXR0cmlidXRlIG5hbWUuXG4gICAqIEByZXR1cm5zIFRoZSBhdHRyaWJ1dGUgdmFsdWUgb3IgbnVsbC5cbiAgICovIGdldEluaGVyaXRlZEF0dHJpYnV0ZShuYW1lKSB7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdGhpcy1hbGlhcyxjb25zaXN0ZW50LXRoaXNcbiAgICAgICAgbGV0IGN1cnJlbnQgPSB0aGlzO1xuICAgICAgICB3aGlsZShjdXJyZW50IGluc3RhbmNlb2YgVGV4dEVsZW1lbnQgJiYgY3VycmVudC5pc0ZpcnN0Q2hpbGQoKSAmJiBjdXJyZW50LnBhcmVudCl7XG4gICAgICAgICAgICBjb25zdCBwYXJlbnRBdHRyID0gY3VycmVudC5wYXJlbnQuZ2V0QXR0cmlidXRlKG5hbWUpO1xuICAgICAgICAgICAgaWYgKHBhcmVudEF0dHIuaGFzVmFsdWUodHJ1ZSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGFyZW50QXR0ci5nZXRTdHJpbmcoJzAnKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGN1cnJlbnQgPSBjdXJyZW50LnBhcmVudDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpe1xuICAgICAgICBzdXBlcihkb2N1bWVudCwgbm9kZSwgbmV3LnRhcmdldCA9PT0gVGV4dEVsZW1lbnQgPyB0cnVlIDogY2FwdHVyZVRleHROb2Rlcyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICd0ZXh0JztcbiAgICAgICAgdGhpcy54ID0gMDtcbiAgICAgICAgdGhpcy55ID0gMDtcbiAgICAgICAgdGhpcy5sZWFmVGV4dHMgPSBbXTtcbiAgICAgICAgdGhpcy50ZXh0Q2h1bmtTdGFydCA9IDA7XG4gICAgICAgIHRoaXMubWluWCA9IE51bWJlci5QT1NJVElWRV9JTkZJTklUWTtcbiAgICAgICAgdGhpcy5tYXhYID0gTnVtYmVyLk5FR0FUSVZFX0lORklOSVRZO1xuICAgICAgICB0aGlzLm1lYXN1cmVDYWNoZSA9IC0xO1xuICAgIH1cbn1cblxuY2xhc3MgVFNwYW5FbGVtZW50IGV4dGVuZHMgVGV4dEVsZW1lbnQge1xuICAgIGdldFRleHQoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnRleHQ7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKXtcbiAgICAgICAgc3VwZXIoZG9jdW1lbnQsIG5vZGUsIG5ldy50YXJnZXQgPT09IFRTcGFuRWxlbWVudCA/IHRydWUgOiBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3RzcGFuJztcbiAgICAgICAgLy8gaWYgdGhpcyBub2RlIGhhcyBjaGlsZHJlbiwgdGhlbiB0aGV5IG93biB0aGUgdGV4dFxuICAgICAgICB0aGlzLnRleHQgPSB0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDAgPyAnJyA6IHRoaXMuZ2V0VGV4dEZyb21Ob2RlKCk7XG4gICAgfVxufVxuXG5jbGFzcyBUZXh0Tm9kZSBleHRlbmRzIFRTcGFuRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnR5cGUgPSAndGV4dE5vZGUnO1xuICAgIH1cbn1cblxuY2xhc3MgUGF0aFBhcnNlciBleHRlbmRzIHN2Z1BhdGhkYXRhLlNWR1BhdGhEYXRhIHtcbiAgICByZXNldCgpIHtcbiAgICAgICAgdGhpcy5pID0gLTE7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IG51bGw7XG4gICAgICAgIHRoaXMucHJldmlvdXNDb21tYW5kID0gbnVsbDtcbiAgICAgICAgdGhpcy5zdGFydCA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICAgICAgdGhpcy5jb250cm9sID0gbmV3IFBvaW50KDAsIDApO1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgICAgIHRoaXMucG9pbnRzID0gW107XG4gICAgICAgIHRoaXMuYW5nbGVzID0gW107XG4gICAgfVxuICAgIGlzRW5kKCkge1xuICAgICAgICBjb25zdCB7IGkgLCBjb21tYW5kcyAgfSA9IHRoaXM7XG4gICAgICAgIHJldHVybiBpID49IGNvbW1hbmRzLmxlbmd0aCAtIDE7XG4gICAgfVxuICAgIG5leHQoKSB7XG4gICAgICAgIGNvbnN0IGNvbW1hbmQgPSB0aGlzLmNvbW1hbmRzWysrdGhpcy5pXTtcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbW1hbmQgPSB0aGlzLmNvbW1hbmQ7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IGNvbW1hbmQ7XG4gICAgICAgIHJldHVybiBjb21tYW5kO1xuICAgIH1cbiAgICBnZXRQb2ludCgpIHtcbiAgICAgICAgbGV0IHhQcm9wID0gYXJndW1lbnRzLmxlbmd0aCA+IDAgJiYgYXJndW1lbnRzWzBdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMF0gOiAneCcsIHlQcm9wID0gYXJndW1lbnRzLmxlbmd0aCA+IDEgJiYgYXJndW1lbnRzWzFdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMV0gOiAneSc7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHRoaXMuY29tbWFuZFt4UHJvcF0sIHRoaXMuY29tbWFuZFt5UHJvcF0pO1xuICAgICAgICByZXR1cm4gdGhpcy5tYWtlQWJzb2x1dGUocG9pbnQpO1xuICAgIH1cbiAgICBnZXRBc0NvbnRyb2xQb2ludCh4UHJvcCwgeVByb3ApIHtcbiAgICAgICAgY29uc3QgcG9pbnQgPSB0aGlzLmdldFBvaW50KHhQcm9wLCB5UHJvcCk7XG4gICAgICAgIHRoaXMuY29udHJvbCA9IHBvaW50O1xuICAgICAgICByZXR1cm4gcG9pbnQ7XG4gICAgfVxuICAgIGdldEFzQ3VycmVudFBvaW50KHhQcm9wLCB5UHJvcCkge1xuICAgICAgICBjb25zdCBwb2ludCA9IHRoaXMuZ2V0UG9pbnQoeFByb3AsIHlQcm9wKTtcbiAgICAgICAgdGhpcy5jdXJyZW50ID0gcG9pbnQ7XG4gICAgICAgIHJldHVybiBwb2ludDtcbiAgICB9XG4gICAgZ2V0UmVmbGVjdGVkQ29udHJvbFBvaW50KCkge1xuICAgICAgICBjb25zdCBwcmV2aW91c0NvbW1hbmQgPSB0aGlzLnByZXZpb3VzQ29tbWFuZC50eXBlO1xuICAgICAgICBpZiAocHJldmlvdXNDb21tYW5kICE9PSBzdmdQYXRoZGF0YS5TVkdQYXRoRGF0YS5DVVJWRV9UTyAmJiBwcmV2aW91c0NvbW1hbmQgIT09IHN2Z1BhdGhkYXRhLlNWR1BhdGhEYXRhLlNNT09USF9DVVJWRV9UTyAmJiBwcmV2aW91c0NvbW1hbmQgIT09IHN2Z1BhdGhkYXRhLlNWR1BhdGhEYXRhLlFVQURfVE8gJiYgcHJldmlvdXNDb21tYW5kICE9PSBzdmdQYXRoZGF0YS5TVkdQYXRoRGF0YS5TTU9PVEhfUVVBRF9UTykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuY3VycmVudDtcbiAgICAgICAgfVxuICAgICAgICAvLyByZWZsZWN0IHBvaW50XG4gICAgICAgIGNvbnN0IHsgY3VycmVudDogeyB4OiBjeCAsIHk6IGN5ICB9ICwgY29udHJvbDogeyB4OiBveCAsIHk6IG95ICB9ICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQoMiAqIGN4IC0gb3gsIDIgKiBjeSAtIG95KTtcbiAgICAgICAgcmV0dXJuIHBvaW50O1xuICAgIH1cbiAgICBtYWtlQWJzb2x1dGUocG9pbnQpIHtcbiAgICAgICAgaWYgKHRoaXMuY29tbWFuZC5yZWxhdGl2ZSkge1xuICAgICAgICAgICAgY29uc3QgeyB4ICwgeSAgfSA9IHRoaXMuY3VycmVudDtcbiAgICAgICAgICAgIHBvaW50LnggKz0geDtcbiAgICAgICAgICAgIHBvaW50LnkgKz0geTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcG9pbnQ7XG4gICAgfVxuICAgIGFkZE1hcmtlcihwb2ludCwgZnJvbSwgcHJpb3JUbykge1xuICAgICAgICBjb25zdCB7IHBvaW50cyAsIGFuZ2xlcyAgfSA9IHRoaXM7XG4gICAgICAgIC8vIGlmIHRoZSBsYXN0IGFuZ2xlIGlzbid0IGZpbGxlZCBpbiBiZWNhdXNlIHdlIGRpZG4ndCBoYXZlIHRoaXMgcG9pbnQgeWV0IC4uLlxuICAgICAgICBpZiAocHJpb3JUbyAmJiBhbmdsZXMubGVuZ3RoID4gMCAmJiAhYW5nbGVzW2FuZ2xlcy5sZW5ndGggLSAxXSkge1xuICAgICAgICAgICAgYW5nbGVzW2FuZ2xlcy5sZW5ndGggLSAxXSA9IHBvaW50c1twb2ludHMubGVuZ3RoIC0gMV0uYW5nbGVUbyhwcmlvclRvKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmFkZE1hcmtlckFuZ2xlKHBvaW50LCBmcm9tID8gZnJvbS5hbmdsZVRvKHBvaW50KSA6IG51bGwpO1xuICAgIH1cbiAgICBhZGRNYXJrZXJBbmdsZShwb2ludCwgYW5nbGUpIHtcbiAgICAgICAgdGhpcy5wb2ludHMucHVzaChwb2ludCk7XG4gICAgICAgIHRoaXMuYW5nbGVzLnB1c2goYW5nbGUpO1xuICAgIH1cbiAgICBnZXRNYXJrZXJQb2ludHMoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnBvaW50cztcbiAgICB9XG4gICAgZ2V0TWFya2VyQW5nbGVzKCkge1xuICAgICAgICBjb25zdCB7IGFuZ2xlcyAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGxlbiA9IGFuZ2xlcy5sZW5ndGg7XG4gICAgICAgIGZvcihsZXQgaSA9IDA7IGkgPCBsZW47IGkrKyl7XG4gICAgICAgICAgICBpZiAoIWFuZ2xlc1tpXSkge1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaiA9IGkgKyAxOyBqIDwgbGVuOyBqKyspe1xuICAgICAgICAgICAgICAgICAgICBpZiAoYW5nbGVzW2pdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhbmdsZXNbaV0gPSBhbmdsZXNbal07XG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYW5nbGVzO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihwYXRoKXtcbiAgICAgICAgc3VwZXIocGF0aC8vIEZpeCBzcGFjZXMgYWZ0ZXIgc2lnbnMuXG4gICAgICAgIC5yZXBsYWNlKC8oWytcXC0uXSlcXHMrL2dtLCAnJDEnKS8vIFJlbW92ZSBpbnZhbGlkIHBhcnQuXG4gICAgICAgIC5yZXBsYWNlKC9bXk1tWnpMbEhoVnZDY1NzUXFUdEFhZVxcZFxccy4sKy1dLiovZywgJycpKTtcbiAgICAgICAgdGhpcy5jb250cm9sID0gbmV3IFBvaW50KDAsIDApO1xuICAgICAgICB0aGlzLnN0YXJ0ID0gbmV3IFBvaW50KDAsIDApO1xuICAgICAgICB0aGlzLmN1cnJlbnQgPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgICAgIHRoaXMuY29tbWFuZCA9IG51bGw7XG4gICAgICAgIHRoaXMuY29tbWFuZHMgPSB0aGlzLmNvbW1hbmRzO1xuICAgICAgICB0aGlzLmkgPSAtMTtcbiAgICAgICAgdGhpcy5wcmV2aW91c0NvbW1hbmQgPSBudWxsO1xuICAgICAgICB0aGlzLnBvaW50cyA9IFtdO1xuICAgICAgICB0aGlzLmFuZ2xlcyA9IFtdO1xuICAgIH1cbn1cblxuY2xhc3MgUGF0aEVsZW1lbnQgZXh0ZW5kcyBSZW5kZXJlZEVsZW1lbnQge1xuICAgIHBhdGgoY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgcGF0aFBhcnNlciAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nQm94ID0gbmV3IEJvdW5kaW5nQm94KCk7XG4gICAgICAgIHBhdGhQYXJzZXIucmVzZXQoKTtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlKCFwYXRoUGFyc2VyLmlzRW5kKCkpe1xuICAgICAgICAgICAgc3dpdGNoKHBhdGhQYXJzZXIubmV4dCgpLnR5cGUpe1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5NT1ZFX1RPOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdGhNKGN0eCwgYm91bmRpbmdCb3gpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBhdGhQYXJzZXIuTElORV9UTzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXRoTChjdHgsIGJvdW5kaW5nQm94KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLkhPUklaX0xJTkVfVE86XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aEgoY3R4LCBib3VuZGluZ0JveCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5WRVJUX0xJTkVfVE86XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aFYoY3R4LCBib3VuZGluZ0JveCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5DVVJWRV9UTzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXRoQyhjdHgsIGJvdW5kaW5nQm94KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLlNNT09USF9DVVJWRV9UTzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXRoUyhjdHgsIGJvdW5kaW5nQm94KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLlFVQURfVE86XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aFEoY3R4LCBib3VuZGluZ0JveCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5TTU9PVEhfUVVBRF9UTzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXRoVChjdHgsIGJvdW5kaW5nQm94KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLkFSQzpcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXRoQShjdHgsIGJvdW5kaW5nQm94KTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLkNMT1NFX1BBVEg6XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aFooY3R4LCBib3VuZGluZ0JveCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBib3VuZGluZ0JveDtcbiAgICB9XG4gICAgZ2V0Qm91bmRpbmdCb3goX2N0eCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wYXRoKCk7XG4gICAgfVxuICAgIGdldE1hcmtlcnMoKSB7XG4gICAgICAgIGNvbnN0IHsgcGF0aFBhcnNlciAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHBvaW50cyA9IHBhdGhQYXJzZXIuZ2V0TWFya2VyUG9pbnRzKCk7XG4gICAgICAgIGNvbnN0IGFuZ2xlcyA9IHBhdGhQYXJzZXIuZ2V0TWFya2VyQW5nbGVzKCk7XG4gICAgICAgIGNvbnN0IG1hcmtlcnMgPSBwb2ludHMubWFwKChwb2ludCwgaSk9PltcbiAgICAgICAgICAgICAgICBwb2ludCxcbiAgICAgICAgICAgICAgICBhbmdsZXNbaV1cbiAgICAgICAgICAgIF1cbiAgICAgICAgKTtcbiAgICAgICAgcmV0dXJuIG1hcmtlcnM7XG4gICAgfVxuICAgIHJlbmRlckNoaWxkcmVuKGN0eCkge1xuICAgICAgICB0aGlzLnBhdGgoY3R4KTtcbiAgICAgICAgdGhpcy5kb2N1bWVudC5zY3JlZW4ubW91c2UuY2hlY2tQYXRoKHRoaXMsIGN0eCk7XG4gICAgICAgIGNvbnN0IGZpbGxSdWxlU3R5bGVQcm9wID0gdGhpcy5nZXRTdHlsZSgnZmlsbC1ydWxlJyk7XG4gICAgICAgIGlmIChjdHguZmlsbFN0eWxlICE9PSAnJykge1xuICAgICAgICAgICAgaWYgKGZpbGxSdWxlU3R5bGVQcm9wLmdldFN0cmluZygnaW5oZXJpdCcpICE9PSAnaW5oZXJpdCcpIHtcbiAgICAgICAgICAgICAgICBjdHguZmlsbChmaWxsUnVsZVN0eWxlUHJvcC5nZXRTdHJpbmcoKSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGN0eC5maWxsKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGN0eC5zdHJva2VTdHlsZSAhPT0gJycpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmdldEF0dHJpYnV0ZSgndmVjdG9yLWVmZmVjdCcpLmdldFN0cmluZygpID09PSAnbm9uLXNjYWxpbmctc3Ryb2tlJykge1xuICAgICAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICAgICAgY3R4LnNldFRyYW5zZm9ybSgxLCAwLCAwLCAxLCAwLCAwKTtcbiAgICAgICAgICAgICAgICBjdHguc3Ryb2tlKCk7XG4gICAgICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG1hcmtlcnMgPSB0aGlzLmdldE1hcmtlcnMoKTtcbiAgICAgICAgaWYgKG1hcmtlcnMpIHtcbiAgICAgICAgICAgIGNvbnN0IG1hcmtlcnNMYXN0SW5kZXggPSBtYXJrZXJzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICBjb25zdCBtYXJrZXJTdGFydFN0eWxlUHJvcCA9IHRoaXMuZ2V0U3R5bGUoJ21hcmtlci1zdGFydCcpO1xuICAgICAgICAgICAgY29uc3QgbWFya2VyTWlkU3R5bGVQcm9wID0gdGhpcy5nZXRTdHlsZSgnbWFya2VyLW1pZCcpO1xuICAgICAgICAgICAgY29uc3QgbWFya2VyRW5kU3R5bGVQcm9wID0gdGhpcy5nZXRTdHlsZSgnbWFya2VyLWVuZCcpO1xuICAgICAgICAgICAgaWYgKG1hcmtlclN0YXJ0U3R5bGVQcm9wLmlzVXJsRGVmaW5pdGlvbigpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbWFya2VyID0gbWFya2VyU3RhcnRTdHlsZVByb3AuZ2V0RGVmaW5pdGlvbigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFtwb2ludCwgYW5nbGVdID0gbWFya2Vyc1swXTtcbiAgICAgICAgICAgICAgICBtYXJrZXIucmVuZGVyKGN0eCwgcG9pbnQsIGFuZ2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXJrZXJNaWRTdHlsZVByb3AuaXNVcmxEZWZpbml0aW9uKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXJrZXIgPSBtYXJrZXJNaWRTdHlsZVByb3AuZ2V0RGVmaW5pdGlvbigpO1xuICAgICAgICAgICAgICAgIGZvcihsZXQgaSA9IDE7IGkgPCBtYXJrZXJzTGFzdEluZGV4OyBpKyspe1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbcG9pbnQsIGFuZ2xlXSA9IG1hcmtlcnNbaV07XG4gICAgICAgICAgICAgICAgICAgIG1hcmtlci5yZW5kZXIoY3R4LCBwb2ludCwgYW5nbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChtYXJrZXJFbmRTdHlsZVByb3AuaXNVcmxEZWZpbml0aW9uKCkpIHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXJrZXIgPSBtYXJrZXJFbmRTdHlsZVByb3AuZ2V0RGVmaW5pdGlvbigpO1xuICAgICAgICAgICAgICAgIGNvbnN0IFtwb2ludCwgYW5nbGVdID0gbWFya2Vyc1ttYXJrZXJzTGFzdEluZGV4XTtcbiAgICAgICAgICAgICAgICBtYXJrZXIucmVuZGVyKGN0eCwgcG9pbnQsIGFuZ2xlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgcGF0aE0ocGF0aFBhcnNlcikge1xuICAgICAgICBjb25zdCBwb2ludCA9IHBhdGhQYXJzZXIuZ2V0QXNDdXJyZW50UG9pbnQoKTtcbiAgICAgICAgcGF0aFBhcnNlci5zdGFydCA9IHBhdGhQYXJzZXIuY3VycmVudDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvaW50XG4gICAgICAgIH07XG4gICAgfVxuICAgIHBhdGhNKGN0eCwgYm91bmRpbmdCb3gpIHtcbiAgICAgICAgY29uc3QgeyBwYXRoUGFyc2VyICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgeyBwb2ludCAgfSA9IFBhdGhFbGVtZW50LnBhdGhNKHBhdGhQYXJzZXIpO1xuICAgICAgICBjb25zdCB7IHggLCB5ICB9ID0gcG9pbnQ7XG4gICAgICAgIHBhdGhQYXJzZXIuYWRkTWFya2VyKHBvaW50KTtcbiAgICAgICAgYm91bmRpbmdCb3guYWRkUG9pbnQoeCwgeSk7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oeCwgeSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHBhdGhMKHBhdGhQYXJzZXIpIHtcbiAgICAgICAgY29uc3QgeyBjdXJyZW50ICB9ID0gcGF0aFBhcnNlcjtcbiAgICAgICAgY29uc3QgcG9pbnQgPSBwYXRoUGFyc2VyLmdldEFzQ3VycmVudFBvaW50KCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjdXJyZW50LFxuICAgICAgICAgICAgcG9pbnRcbiAgICAgICAgfTtcbiAgICB9XG4gICAgcGF0aEwoY3R4LCBib3VuZGluZ0JveCkge1xuICAgICAgICBjb25zdCB7IHBhdGhQYXJzZXIgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7IGN1cnJlbnQgLCBwb2ludCAgfSA9IFBhdGhFbGVtZW50LnBhdGhMKHBhdGhQYXJzZXIpO1xuICAgICAgICBjb25zdCB7IHggLCB5ICB9ID0gcG9pbnQ7XG4gICAgICAgIHBhdGhQYXJzZXIuYWRkTWFya2VyKHBvaW50LCBjdXJyZW50KTtcbiAgICAgICAgYm91bmRpbmdCb3guYWRkUG9pbnQoeCwgeSk7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oeCwgeSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHBhdGhIKHBhdGhQYXJzZXIpIHtcbiAgICAgICAgY29uc3QgeyBjdXJyZW50ICwgY29tbWFuZCAgfSA9IHBhdGhQYXJzZXI7XG4gICAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KChjb21tYW5kLnJlbGF0aXZlID8gY3VycmVudC54IDogMCkgKyBjb21tYW5kLngsIGN1cnJlbnQueSk7XG4gICAgICAgIHBhdGhQYXJzZXIuY3VycmVudCA9IHBvaW50O1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgY3VycmVudCxcbiAgICAgICAgICAgIHBvaW50XG4gICAgICAgIH07XG4gICAgfVxuICAgIHBhdGhIKGN0eCwgYm91bmRpbmdCb3gpIHtcbiAgICAgICAgY29uc3QgeyBwYXRoUGFyc2VyICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgeyBjdXJyZW50ICwgcG9pbnQgIH0gPSBQYXRoRWxlbWVudC5wYXRoSChwYXRoUGFyc2VyKTtcbiAgICAgICAgY29uc3QgeyB4ICwgeSAgfSA9IHBvaW50O1xuICAgICAgICBwYXRoUGFyc2VyLmFkZE1hcmtlcihwb2ludCwgY3VycmVudCk7XG4gICAgICAgIGJvdW5kaW5nQm94LmFkZFBvaW50KHgsIHkpO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBjdHgubGluZVRvKHgsIHkpO1xuICAgICAgICB9XG4gICAgfVxuICAgIHN0YXRpYyBwYXRoVihwYXRoUGFyc2VyKSB7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudCAsIGNvbW1hbmQgIH0gPSBwYXRoUGFyc2VyO1xuICAgICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChjdXJyZW50LngsIChjb21tYW5kLnJlbGF0aXZlID8gY3VycmVudC55IDogMCkgKyBjb21tYW5kLnkpO1xuICAgICAgICBwYXRoUGFyc2VyLmN1cnJlbnQgPSBwb2ludDtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGN1cnJlbnQsXG4gICAgICAgICAgICBwb2ludFxuICAgICAgICB9O1xuICAgIH1cbiAgICBwYXRoVihjdHgsIGJvdW5kaW5nQm94KSB7XG4gICAgICAgIGNvbnN0IHsgcGF0aFBhcnNlciAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudCAsIHBvaW50ICB9ID0gUGF0aEVsZW1lbnQucGF0aFYocGF0aFBhcnNlcik7XG4gICAgICAgIGNvbnN0IHsgeCAsIHkgIH0gPSBwb2ludDtcbiAgICAgICAgcGF0aFBhcnNlci5hZGRNYXJrZXIocG9pbnQsIGN1cnJlbnQpO1xuICAgICAgICBib3VuZGluZ0JveC5hZGRQb2ludCh4LCB5KTtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgcGF0aEMocGF0aFBhcnNlcikge1xuICAgICAgICBjb25zdCB7IGN1cnJlbnQgIH0gPSBwYXRoUGFyc2VyO1xuICAgICAgICBjb25zdCBwb2ludCA9IHBhdGhQYXJzZXIuZ2V0UG9pbnQoJ3gxJywgJ3kxJyk7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xQb2ludCA9IHBhdGhQYXJzZXIuZ2V0QXNDb250cm9sUG9pbnQoJ3gyJywgJ3kyJyk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRQb2ludCA9IHBhdGhQYXJzZXIuZ2V0QXNDdXJyZW50UG9pbnQoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGN1cnJlbnQsXG4gICAgICAgICAgICBwb2ludCxcbiAgICAgICAgICAgIGNvbnRyb2xQb2ludCxcbiAgICAgICAgICAgIGN1cnJlbnRQb2ludFxuICAgICAgICB9O1xuICAgIH1cbiAgICBwYXRoQyhjdHgsIGJvdW5kaW5nQm94KSB7XG4gICAgICAgIGNvbnN0IHsgcGF0aFBhcnNlciAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudCAsIHBvaW50ICwgY29udHJvbFBvaW50ICwgY3VycmVudFBvaW50ICB9ID0gUGF0aEVsZW1lbnQucGF0aEMocGF0aFBhcnNlcik7XG4gICAgICAgIHBhdGhQYXJzZXIuYWRkTWFya2VyKGN1cnJlbnRQb2ludCwgY29udHJvbFBvaW50LCBwb2ludCk7XG4gICAgICAgIGJvdW5kaW5nQm94LmFkZEJlemllckN1cnZlKGN1cnJlbnQueCwgY3VycmVudC55LCBwb2ludC54LCBwb2ludC55LCBjb250cm9sUG9pbnQueCwgY29udHJvbFBvaW50LnksIGN1cnJlbnRQb2ludC54LCBjdXJyZW50UG9pbnQueSk7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGN0eC5iZXppZXJDdXJ2ZVRvKHBvaW50LngsIHBvaW50LnksIGNvbnRyb2xQb2ludC54LCBjb250cm9sUG9pbnQueSwgY3VycmVudFBvaW50LngsIGN1cnJlbnRQb2ludC55KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgcGF0aFMocGF0aFBhcnNlcikge1xuICAgICAgICBjb25zdCB7IGN1cnJlbnQgIH0gPSBwYXRoUGFyc2VyO1xuICAgICAgICBjb25zdCBwb2ludCA9IHBhdGhQYXJzZXIuZ2V0UmVmbGVjdGVkQ29udHJvbFBvaW50KCk7XG4gICAgICAgIGNvbnN0IGNvbnRyb2xQb2ludCA9IHBhdGhQYXJzZXIuZ2V0QXNDb250cm9sUG9pbnQoJ3gyJywgJ3kyJyk7XG4gICAgICAgIGNvbnN0IGN1cnJlbnRQb2ludCA9IHBhdGhQYXJzZXIuZ2V0QXNDdXJyZW50UG9pbnQoKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGN1cnJlbnQsXG4gICAgICAgICAgICBwb2ludCxcbiAgICAgICAgICAgIGNvbnRyb2xQb2ludCxcbiAgICAgICAgICAgIGN1cnJlbnRQb2ludFxuICAgICAgICB9O1xuICAgIH1cbiAgICBwYXRoUyhjdHgsIGJvdW5kaW5nQm94KSB7XG4gICAgICAgIGNvbnN0IHsgcGF0aFBhcnNlciAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHsgY3VycmVudCAsIHBvaW50ICwgY29udHJvbFBvaW50ICwgY3VycmVudFBvaW50ICB9ID0gUGF0aEVsZW1lbnQucGF0aFMocGF0aFBhcnNlcik7XG4gICAgICAgIHBhdGhQYXJzZXIuYWRkTWFya2VyKGN1cnJlbnRQb2ludCwgY29udHJvbFBvaW50LCBwb2ludCk7XG4gICAgICAgIGJvdW5kaW5nQm94LmFkZEJlemllckN1cnZlKGN1cnJlbnQueCwgY3VycmVudC55LCBwb2ludC54LCBwb2ludC55LCBjb250cm9sUG9pbnQueCwgY29udHJvbFBvaW50LnksIGN1cnJlbnRQb2ludC54LCBjdXJyZW50UG9pbnQueSk7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGN0eC5iZXppZXJDdXJ2ZVRvKHBvaW50LngsIHBvaW50LnksIGNvbnRyb2xQb2ludC54LCBjb250cm9sUG9pbnQueSwgY3VycmVudFBvaW50LngsIGN1cnJlbnRQb2ludC55KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgcGF0aFEocGF0aFBhcnNlcikge1xuICAgICAgICBjb25zdCB7IGN1cnJlbnQgIH0gPSBwYXRoUGFyc2VyO1xuICAgICAgICBjb25zdCBjb250cm9sUG9pbnQgPSBwYXRoUGFyc2VyLmdldEFzQ29udHJvbFBvaW50KCd4MScsICd5MScpO1xuICAgICAgICBjb25zdCBjdXJyZW50UG9pbnQgPSBwYXRoUGFyc2VyLmdldEFzQ3VycmVudFBvaW50KCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjdXJyZW50LFxuICAgICAgICAgICAgY29udHJvbFBvaW50LFxuICAgICAgICAgICAgY3VycmVudFBvaW50XG4gICAgICAgIH07XG4gICAgfVxuICAgIHBhdGhRKGN0eCwgYm91bmRpbmdCb3gpIHtcbiAgICAgICAgY29uc3QgeyBwYXRoUGFyc2VyICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgeyBjdXJyZW50ICwgY29udHJvbFBvaW50ICwgY3VycmVudFBvaW50ICB9ID0gUGF0aEVsZW1lbnQucGF0aFEocGF0aFBhcnNlcik7XG4gICAgICAgIHBhdGhQYXJzZXIuYWRkTWFya2VyKGN1cnJlbnRQb2ludCwgY29udHJvbFBvaW50LCBjb250cm9sUG9pbnQpO1xuICAgICAgICBib3VuZGluZ0JveC5hZGRRdWFkcmF0aWNDdXJ2ZShjdXJyZW50LngsIGN1cnJlbnQueSwgY29udHJvbFBvaW50LngsIGNvbnRyb2xQb2ludC55LCBjdXJyZW50UG9pbnQueCwgY3VycmVudFBvaW50LnkpO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBjdHgucXVhZHJhdGljQ3VydmVUbyhjb250cm9sUG9pbnQueCwgY29udHJvbFBvaW50LnksIGN1cnJlbnRQb2ludC54LCBjdXJyZW50UG9pbnQueSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHBhdGhUKHBhdGhQYXJzZXIpIHtcbiAgICAgICAgY29uc3QgeyBjdXJyZW50ICB9ID0gcGF0aFBhcnNlcjtcbiAgICAgICAgY29uc3QgY29udHJvbFBvaW50ID0gcGF0aFBhcnNlci5nZXRSZWZsZWN0ZWRDb250cm9sUG9pbnQoKTtcbiAgICAgICAgcGF0aFBhcnNlci5jb250cm9sID0gY29udHJvbFBvaW50O1xuICAgICAgICBjb25zdCBjdXJyZW50UG9pbnQgPSBwYXRoUGFyc2VyLmdldEFzQ3VycmVudFBvaW50KCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBjdXJyZW50LFxuICAgICAgICAgICAgY29udHJvbFBvaW50LFxuICAgICAgICAgICAgY3VycmVudFBvaW50XG4gICAgICAgIH07XG4gICAgfVxuICAgIHBhdGhUKGN0eCwgYm91bmRpbmdCb3gpIHtcbiAgICAgICAgY29uc3QgeyBwYXRoUGFyc2VyICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgeyBjdXJyZW50ICwgY29udHJvbFBvaW50ICwgY3VycmVudFBvaW50ICB9ID0gUGF0aEVsZW1lbnQucGF0aFQocGF0aFBhcnNlcik7XG4gICAgICAgIHBhdGhQYXJzZXIuYWRkTWFya2VyKGN1cnJlbnRQb2ludCwgY29udHJvbFBvaW50LCBjb250cm9sUG9pbnQpO1xuICAgICAgICBib3VuZGluZ0JveC5hZGRRdWFkcmF0aWNDdXJ2ZShjdXJyZW50LngsIGN1cnJlbnQueSwgY29udHJvbFBvaW50LngsIGNvbnRyb2xQb2ludC55LCBjdXJyZW50UG9pbnQueCwgY3VycmVudFBvaW50LnkpO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBjdHgucXVhZHJhdGljQ3VydmVUbyhjb250cm9sUG9pbnQueCwgY29udHJvbFBvaW50LnksIGN1cnJlbnRQb2ludC54LCBjdXJyZW50UG9pbnQueSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgc3RhdGljIHBhdGhBKHBhdGhQYXJzZXIpIHtcbiAgICAgICAgY29uc3QgeyBjdXJyZW50ICwgY29tbWFuZCAgfSA9IHBhdGhQYXJzZXI7XG4gICAgICAgIGxldCB7IHJYICwgclkgLCB4Um90ICwgbEFyY0ZsYWcgLCBzd2VlcEZsYWcgIH0gPSBjb21tYW5kO1xuICAgICAgICBjb25zdCB4QXhpc1JvdGF0aW9uID0geFJvdCAqIChNYXRoLlBJIC8gMTgwKTtcbiAgICAgICAgY29uc3QgY3VycmVudFBvaW50ID0gcGF0aFBhcnNlci5nZXRBc0N1cnJlbnRQb2ludCgpO1xuICAgICAgICAvLyBDb252ZXJzaW9uIGZyb20gZW5kcG9pbnQgdG8gY2VudGVyIHBhcmFtZXRlcml6YXRpb25cbiAgICAgICAgLy8gaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHMTEvaW1wbG5vdGUuaHRtbCNBcmNJbXBsZW1lbnRhdGlvbk5vdGVzXG4gICAgICAgIC8vIHgxJywgeTEnXG4gICAgICAgIGNvbnN0IGN1cnJwID0gbmV3IFBvaW50KE1hdGguY29zKHhBeGlzUm90YXRpb24pICogKGN1cnJlbnQueCAtIGN1cnJlbnRQb2ludC54KSAvIDIgKyBNYXRoLnNpbih4QXhpc1JvdGF0aW9uKSAqIChjdXJyZW50LnkgLSBjdXJyZW50UG9pbnQueSkgLyAyLCAtTWF0aC5zaW4oeEF4aXNSb3RhdGlvbikgKiAoY3VycmVudC54IC0gY3VycmVudFBvaW50LngpIC8gMiArIE1hdGguY29zKHhBeGlzUm90YXRpb24pICogKGN1cnJlbnQueSAtIGN1cnJlbnRQb2ludC55KSAvIDIpO1xuICAgICAgICAvLyBhZGp1c3QgcmFkaWlcbiAgICAgICAgY29uc3QgbCA9IE1hdGgucG93KGN1cnJwLngsIDIpIC8gTWF0aC5wb3coclgsIDIpICsgTWF0aC5wb3coY3VycnAueSwgMikgLyBNYXRoLnBvdyhyWSwgMik7XG4gICAgICAgIGlmIChsID4gMSkge1xuICAgICAgICAgICAgclggKj0gTWF0aC5zcXJ0KGwpO1xuICAgICAgICAgICAgclkgKj0gTWF0aC5zcXJ0KGwpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGN4JywgY3knXG4gICAgICAgIGxldCBzID0gKGxBcmNGbGFnID09PSBzd2VlcEZsYWcgPyAtMSA6IDEpICogTWF0aC5zcXJ0KChNYXRoLnBvdyhyWCwgMikgKiBNYXRoLnBvdyhyWSwgMikgLSBNYXRoLnBvdyhyWCwgMikgKiBNYXRoLnBvdyhjdXJycC55LCAyKSAtIE1hdGgucG93KHJZLCAyKSAqIE1hdGgucG93KGN1cnJwLngsIDIpKSAvIChNYXRoLnBvdyhyWCwgMikgKiBNYXRoLnBvdyhjdXJycC55LCAyKSArIE1hdGgucG93KHJZLCAyKSAqIE1hdGgucG93KGN1cnJwLngsIDIpKSk7XG4gICAgICAgIGlmIChpc05hTihzKSkge1xuICAgICAgICAgICAgcyA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgY3BwID0gbmV3IFBvaW50KHMgKiByWCAqIGN1cnJwLnkgLyByWSwgcyAqIC1yWSAqIGN1cnJwLnggLyByWCk7XG4gICAgICAgIC8vIGN4LCBjeVxuICAgICAgICBjb25zdCBjZW50cCA9IG5ldyBQb2ludCgoY3VycmVudC54ICsgY3VycmVudFBvaW50LngpIC8gMiArIE1hdGguY29zKHhBeGlzUm90YXRpb24pICogY3BwLnggLSBNYXRoLnNpbih4QXhpc1JvdGF0aW9uKSAqIGNwcC55LCAoY3VycmVudC55ICsgY3VycmVudFBvaW50LnkpIC8gMiArIE1hdGguc2luKHhBeGlzUm90YXRpb24pICogY3BwLnggKyBNYXRoLmNvcyh4QXhpc1JvdGF0aW9uKSAqIGNwcC55KTtcbiAgICAgICAgLy8gaW5pdGlhbCBhbmdsZVxuICAgICAgICBjb25zdCBhMSA9IHZlY3RvcnNBbmdsZShbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMFxuICAgICAgICBdLCBbXG4gICAgICAgICAgICAoY3VycnAueCAtIGNwcC54KSAvIHJYLFxuICAgICAgICAgICAgKGN1cnJwLnkgLSBjcHAueSkgLyByWVxuICAgICAgICBdKSAvLyDOuDFcbiAgICAgICAgO1xuICAgICAgICAvLyBhbmdsZSBkZWx0YVxuICAgICAgICBjb25zdCB1ID0gW1xuICAgICAgICAgICAgKGN1cnJwLnggLSBjcHAueCkgLyByWCxcbiAgICAgICAgICAgIChjdXJycC55IC0gY3BwLnkpIC8gcllcbiAgICAgICAgXTtcbiAgICAgICAgY29uc3QgdiA9IFtcbiAgICAgICAgICAgICgtY3VycnAueCAtIGNwcC54KSAvIHJYLFxuICAgICAgICAgICAgKC1jdXJycC55IC0gY3BwLnkpIC8gcllcbiAgICAgICAgXTtcbiAgICAgICAgbGV0IGFkID0gdmVjdG9yc0FuZ2xlKHUsIHYpIC8vIM6UzrhcbiAgICAgICAgO1xuICAgICAgICBpZiAodmVjdG9yc1JhdGlvKHUsIHYpIDw9IC0xKSB7XG4gICAgICAgICAgICBhZCA9IE1hdGguUEk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHZlY3RvcnNSYXRpbyh1LCB2KSA+PSAxKSB7XG4gICAgICAgICAgICBhZCA9IDA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGN1cnJlbnRQb2ludCxcbiAgICAgICAgICAgIHJYLFxuICAgICAgICAgICAgclksXG4gICAgICAgICAgICBzd2VlcEZsYWcsXG4gICAgICAgICAgICB4QXhpc1JvdGF0aW9uLFxuICAgICAgICAgICAgY2VudHAsXG4gICAgICAgICAgICBhMSxcbiAgICAgICAgICAgIGFkXG4gICAgICAgIH07XG4gICAgfVxuICAgIHBhdGhBKGN0eCwgYm91bmRpbmdCb3gpIHtcbiAgICAgICAgY29uc3QgeyBwYXRoUGFyc2VyICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgeyBjdXJyZW50UG9pbnQgLCByWCAsIHJZICwgc3dlZXBGbGFnICwgeEF4aXNSb3RhdGlvbiAsIGNlbnRwICwgYTEgLCBhZCAgfSA9IFBhdGhFbGVtZW50LnBhdGhBKHBhdGhQYXJzZXIpO1xuICAgICAgICAvLyBmb3IgbWFya2Vyc1xuICAgICAgICBjb25zdCBkaXIgPSAxIC0gc3dlZXBGbGFnID8gMSA6IC0xO1xuICAgICAgICBjb25zdCBhaCA9IGExICsgZGlyICogKGFkIC8gMik7XG4gICAgICAgIGNvbnN0IGhhbGZXYXkgPSBuZXcgUG9pbnQoY2VudHAueCArIHJYICogTWF0aC5jb3MoYWgpLCBjZW50cC55ICsgclkgKiBNYXRoLnNpbihhaCkpO1xuICAgICAgICBwYXRoUGFyc2VyLmFkZE1hcmtlckFuZ2xlKGhhbGZXYXksIGFoIC0gZGlyICogTWF0aC5QSSAvIDIpO1xuICAgICAgICBwYXRoUGFyc2VyLmFkZE1hcmtlckFuZ2xlKGN1cnJlbnRQb2ludCwgYWggLSBkaXIgKiBNYXRoLlBJKTtcbiAgICAgICAgYm91bmRpbmdCb3guYWRkUG9pbnQoY3VycmVudFBvaW50LngsIGN1cnJlbnRQb2ludC55KSAvLyBUT0RPOiB0aGlzIGlzIHRvbyBuYWl2ZSwgbWFrZSBpdCBiZXR0ZXJcbiAgICAgICAgO1xuICAgICAgICBpZiAoY3R4ICYmICFpc05hTihhMSkgJiYgIWlzTmFOKGFkKSkge1xuICAgICAgICAgICAgY29uc3QgciA9IHJYID4gclkgPyByWCA6IHJZO1xuICAgICAgICAgICAgY29uc3Qgc3ggPSByWCA+IHJZID8gMSA6IHJYIC8gclk7XG4gICAgICAgICAgICBjb25zdCBzeSA9IHJYID4gclkgPyByWSAvIHJYIDogMTtcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoY2VudHAueCwgY2VudHAueSk7XG4gICAgICAgICAgICBjdHgucm90YXRlKHhBeGlzUm90YXRpb24pO1xuICAgICAgICAgICAgY3R4LnNjYWxlKHN4LCBzeSk7XG4gICAgICAgICAgICBjdHguYXJjKDAsIDAsIHIsIGExLCBhMSArIGFkLCBCb29sZWFuKDEgLSBzd2VlcEZsYWcpKTtcbiAgICAgICAgICAgIGN0eC5zY2FsZSgxIC8gc3gsIDEgLyBzeSk7XG4gICAgICAgICAgICBjdHgucm90YXRlKC14QXhpc1JvdGF0aW9uKTtcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoLWNlbnRwLngsIC1jZW50cC55KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBzdGF0aWMgcGF0aFoocGF0aFBhcnNlcikge1xuICAgICAgICBwYXRoUGFyc2VyLmN1cnJlbnQgPSBwYXRoUGFyc2VyLnN0YXJ0O1xuICAgIH1cbiAgICBwYXRoWihjdHgsIGJvdW5kaW5nQm94KSB7XG4gICAgICAgIFBhdGhFbGVtZW50LnBhdGhaKHRoaXMucGF0aFBhcnNlcik7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIC8vIG9ubHkgY2xvc2UgcGF0aCBpZiBpdCBpcyBub3QgYSBzdHJhaWdodCBsaW5lXG4gICAgICAgICAgICBpZiAoYm91bmRpbmdCb3gueDEgIT09IGJvdW5kaW5nQm94LngyICYmIGJvdW5kaW5nQm94LnkxICE9PSBib3VuZGluZ0JveC55Mikge1xuICAgICAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyl7XG4gICAgICAgIHN1cGVyKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3BhdGgnO1xuICAgICAgICB0aGlzLnBhdGhQYXJzZXIgPSBuZXcgUGF0aFBhcnNlcih0aGlzLmdldEF0dHJpYnV0ZSgnZCcpLmdldFN0cmluZygpKTtcbiAgICB9XG59XG5cbmNsYXNzIFNWR0VsZW1lbnQgZXh0ZW5kcyBSZW5kZXJlZEVsZW1lbnQge1xuICAgIHNldENvbnRleHQoY3R4KSB7XG4gICAgICAgIHZhciByZWY7XG4gICAgICAgIGNvbnN0IHsgZG9jdW1lbnQgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7IHNjcmVlbiAsIHdpbmRvdyAgfSA9IGRvY3VtZW50O1xuICAgICAgICBjb25zdCBjYW52YXMgPSBjdHguY2FudmFzO1xuICAgICAgICBzY3JlZW4uc2V0RGVmYXVsdHMoY3R4KTtcbiAgICAgICAgaWYgKCdzdHlsZScgaW4gY2FudmFzICYmIHR5cGVvZiBjdHguZm9udCAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93ICYmIHR5cGVvZiB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIGN0eC5mb250ID0gd2luZG93LmdldENvbXB1dGVkU3R5bGUoY2FudmFzKS5nZXRQcm9wZXJ0eVZhbHVlKCdmb250Jyk7XG4gICAgICAgICAgICBjb25zdCBmb250U2l6ZVByb3AgPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsICdmb250U2l6ZScsIEZvbnQucGFyc2UoY3R4LmZvbnQpLmZvbnRTaXplKTtcbiAgICAgICAgICAgIGlmIChmb250U2l6ZVByb3AuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnJvb3RFbVNpemUgPSBmb250U2l6ZVByb3AuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZW1TaXplID0gZG9jdW1lbnQucm9vdEVtU2l6ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBjcmVhdGUgbmV3IHZpZXcgcG9ydFxuICAgICAgICBpZiAoIXRoaXMuZ2V0QXR0cmlidXRlKCd4JykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgdGhpcy5nZXRBdHRyaWJ1dGUoJ3gnLCB0cnVlKS5zZXRWYWx1ZSgwKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZ2V0QXR0cmlidXRlKCd5JykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgdGhpcy5nZXRBdHRyaWJ1dGUoJ3knLCB0cnVlKS5zZXRWYWx1ZSgwKTtcbiAgICAgICAgfVxuICAgICAgICBsZXQgeyB3aWR0aCAsIGhlaWdodCAgfSA9IHNjcmVlbi52aWV3UG9ydDtcbiAgICAgICAgaWYgKCF0aGlzLmdldFN0eWxlKCd3aWR0aCcpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U3R5bGUoJ3dpZHRoJywgdHJ1ZSkuc2V0VmFsdWUoJzEwMCUnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZ2V0U3R5bGUoJ2hlaWdodCcpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U3R5bGUoJ2hlaWdodCcsIHRydWUpLnNldFZhbHVlKCcxMDAlJyk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCF0aGlzLmdldFN0eWxlKCdjb2xvcicpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U3R5bGUoJ2NvbG9yJywgdHJ1ZSkuc2V0VmFsdWUoJ2JsYWNrJyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVmWEF0dHIgPSB0aGlzLmdldEF0dHJpYnV0ZSgncmVmWCcpO1xuICAgICAgICBjb25zdCByZWZZQXR0ciA9IHRoaXMuZ2V0QXR0cmlidXRlKCdyZWZZJyk7XG4gICAgICAgIGNvbnN0IHZpZXdCb3hBdHRyID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnKTtcbiAgICAgICAgY29uc3Qgdmlld0JveCA9IHZpZXdCb3hBdHRyLmhhc1ZhbHVlKCkgPyB0b051bWJlcnModmlld0JveEF0dHIuZ2V0U3RyaW5nKCkpIDogbnVsbDtcbiAgICAgICAgY29uc3QgY2xpcCA9ICF0aGlzLnJvb3QgJiYgdGhpcy5nZXRTdHlsZSgnb3ZlcmZsb3cnKS5nZXRWYWx1ZSgnaGlkZGVuJykgIT09ICd2aXNpYmxlJztcbiAgICAgICAgbGV0IG1pblggPSAwO1xuICAgICAgICBsZXQgbWluWSA9IDA7XG4gICAgICAgIGxldCBjbGlwWCA9IDA7XG4gICAgICAgIGxldCBjbGlwWSA9IDA7XG4gICAgICAgIGlmICh2aWV3Qm94KSB7XG4gICAgICAgICAgICBtaW5YID0gdmlld0JveFswXTtcbiAgICAgICAgICAgIG1pblkgPSB2aWV3Qm94WzFdO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5yb290KSB7XG4gICAgICAgICAgICB3aWR0aCA9IHRoaXMuZ2V0U3R5bGUoJ3dpZHRoJykuZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgICAgICBoZWlnaHQgPSB0aGlzLmdldFN0eWxlKCdoZWlnaHQnKS5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgICAgIGlmICh0aGlzLnR5cGUgPT09ICdtYXJrZXInKSB7XG4gICAgICAgICAgICAgICAgY2xpcFggPSBtaW5YO1xuICAgICAgICAgICAgICAgIGNsaXBZID0gbWluWTtcbiAgICAgICAgICAgICAgICBtaW5YID0gMDtcbiAgICAgICAgICAgICAgICBtaW5ZID0gMDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBzY3JlZW4udmlld1BvcnQuc2V0Q3VycmVudCh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgLy8gRGVmYXVsdCB2YWx1ZSBvZiB0cmFuc2Zvcm0tb3JpZ2luIGlzIGNlbnRlciBvbmx5IGZvciByb290IFNWRyBlbGVtZW50c1xuICAgICAgICAvLyBodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi1VUy9kb2NzL1dlYi9TVkcvQXR0cmlidXRlL3RyYW5zZm9ybS1vcmlnaW5cbiAgICAgICAgaWYgKHRoaXMubm9kZSAvLyBpcyBub3QgdGVtcG9yYXJ5IFNWR0VsZW1lbnRcbiAgICAgICAgICYmICghdGhpcy5wYXJlbnQgfHwgKChyZWYgPSB0aGlzLm5vZGUucGFyZW50Tm9kZSkgPT09IG51bGwgfHwgcmVmID09PSB2b2lkIDAgPyB2b2lkIDAgOiByZWYubm9kZU5hbWUpID09PSAnZm9yZWlnbk9iamVjdCcpICYmIHRoaXMuZ2V0U3R5bGUoJ3RyYW5zZm9ybScsIGZhbHNlLCB0cnVlKS5oYXNWYWx1ZSgpICYmICF0aGlzLmdldFN0eWxlKCd0cmFuc2Zvcm0tb3JpZ2luJywgZmFsc2UsIHRydWUpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0U3R5bGUoJ3RyYW5zZm9ybS1vcmlnaW4nLCB0cnVlLCB0cnVlKS5zZXRWYWx1ZSgnNTAlIDUwJScpO1xuICAgICAgICB9XG4gICAgICAgIHN1cGVyLnNldENvbnRleHQoY3R4KTtcbiAgICAgICAgY3R4LnRyYW5zbGF0ZSh0aGlzLmdldEF0dHJpYnV0ZSgneCcpLmdldFBpeGVscygneCcpLCB0aGlzLmdldEF0dHJpYnV0ZSgneScpLmdldFBpeGVscygneScpKTtcbiAgICAgICAgaWYgKHZpZXdCb3gpIHtcbiAgICAgICAgICAgIHdpZHRoID0gdmlld0JveFsyXTtcbiAgICAgICAgICAgIGhlaWdodCA9IHZpZXdCb3hbM107XG4gICAgICAgIH1cbiAgICAgICAgZG9jdW1lbnQuc2V0Vmlld0JveCh7XG4gICAgICAgICAgICBjdHgsXG4gICAgICAgICAgICBhc3BlY3RSYXRpbzogdGhpcy5nZXRBdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nKS5nZXRTdHJpbmcoKSxcbiAgICAgICAgICAgIHdpZHRoOiBzY3JlZW4udmlld1BvcnQud2lkdGgsXG4gICAgICAgICAgICBkZXNpcmVkV2lkdGg6IHdpZHRoLFxuICAgICAgICAgICAgaGVpZ2h0OiBzY3JlZW4udmlld1BvcnQuaGVpZ2h0LFxuICAgICAgICAgICAgZGVzaXJlZEhlaWdodDogaGVpZ2h0LFxuICAgICAgICAgICAgbWluWCxcbiAgICAgICAgICAgIG1pblksXG4gICAgICAgICAgICByZWZYOiByZWZYQXR0ci5nZXRWYWx1ZSgpLFxuICAgICAgICAgICAgcmVmWTogcmVmWUF0dHIuZ2V0VmFsdWUoKSxcbiAgICAgICAgICAgIGNsaXAsXG4gICAgICAgICAgICBjbGlwWCxcbiAgICAgICAgICAgIGNsaXBZXG4gICAgICAgIH0pO1xuICAgICAgICBpZiAodmlld0JveCkge1xuICAgICAgICAgICAgc2NyZWVuLnZpZXdQb3J0LnJlbW92ZUN1cnJlbnQoKTtcbiAgICAgICAgICAgIHNjcmVlbi52aWV3UG9ydC5zZXRDdXJyZW50KHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNsZWFyQ29udGV4dChjdHgpIHtcbiAgICAgICAgc3VwZXIuY2xlYXJDb250ZXh0KGN0eCk7XG4gICAgICAgIHRoaXMuZG9jdW1lbnQuc2NyZWVuLnZpZXdQb3J0LnJlbW92ZUN1cnJlbnQoKTtcbiAgICB9XG4gICAgLyoqXG4gICAqIFJlc2l6ZSBTVkcgdG8gZml0IGluIGdpdmVuIHNpemUuXG4gICAqIEBwYXJhbSB3aWR0aFxuICAgKiBAcGFyYW0gaGVpZ2h0XG4gICAqIEBwYXJhbSBwcmVzZXJ2ZUFzcGVjdFJhdGlvXG4gICAqLyByZXNpemUod2lkdGgpIHtcbiAgICAgICAgbGV0IGhlaWdodCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzFdIDogd2lkdGgsIHByZXNlcnZlQXNwZWN0UmF0aW8gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuICAgICAgICBjb25zdCB3aWR0aEF0dHIgPSB0aGlzLmdldEF0dHJpYnV0ZSgnd2lkdGgnLCB0cnVlKTtcbiAgICAgICAgY29uc3QgaGVpZ2h0QXR0ciA9IHRoaXMuZ2V0QXR0cmlidXRlKCdoZWlnaHQnLCB0cnVlKTtcbiAgICAgICAgY29uc3Qgdmlld0JveEF0dHIgPSB0aGlzLmdldEF0dHJpYnV0ZSgndmlld0JveCcpO1xuICAgICAgICBjb25zdCBzdHlsZUF0dHIgPSB0aGlzLmdldEF0dHJpYnV0ZSgnc3R5bGUnKTtcbiAgICAgICAgY29uc3Qgb3JpZ2luV2lkdGggPSB3aWR0aEF0dHIuZ2V0TnVtYmVyKDApO1xuICAgICAgICBjb25zdCBvcmlnaW5IZWlnaHQgPSBoZWlnaHRBdHRyLmdldE51bWJlcigwKTtcbiAgICAgICAgaWYgKHByZXNlcnZlQXNwZWN0UmF0aW8pIHtcbiAgICAgICAgICAgIGlmICh0eXBlb2YgcHJlc2VydmVBc3BlY3RSYXRpbyA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmdldEF0dHJpYnV0ZSgncHJlc2VydmVBc3BlY3RSYXRpbycsIHRydWUpLnNldFZhbHVlKHByZXNlcnZlQXNwZWN0UmF0aW8pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmVzZXJ2ZUFzcGVjdFJhdGlvQXR0ciA9IHRoaXMuZ2V0QXR0cmlidXRlKCdwcmVzZXJ2ZUFzcGVjdFJhdGlvJyk7XG4gICAgICAgICAgICAgICAgaWYgKHByZXNlcnZlQXNwZWN0UmF0aW9BdHRyLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJlc2VydmVBc3BlY3RSYXRpb0F0dHIuc2V0VmFsdWUocHJlc2VydmVBc3BlY3RSYXRpb0F0dHIuZ2V0U3RyaW5nKCkucmVwbGFjZSgvXlxccyooXFxTLipcXFMpXFxzKiQvLCAnJDEnKSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHdpZHRoQXR0ci5zZXRWYWx1ZSh3aWR0aCk7XG4gICAgICAgIGhlaWdodEF0dHIuc2V0VmFsdWUoaGVpZ2h0KTtcbiAgICAgICAgaWYgKCF2aWV3Qm94QXR0ci5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICB2aWV3Qm94QXR0ci5zZXRWYWx1ZShcIjAgMCBcIi5jb25jYXQob3JpZ2luV2lkdGggfHwgd2lkdGgsIFwiIFwiKS5jb25jYXQob3JpZ2luSGVpZ2h0IHx8IGhlaWdodCkpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChzdHlsZUF0dHIuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgY29uc3Qgd2lkdGhTdHlsZSA9IHRoaXMuZ2V0U3R5bGUoJ3dpZHRoJyk7XG4gICAgICAgICAgICBjb25zdCBoZWlnaHRTdHlsZSA9IHRoaXMuZ2V0U3R5bGUoJ2hlaWdodCcpO1xuICAgICAgICAgICAgaWYgKHdpZHRoU3R5bGUuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgIHdpZHRoU3R5bGUuc2V0VmFsdWUoXCJcIi5jb25jYXQod2lkdGgsIFwicHhcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGhlaWdodFN0eWxlLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgICAgICBoZWlnaHRTdHlsZS5zZXRWYWx1ZShcIlwiLmNvbmNhdChoZWlnaHQsIFwicHhcIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3N2Zyc7XG4gICAgICAgIHRoaXMucm9vdCA9IGZhbHNlO1xuICAgIH1cbn1cblxuY2xhc3MgUmVjdEVsZW1lbnQgZXh0ZW5kcyBQYXRoRWxlbWVudCB7XG4gICAgcGF0aChjdHgpIHtcbiAgICAgICAgY29uc3QgeCA9IHRoaXMuZ2V0QXR0cmlidXRlKCd4JykuZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLmdldEF0dHJpYnV0ZSgneScpLmdldFBpeGVscygneScpO1xuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZ2V0U3R5bGUoJ3dpZHRoJywgZmFsc2UsIHRydWUpLmdldFBpeGVscygneCcpO1xuICAgICAgICBjb25zdCBoZWlnaHQgPSB0aGlzLmdldFN0eWxlKCdoZWlnaHQnLCBmYWxzZSwgdHJ1ZSkuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgIGNvbnN0IHJ4QXR0ciA9IHRoaXMuZ2V0QXR0cmlidXRlKCdyeCcpO1xuICAgICAgICBjb25zdCByeUF0dHIgPSB0aGlzLmdldEF0dHJpYnV0ZSgncnknKTtcbiAgICAgICAgbGV0IHJ4ID0gcnhBdHRyLmdldFBpeGVscygneCcpO1xuICAgICAgICBsZXQgcnkgPSByeUF0dHIuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgIGlmIChyeEF0dHIuaGFzVmFsdWUoKSAmJiAhcnlBdHRyLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHJ5ID0gcng7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHJ5QXR0ci5oYXNWYWx1ZSgpICYmICFyeEF0dHIuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgcnggPSByeTtcbiAgICAgICAgfVxuICAgICAgICByeCA9IE1hdGgubWluKHJ4LCB3aWR0aCAvIDIpO1xuICAgICAgICByeSA9IE1hdGgubWluKHJ5LCBoZWlnaHQgLyAyKTtcbiAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgY29uc3QgS0FQUEEgPSA0ICogKChNYXRoLnNxcnQoMikgLSAxKSAvIDMpO1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpIC8vIGFsd2F5cyBzdGFydCB0aGUgcGF0aCBzbyB3ZSBkb24ndCBmaWxsIHByaW9yIHBhdGhzXG4gICAgICAgICAgICA7XG4gICAgICAgICAgICBpZiAoaGVpZ2h0ID4gMCAmJiB3aWR0aCA+IDApIHtcbiAgICAgICAgICAgICAgICBjdHgubW92ZVRvKHggKyByeCwgeSk7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyh4ICsgd2lkdGggLSByeCwgeSk7XG4gICAgICAgICAgICAgICAgY3R4LmJlemllckN1cnZlVG8oeCArIHdpZHRoIC0gcnggKyBLQVBQQSAqIHJ4LCB5LCB4ICsgd2lkdGgsIHkgKyByeSAtIEtBUFBBICogcnksIHggKyB3aWR0aCwgeSArIHJ5KTtcbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKHggKyB3aWR0aCwgeSArIGhlaWdodCAtIHJ5KTtcbiAgICAgICAgICAgICAgICBjdHguYmV6aWVyQ3VydmVUbyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQgLSByeSArIEtBUFBBICogcnksIHggKyB3aWR0aCAtIHJ4ICsgS0FQUEEgKiByeCwgeSArIGhlaWdodCwgeCArIHdpZHRoIC0gcngsIHkgKyBoZWlnaHQpO1xuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oeCArIHJ4LCB5ICsgaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBjdHguYmV6aWVyQ3VydmVUbyh4ICsgcnggLSBLQVBQQSAqIHJ4LCB5ICsgaGVpZ2h0LCB4LCB5ICsgaGVpZ2h0IC0gcnkgKyBLQVBQQSAqIHJ5LCB4LCB5ICsgaGVpZ2h0IC0gcnkpO1xuICAgICAgICAgICAgICAgIGN0eC5saW5lVG8oeCwgeSArIHJ5KTtcbiAgICAgICAgICAgICAgICBjdHguYmV6aWVyQ3VydmVUbyh4LCB5ICsgcnkgLSBLQVBQQSAqIHJ5LCB4ICsgcnggLSBLQVBQQSAqIHJ4LCB5LCB4ICsgcngsIHkpO1xuICAgICAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEJvdW5kaW5nQm94KHgsIHksIHggKyB3aWR0aCwgeSArIGhlaWdodCk7XG4gICAgfVxuICAgIGdldE1hcmtlcnMoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdyZWN0JztcbiAgICB9XG59XG5cbmNsYXNzIENpcmNsZUVsZW1lbnQgZXh0ZW5kcyBQYXRoRWxlbWVudCB7XG4gICAgcGF0aChjdHgpIHtcbiAgICAgICAgY29uc3QgY3ggPSB0aGlzLmdldEF0dHJpYnV0ZSgnY3gnKS5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgY29uc3QgY3kgPSB0aGlzLmdldEF0dHJpYnV0ZSgnY3knKS5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgY29uc3QgciA9IHRoaXMuZ2V0QXR0cmlidXRlKCdyJykuZ2V0UGl4ZWxzKCk7XG4gICAgICAgIGlmIChjdHggJiYgciA+IDApIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5hcmMoY3gsIGN5LCByLCAwLCBNYXRoLlBJICogMiwgZmFsc2UpO1xuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQm91bmRpbmdCb3goY3ggLSByLCBjeSAtIHIsIGN4ICsgciwgY3kgKyByKTtcbiAgICB9XG4gICAgZ2V0TWFya2VycygpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2NpcmNsZSc7XG4gICAgfVxufVxuXG5jbGFzcyBFbGxpcHNlRWxlbWVudCBleHRlbmRzIFBhdGhFbGVtZW50IHtcbiAgICBwYXRoKGN0eCkge1xuICAgICAgICBjb25zdCBLQVBQQSA9IDQgKiAoKE1hdGguc3FydCgyKSAtIDEpIC8gMyk7XG4gICAgICAgIGNvbnN0IHJ4ID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3J4JykuZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGNvbnN0IHJ5ID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3J5JykuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgIGNvbnN0IGN4ID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2N4JykuZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGNvbnN0IGN5ID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2N5JykuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgIGlmIChjdHggJiYgcnggPiAwICYmIHJ5ID4gMCkge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAgICAgY3R4Lm1vdmVUbyhjeCArIHJ4LCBjeSk7XG4gICAgICAgICAgICBjdHguYmV6aWVyQ3VydmVUbyhjeCArIHJ4LCBjeSArIEtBUFBBICogcnksIGN4ICsgS0FQUEEgKiByeCwgY3kgKyByeSwgY3gsIGN5ICsgcnkpO1xuICAgICAgICAgICAgY3R4LmJlemllckN1cnZlVG8oY3ggLSBLQVBQQSAqIHJ4LCBjeSArIHJ5LCBjeCAtIHJ4LCBjeSArIEtBUFBBICogcnksIGN4IC0gcngsIGN5KTtcbiAgICAgICAgICAgIGN0eC5iZXppZXJDdXJ2ZVRvKGN4IC0gcngsIGN5IC0gS0FQUEEgKiByeSwgY3ggLSBLQVBQQSAqIHJ4LCBjeSAtIHJ5LCBjeCwgY3kgLSByeSk7XG4gICAgICAgICAgICBjdHguYmV6aWVyQ3VydmVUbyhjeCArIEtBUFBBICogcngsIGN5IC0gcnksIGN4ICsgcngsIGN5IC0gS0FQUEEgKiByeSwgY3ggKyByeCwgY3kpO1xuICAgICAgICAgICAgY3R4LmNsb3NlUGF0aCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgQm91bmRpbmdCb3goY3ggLSByeCwgY3kgLSByeSwgY3ggKyByeCwgY3kgKyByeSk7XG4gICAgfVxuICAgIGdldE1hcmtlcnMoKSB7XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdlbGxpcHNlJztcbiAgICB9XG59XG5cbmNsYXNzIExpbmVFbGVtZW50IGV4dGVuZHMgUGF0aEVsZW1lbnQge1xuICAgIGdldFBvaW50cygpIHtcbiAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgIG5ldyBQb2ludCh0aGlzLmdldEF0dHJpYnV0ZSgneDEnKS5nZXRQaXhlbHMoJ3gnKSwgdGhpcy5nZXRBdHRyaWJ1dGUoJ3kxJykuZ2V0UGl4ZWxzKCd5JykpLFxuICAgICAgICAgICAgbmV3IFBvaW50KHRoaXMuZ2V0QXR0cmlidXRlKCd4MicpLmdldFBpeGVscygneCcpLCB0aGlzLmdldEF0dHJpYnV0ZSgneTInKS5nZXRQaXhlbHMoJ3knKSlcbiAgICAgICAgXTtcbiAgICB9XG4gICAgcGF0aChjdHgpIHtcbiAgICAgICAgY29uc3QgW3sgeDogeDAgLCB5OiB5MCAgfSwgeyB4OiB4MSAsIHk6IHkxICB9XSA9IHRoaXMuZ2V0UG9pbnRzKCk7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oeDAsIHkwKTtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oeDEsIHkxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IEJvdW5kaW5nQm94KHgwLCB5MCwgeDEsIHkxKTtcbiAgICB9XG4gICAgZ2V0TWFya2VycygpIHtcbiAgICAgICAgY29uc3QgW3AwLCBwMV0gPSB0aGlzLmdldFBvaW50cygpO1xuICAgICAgICBjb25zdCBhID0gcDAuYW5nbGVUbyhwMSk7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBbXG4gICAgICAgICAgICAgICAgcDAsXG4gICAgICAgICAgICAgICAgYVxuICAgICAgICAgICAgXSxcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICBwMSxcbiAgICAgICAgICAgICAgICBhXG4gICAgICAgICAgICBdXG4gICAgICAgIF07XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2xpbmUnO1xuICAgIH1cbn1cblxuY2xhc3MgUG9seWxpbmVFbGVtZW50IGV4dGVuZHMgUGF0aEVsZW1lbnQge1xuICAgIHBhdGgoY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgcG9pbnRzICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgW3sgeDogeDAgLCB5OiB5MCAgfV0gPSBwb2ludHM7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nQm94ID0gbmV3IEJvdW5kaW5nQm94KHgwLCB5MCk7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGN0eC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGN0eC5tb3ZlVG8oeDAsIHkwKTtcbiAgICAgICAgfVxuICAgICAgICBwb2ludHMuZm9yRWFjaCgocGFyYW0pPT57XG4gICAgICAgICAgICBsZXQgeyB4ICwgeSAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgYm91bmRpbmdCb3guYWRkUG9pbnQoeCwgeSk7XG4gICAgICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICAgICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZGluZ0JveDtcbiAgICB9XG4gICAgZ2V0TWFya2VycygpIHtcbiAgICAgICAgY29uc3QgeyBwb2ludHMgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBsYXN0SW5kZXggPSBwb2ludHMubGVuZ3RoIC0gMTtcbiAgICAgICAgY29uc3QgbWFya2VycyA9IFtdO1xuICAgICAgICBwb2ludHMuZm9yRWFjaCgocG9pbnQsIGkpPT57XG4gICAgICAgICAgICBpZiAoaSA9PT0gbGFzdEluZGV4KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWFya2Vycy5wdXNoKFtcbiAgICAgICAgICAgICAgICBwb2ludCxcbiAgICAgICAgICAgICAgICBwb2ludC5hbmdsZVRvKHBvaW50c1tpICsgMV0pXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmIChtYXJrZXJzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIG1hcmtlcnMucHVzaChbXG4gICAgICAgICAgICAgICAgcG9pbnRzW3BvaW50cy5sZW5ndGggLSAxXSxcbiAgICAgICAgICAgICAgICBtYXJrZXJzW21hcmtlcnMubGVuZ3RoIC0gMV1bMV1cbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtYXJrZXJzO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyl7XG4gICAgICAgIHN1cGVyKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3BvbHlsaW5lJztcbiAgICAgICAgdGhpcy5wb2ludHMgPSBbXTtcbiAgICAgICAgdGhpcy5wb2ludHMgPSBQb2ludC5wYXJzZVBhdGgodGhpcy5nZXRBdHRyaWJ1dGUoJ3BvaW50cycpLmdldFN0cmluZygpKTtcbiAgICB9XG59XG5cbmNsYXNzIFBvbHlnb25FbGVtZW50IGV4dGVuZHMgUG9seWxpbmVFbGVtZW50IHtcbiAgICBwYXRoKGN0eCkge1xuICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IHN1cGVyLnBhdGgoY3R4KTtcbiAgICAgICAgY29uc3QgW3sgeCAsIHkgIH1dID0gdGhpcy5wb2ludHM7XG4gICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgIGN0eC5saW5lVG8oeCwgeSk7XG4gICAgICAgICAgICBjdHguY2xvc2VQYXRoKCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGJvdW5kaW5nQm94O1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdwb2x5Z29uJztcbiAgICB9XG59XG5cbmNsYXNzIFBhdHRlcm5FbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY3JlYXRlUGF0dGVybihjdHgsIF8sIHBhcmVudE9wYWNpdHlQcm9wKSB7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5nZXRTdHlsZSgnd2lkdGgnKS5nZXRQaXhlbHMoJ3gnLCB0cnVlKTtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nZXRTdHlsZSgnaGVpZ2h0JykuZ2V0UGl4ZWxzKCd5JywgdHJ1ZSk7XG4gICAgICAgIC8vIHJlbmRlciBtZSB1c2luZyBhIHRlbXBvcmFyeSBzdmcgZWxlbWVudFxuICAgICAgICBjb25zdCBwYXR0ZXJuU3ZnID0gbmV3IFNWR0VsZW1lbnQodGhpcy5kb2N1bWVudCwgbnVsbCk7XG4gICAgICAgIHBhdHRlcm5TdmcuYXR0cmlidXRlcy52aWV3Qm94ID0gbmV3IFByb3BlcnR5KHRoaXMuZG9jdW1lbnQsICd2aWV3Qm94JywgdGhpcy5nZXRBdHRyaWJ1dGUoJ3ZpZXdCb3gnKS5nZXRWYWx1ZSgpKTtcbiAgICAgICAgcGF0dGVyblN2Zy5hdHRyaWJ1dGVzLndpZHRoID0gbmV3IFByb3BlcnR5KHRoaXMuZG9jdW1lbnQsICd3aWR0aCcsIFwiXCIuY29uY2F0KHdpZHRoLCBcInB4XCIpKTtcbiAgICAgICAgcGF0dGVyblN2Zy5hdHRyaWJ1dGVzLmhlaWdodCA9IG5ldyBQcm9wZXJ0eSh0aGlzLmRvY3VtZW50LCAnaGVpZ2h0JywgXCJcIi5jb25jYXQoaGVpZ2h0LCBcInB4XCIpKTtcbiAgICAgICAgcGF0dGVyblN2Zy5hdHRyaWJ1dGVzLnRyYW5zZm9ybSA9IG5ldyBQcm9wZXJ0eSh0aGlzLmRvY3VtZW50LCAndHJhbnNmb3JtJywgdGhpcy5nZXRBdHRyaWJ1dGUoJ3BhdHRlcm5UcmFuc2Zvcm0nKS5nZXRWYWx1ZSgpKTtcbiAgICAgICAgcGF0dGVyblN2Zy5jaGlsZHJlbiA9IHRoaXMuY2hpbGRyZW47XG4gICAgICAgIGNvbnN0IHBhdHRlcm5DYW52YXMgPSB0aGlzLmRvY3VtZW50LmNyZWF0ZUNhbnZhcyh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgY29uc3QgcGF0dGVybkN0eCA9IHBhdHRlcm5DYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgY29uc3QgeEF0dHIgPSB0aGlzLmdldEF0dHJpYnV0ZSgneCcpO1xuICAgICAgICBjb25zdCB5QXR0ciA9IHRoaXMuZ2V0QXR0cmlidXRlKCd5Jyk7XG4gICAgICAgIGlmICh4QXR0ci5oYXNWYWx1ZSgpICYmIHlBdHRyLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHBhdHRlcm5DdHgudHJhbnNsYXRlKHhBdHRyLmdldFBpeGVscygneCcsIHRydWUpLCB5QXR0ci5nZXRQaXhlbHMoJ3knLCB0cnVlKSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHBhcmVudE9wYWNpdHlQcm9wLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3R5bGVzWydmaWxsLW9wYWNpdHknXSA9IHBhcmVudE9wYWNpdHlQcm9wO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgUmVmbGVjdC5kZWxldGVQcm9wZXJ0eSh0aGlzLnN0eWxlcywgJ2ZpbGwtb3BhY2l0eScpO1xuICAgICAgICB9XG4gICAgICAgIC8vIHJlbmRlciAzeDMgZ3JpZCBzbyB3aGVuIHdlIHRyYW5zZm9ybSB0aGVyZSdzIG5vIHdoaXRlIHNwYWNlIG9uIGVkZ2VzXG4gICAgICAgIGZvcihsZXQgeCA9IC0xOyB4IDw9IDE7IHgrKyl7XG4gICAgICAgICAgICBmb3IobGV0IHkgPSAtMTsgeSA8PSAxOyB5Kyspe1xuICAgICAgICAgICAgICAgIHBhdHRlcm5DdHguc2F2ZSgpO1xuICAgICAgICAgICAgICAgIHBhdHRlcm5TdmcuYXR0cmlidXRlcy54ID0gbmV3IFByb3BlcnR5KHRoaXMuZG9jdW1lbnQsICd4JywgeCAqIHBhdHRlcm5DYW52YXMud2lkdGgpO1xuICAgICAgICAgICAgICAgIHBhdHRlcm5TdmcuYXR0cmlidXRlcy55ID0gbmV3IFByb3BlcnR5KHRoaXMuZG9jdW1lbnQsICd5JywgeSAqIHBhdHRlcm5DYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuU3ZnLnJlbmRlcihwYXR0ZXJuQ3R4KTtcbiAgICAgICAgICAgICAgICBwYXR0ZXJuQ3R4LnJlc3RvcmUoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBjb25zdCBwYXR0ZXJuID0gY3R4LmNyZWF0ZVBhdHRlcm4ocGF0dGVybkNhbnZhcywgJ3JlcGVhdCcpO1xuICAgICAgICByZXR1cm4gcGF0dGVybjtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnR5cGUgPSAncGF0dGVybic7XG4gICAgfVxufVxuXG5jbGFzcyBNYXJrZXJFbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgcmVuZGVyKGN0eCwgcG9pbnQsIGFuZ2xlKSB7XG4gICAgICAgIGlmICghcG9pbnQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IHggLCB5ICB9ID0gcG9pbnQ7XG4gICAgICAgIGNvbnN0IG9yaWVudCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdvcmllbnQnKS5nZXRTdHJpbmcoJ2F1dG8nKTtcbiAgICAgICAgY29uc3QgbWFya2VyVW5pdHMgPSB0aGlzLmdldEF0dHJpYnV0ZSgnbWFya2VyVW5pdHMnKS5nZXRTdHJpbmcoJ3N0cm9rZVdpZHRoJyk7XG4gICAgICAgIGN0eC50cmFuc2xhdGUoeCwgeSk7XG4gICAgICAgIGlmIChvcmllbnQgPT09ICdhdXRvJykge1xuICAgICAgICAgICAgY3R4LnJvdGF0ZShhbmdsZSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG1hcmtlclVuaXRzID09PSAnc3Ryb2tlV2lkdGgnKSB7XG4gICAgICAgICAgICBjdHguc2NhbGUoY3R4LmxpbmVXaWR0aCwgY3R4LmxpbmVXaWR0aCk7XG4gICAgICAgIH1cbiAgICAgICAgY3R4LnNhdmUoKTtcbiAgICAgICAgLy8gcmVuZGVyIG1lIHVzaW5nIGEgdGVtcG9yYXJ5IHN2ZyBlbGVtZW50XG4gICAgICAgIGNvbnN0IG1hcmtlclN2ZyA9IG5ldyBTVkdFbGVtZW50KHRoaXMuZG9jdW1lbnQpO1xuICAgICAgICBtYXJrZXJTdmcudHlwZSA9IHRoaXMudHlwZTtcbiAgICAgICAgbWFya2VyU3ZnLmF0dHJpYnV0ZXMudmlld0JveCA9IG5ldyBQcm9wZXJ0eSh0aGlzLmRvY3VtZW50LCAndmlld0JveCcsIHRoaXMuZ2V0QXR0cmlidXRlKCd2aWV3Qm94JykuZ2V0VmFsdWUoKSk7XG4gICAgICAgIG1hcmtlclN2Zy5hdHRyaWJ1dGVzLnJlZlggPSBuZXcgUHJvcGVydHkodGhpcy5kb2N1bWVudCwgJ3JlZlgnLCB0aGlzLmdldEF0dHJpYnV0ZSgncmVmWCcpLmdldFZhbHVlKCkpO1xuICAgICAgICBtYXJrZXJTdmcuYXR0cmlidXRlcy5yZWZZID0gbmV3IFByb3BlcnR5KHRoaXMuZG9jdW1lbnQsICdyZWZZJywgdGhpcy5nZXRBdHRyaWJ1dGUoJ3JlZlknKS5nZXRWYWx1ZSgpKTtcbiAgICAgICAgbWFya2VyU3ZnLmF0dHJpYnV0ZXMud2lkdGggPSBuZXcgUHJvcGVydHkodGhpcy5kb2N1bWVudCwgJ3dpZHRoJywgdGhpcy5nZXRBdHRyaWJ1dGUoJ21hcmtlcldpZHRoJykuZ2V0VmFsdWUoKSk7XG4gICAgICAgIG1hcmtlclN2Zy5hdHRyaWJ1dGVzLmhlaWdodCA9IG5ldyBQcm9wZXJ0eSh0aGlzLmRvY3VtZW50LCAnaGVpZ2h0JywgdGhpcy5nZXRBdHRyaWJ1dGUoJ21hcmtlckhlaWdodCcpLmdldFZhbHVlKCkpO1xuICAgICAgICBtYXJrZXJTdmcuYXR0cmlidXRlcy5vdmVyZmxvdyA9IG5ldyBQcm9wZXJ0eSh0aGlzLmRvY3VtZW50LCAnb3ZlcmZsb3cnLCB0aGlzLmdldEF0dHJpYnV0ZSgnb3ZlcmZsb3cnKS5nZXRWYWx1ZSgpKTtcbiAgICAgICAgbWFya2VyU3ZnLmF0dHJpYnV0ZXMuZmlsbCA9IG5ldyBQcm9wZXJ0eSh0aGlzLmRvY3VtZW50LCAnZmlsbCcsIHRoaXMuZ2V0QXR0cmlidXRlKCdmaWxsJykuZ2V0Q29sb3IoJ2JsYWNrJykpO1xuICAgICAgICBtYXJrZXJTdmcuYXR0cmlidXRlcy5zdHJva2UgPSBuZXcgUHJvcGVydHkodGhpcy5kb2N1bWVudCwgJ3N0cm9rZScsIHRoaXMuZ2V0QXR0cmlidXRlKCdzdHJva2UnKS5nZXRWYWx1ZSgnbm9uZScpKTtcbiAgICAgICAgbWFya2VyU3ZnLmNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbjtcbiAgICAgICAgbWFya2VyU3ZnLnJlbmRlcihjdHgpO1xuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgICAgICBpZiAobWFya2VyVW5pdHMgPT09ICdzdHJva2VXaWR0aCcpIHtcbiAgICAgICAgICAgIGN0eC5zY2FsZSgxIC8gY3R4LmxpbmVXaWR0aCwgMSAvIGN0eC5saW5lV2lkdGgpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChvcmllbnQgPT09ICdhdXRvJykge1xuICAgICAgICAgICAgY3R4LnJvdGF0ZSgtYW5nbGUpO1xuICAgICAgICB9XG4gICAgICAgIGN0eC50cmFuc2xhdGUoLXgsIC15KTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnbWFya2VyJztcbiAgICB9XG59XG5cbmNsYXNzIERlZnNFbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgcmVuZGVyKCkge1xuICAgIC8vIE5PT1BcbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnZGVmcyc7XG4gICAgfVxufVxuXG5jbGFzcyBHRWxlbWVudCBleHRlbmRzIFJlbmRlcmVkRWxlbWVudCB7XG4gICAgZ2V0Qm91bmRpbmdCb3goY3R4KSB7XG4gICAgICAgIGNvbnN0IGJvdW5kaW5nQm94ID0gbmV3IEJvdW5kaW5nQm94KCk7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpPT57XG4gICAgICAgICAgICBib3VuZGluZ0JveC5hZGRCb3VuZGluZ0JveChjaGlsZC5nZXRCb3VuZGluZ0JveChjdHgpKTtcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiBib3VuZGluZ0JveDtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnZyc7XG4gICAgfVxufVxuXG5jbGFzcyBHcmFkaWVudEVsZW1lbnQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBnZXRHcmFkaWVudFVuaXRzKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5nZXRBdHRyaWJ1dGUoJ2dyYWRpZW50VW5pdHMnKS5nZXRTdHJpbmcoJ29iamVjdEJvdW5kaW5nQm94Jyk7XG4gICAgfVxuICAgIGNyZWF0ZUdyYWRpZW50KGN0eCwgZWxlbWVudCwgcGFyZW50T3BhY2l0eVByb3ApIHtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby10aGlzLWFsaWFzLCBjb25zaXN0ZW50LXRoaXNcbiAgICAgICAgbGV0IHN0b3BzQ29udGFpbmVyID0gdGhpcztcbiAgICAgICAgaWYgKHRoaXMuZ2V0SHJlZkF0dHJpYnV0ZSgpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHN0b3BzQ29udGFpbmVyID0gdGhpcy5nZXRIcmVmQXR0cmlidXRlKCkuZ2V0RGVmaW5pdGlvbigpO1xuICAgICAgICAgICAgdGhpcy5pbmhlcml0U3RvcENvbnRhaW5lcihzdG9wc0NvbnRhaW5lcik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgeyBzdG9wcyAgfSA9IHN0b3BzQ29udGFpbmVyO1xuICAgICAgICBjb25zdCBncmFkaWVudCA9IHRoaXMuZ2V0R3JhZGllbnQoY3R4LCBlbGVtZW50KTtcbiAgICAgICAgaWYgKCFncmFkaWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYWRkUGFyZW50T3BhY2l0eShwYXJlbnRPcGFjaXR5UHJvcCwgc3RvcHNbc3RvcHMubGVuZ3RoIC0gMV0uY29sb3IpO1xuICAgICAgICB9XG4gICAgICAgIHN0b3BzLmZvckVhY2goKHN0b3ApPT57XG4gICAgICAgICAgICBncmFkaWVudC5hZGRDb2xvclN0b3Aoc3RvcC5vZmZzZXQsIHRoaXMuYWRkUGFyZW50T3BhY2l0eShwYXJlbnRPcGFjaXR5UHJvcCwgc3RvcC5jb2xvcikpO1xuICAgICAgICB9KTtcbiAgICAgICAgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKCdncmFkaWVudFRyYW5zZm9ybScpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIC8vIHJlbmRlciBhcyB0cmFuc2Zvcm1lZCBwYXR0ZXJuIG9uIHRlbXBvcmFyeSBjYW52YXNcbiAgICAgICAgICAgIGNvbnN0IHsgZG9jdW1lbnQgIH0gPSB0aGlzO1xuICAgICAgICAgICAgY29uc3QgeyBNQVhfVklSVFVBTF9QSVhFTFMgIH0gPSBTY3JlZW47XG4gICAgICAgICAgICBjb25zdCB7IHZpZXdQb3J0ICB9ID0gZG9jdW1lbnQuc2NyZWVuO1xuICAgICAgICAgICAgY29uc3Qgcm9vdFZpZXcgPSB2aWV3UG9ydC5nZXRSb290KCk7XG4gICAgICAgICAgICBjb25zdCByZWN0ID0gbmV3IFJlY3RFbGVtZW50KGRvY3VtZW50KTtcbiAgICAgICAgICAgIHJlY3QuYXR0cmlidXRlcy54ID0gbmV3IFByb3BlcnR5KGRvY3VtZW50LCAneCcsIC1NQVhfVklSVFVBTF9QSVhFTFMgLyAzKTtcbiAgICAgICAgICAgIHJlY3QuYXR0cmlidXRlcy55ID0gbmV3IFByb3BlcnR5KGRvY3VtZW50LCAneScsIC1NQVhfVklSVFVBTF9QSVhFTFMgLyAzKTtcbiAgICAgICAgICAgIHJlY3QuYXR0cmlidXRlcy53aWR0aCA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ3dpZHRoJywgTUFYX1ZJUlRVQUxfUElYRUxTKTtcbiAgICAgICAgICAgIHJlY3QuYXR0cmlidXRlcy5oZWlnaHQgPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsICdoZWlnaHQnLCBNQVhfVklSVFVBTF9QSVhFTFMpO1xuICAgICAgICAgICAgY29uc3QgZ3JvdXAgPSBuZXcgR0VsZW1lbnQoZG9jdW1lbnQpO1xuICAgICAgICAgICAgZ3JvdXAuYXR0cmlidXRlcy50cmFuc2Zvcm0gPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsICd0cmFuc2Zvcm0nLCB0aGlzLmdldEF0dHJpYnV0ZSgnZ3JhZGllbnRUcmFuc2Zvcm0nKS5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIGdyb3VwLmNoaWxkcmVuID0gW1xuICAgICAgICAgICAgICAgIHJlY3RcbiAgICAgICAgICAgIF07XG4gICAgICAgICAgICBjb25zdCBwYXR0ZXJuU3ZnID0gbmV3IFNWR0VsZW1lbnQoZG9jdW1lbnQpO1xuICAgICAgICAgICAgcGF0dGVyblN2Zy5hdHRyaWJ1dGVzLnggPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsICd4JywgMCk7XG4gICAgICAgICAgICBwYXR0ZXJuU3ZnLmF0dHJpYnV0ZXMueSA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ3knLCAwKTtcbiAgICAgICAgICAgIHBhdHRlcm5TdmcuYXR0cmlidXRlcy53aWR0aCA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ3dpZHRoJywgcm9vdFZpZXcud2lkdGgpO1xuICAgICAgICAgICAgcGF0dGVyblN2Zy5hdHRyaWJ1dGVzLmhlaWdodCA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ2hlaWdodCcsIHJvb3RWaWV3LmhlaWdodCk7XG4gICAgICAgICAgICBwYXR0ZXJuU3ZnLmNoaWxkcmVuID0gW1xuICAgICAgICAgICAgICAgIGdyb3VwXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgY29uc3QgcGF0dGVybkNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUNhbnZhcyhyb290Vmlldy53aWR0aCwgcm9vdFZpZXcuaGVpZ2h0KTtcbiAgICAgICAgICAgIGNvbnN0IHBhdHRlcm5DdHggPSBwYXR0ZXJuQ2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICAgICAgICBwYXR0ZXJuQ3R4LmZpbGxTdHlsZSA9IGdyYWRpZW50O1xuICAgICAgICAgICAgcGF0dGVyblN2Zy5yZW5kZXIocGF0dGVybkN0eCk7XG4gICAgICAgICAgICByZXR1cm4gcGF0dGVybkN0eC5jcmVhdGVQYXR0ZXJuKHBhdHRlcm5DYW52YXMsICduby1yZXBlYXQnKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gZ3JhZGllbnQ7XG4gICAgfVxuICAgIGluaGVyaXRTdG9wQ29udGFpbmVyKHN0b3BzQ29udGFpbmVyKSB7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1RvSW5oZXJpdC5mb3JFYWNoKChhdHRyaWJ1dGVUb0luaGVyaXQpPT57XG4gICAgICAgICAgICBpZiAoIXRoaXMuZ2V0QXR0cmlidXRlKGF0dHJpYnV0ZVRvSW5oZXJpdCkuaGFzVmFsdWUoKSAmJiBzdG9wc0NvbnRhaW5lci5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlVG9Jbmhlcml0KS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlVG9Jbmhlcml0LCB0cnVlKS5zZXRWYWx1ZShzdG9wc0NvbnRhaW5lci5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlVG9Jbmhlcml0KS5nZXRWYWx1ZSgpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIGFkZFBhcmVudE9wYWNpdHkocGFyZW50T3BhY2l0eVByb3AsIGNvbG9yKSB7XG4gICAgICAgIGlmIChwYXJlbnRPcGFjaXR5UHJvcC5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBjb25zdCBjb2xvclByb3AgPSBuZXcgUHJvcGVydHkodGhpcy5kb2N1bWVudCwgJ2NvbG9yJywgY29sb3IpO1xuICAgICAgICAgICAgcmV0dXJuIGNvbG9yUHJvcC5hZGRPcGFjaXR5KHBhcmVudE9wYWNpdHlQcm9wKS5nZXRDb2xvcigpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBjb2xvcjtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpe1xuICAgICAgICBzdXBlcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyk7XG4gICAgICAgIHRoaXMuYXR0cmlidXRlc1RvSW5oZXJpdCA9IFtcbiAgICAgICAgICAgICdncmFkaWVudFVuaXRzJ1xuICAgICAgICBdO1xuICAgICAgICB0aGlzLnN0b3BzID0gW107XG4gICAgICAgIGNvbnN0IHsgc3RvcHMgLCBjaGlsZHJlbiAgfSA9IHRoaXM7XG4gICAgICAgIGNoaWxkcmVuLmZvckVhY2goKGNoaWxkKT0+e1xuICAgICAgICAgICAgaWYgKGNoaWxkLnR5cGUgPT09ICdzdG9wJykge1xuICAgICAgICAgICAgICAgIHN0b3BzLnB1c2goY2hpbGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG59XG5cbmNsYXNzIExpbmVhckdyYWRpZW50RWxlbWVudCBleHRlbmRzIEdyYWRpZW50RWxlbWVudCB7XG4gICAgZ2V0R3JhZGllbnQoY3R4LCBlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGlzQm91bmRpbmdCb3hVbml0cyA9IHRoaXMuZ2V0R3JhZGllbnRVbml0cygpID09PSAnb2JqZWN0Qm91bmRpbmdCb3gnO1xuICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IGlzQm91bmRpbmdCb3hVbml0cyA/IGVsZW1lbnQuZ2V0Qm91bmRpbmdCb3goY3R4KSA6IG51bGw7XG4gICAgICAgIGlmIChpc0JvdW5kaW5nQm94VW5pdHMgJiYgIWJvdW5kaW5nQm94KSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIXRoaXMuZ2V0QXR0cmlidXRlKCd4MScpLmhhc1ZhbHVlKCkgJiYgIXRoaXMuZ2V0QXR0cmlidXRlKCd5MScpLmhhc1ZhbHVlKCkgJiYgIXRoaXMuZ2V0QXR0cmlidXRlKCd4MicpLmhhc1ZhbHVlKCkgJiYgIXRoaXMuZ2V0QXR0cmlidXRlKCd5MicpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIHRoaXMuZ2V0QXR0cmlidXRlKCd4MScsIHRydWUpLnNldFZhbHVlKDApO1xuICAgICAgICAgICAgdGhpcy5nZXRBdHRyaWJ1dGUoJ3kxJywgdHJ1ZSkuc2V0VmFsdWUoMCk7XG4gICAgICAgICAgICB0aGlzLmdldEF0dHJpYnV0ZSgneDInLCB0cnVlKS5zZXRWYWx1ZSgxKTtcbiAgICAgICAgICAgIHRoaXMuZ2V0QXR0cmlidXRlKCd5MicsIHRydWUpLnNldFZhbHVlKDApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHgxID0gaXNCb3VuZGluZ0JveFVuaXRzID8gYm91bmRpbmdCb3gueCArIGJvdW5kaW5nQm94LndpZHRoICogdGhpcy5nZXRBdHRyaWJ1dGUoJ3gxJykuZ2V0TnVtYmVyKCkgOiB0aGlzLmdldEF0dHJpYnV0ZSgneDEnKS5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgY29uc3QgeTEgPSBpc0JvdW5kaW5nQm94VW5pdHMgPyBib3VuZGluZ0JveC55ICsgYm91bmRpbmdCb3guaGVpZ2h0ICogdGhpcy5nZXRBdHRyaWJ1dGUoJ3kxJykuZ2V0TnVtYmVyKCkgOiB0aGlzLmdldEF0dHJpYnV0ZSgneTEnKS5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgY29uc3QgeDIgPSBpc0JvdW5kaW5nQm94VW5pdHMgPyBib3VuZGluZ0JveC54ICsgYm91bmRpbmdCb3gud2lkdGggKiB0aGlzLmdldEF0dHJpYnV0ZSgneDInKS5nZXROdW1iZXIoKSA6IHRoaXMuZ2V0QXR0cmlidXRlKCd4MicpLmdldFBpeGVscygneCcpO1xuICAgICAgICBjb25zdCB5MiA9IGlzQm91bmRpbmdCb3hVbml0cyA/IGJvdW5kaW5nQm94LnkgKyBib3VuZGluZ0JveC5oZWlnaHQgKiB0aGlzLmdldEF0dHJpYnV0ZSgneTInKS5nZXROdW1iZXIoKSA6IHRoaXMuZ2V0QXR0cmlidXRlKCd5MicpLmdldFBpeGVscygneScpO1xuICAgICAgICBpZiAoeDEgPT09IHgyICYmIHkxID09PSB5Mikge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGN0eC5jcmVhdGVMaW5lYXJHcmFkaWVudCh4MSwgeTEsIHgyLCB5Mik7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKXtcbiAgICAgICAgc3VwZXIoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnbGluZWFyR3JhZGllbnQnO1xuICAgICAgICB0aGlzLmF0dHJpYnV0ZXNUb0luaGVyaXQucHVzaCgneDEnLCAneTEnLCAneDInLCAneTInKTtcbiAgICB9XG59XG5cbmNsYXNzIFJhZGlhbEdyYWRpZW50RWxlbWVudCBleHRlbmRzIEdyYWRpZW50RWxlbWVudCB7XG4gICAgZ2V0R3JhZGllbnQoY3R4LCBlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IGlzQm91bmRpbmdCb3hVbml0cyA9IHRoaXMuZ2V0R3JhZGllbnRVbml0cygpID09PSAnb2JqZWN0Qm91bmRpbmdCb3gnO1xuICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IGVsZW1lbnQuZ2V0Qm91bmRpbmdCb3goY3R4KTtcbiAgICAgICAgaWYgKGlzQm91bmRpbmdCb3hVbml0cyAmJiAhYm91bmRpbmdCb3gpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5nZXRBdHRyaWJ1dGUoJ2N4JykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgdGhpcy5nZXRBdHRyaWJ1dGUoJ2N4JywgdHJ1ZSkuc2V0VmFsdWUoJzUwJScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5nZXRBdHRyaWJ1dGUoJ2N5JykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgdGhpcy5nZXRBdHRyaWJ1dGUoJ2N5JywgdHJ1ZSkuc2V0VmFsdWUoJzUwJScpO1xuICAgICAgICB9XG4gICAgICAgIGlmICghdGhpcy5nZXRBdHRyaWJ1dGUoJ3InKS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICB0aGlzLmdldEF0dHJpYnV0ZSgncicsIHRydWUpLnNldFZhbHVlKCc1MCUnKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBjeCA9IGlzQm91bmRpbmdCb3hVbml0cyA/IGJvdW5kaW5nQm94LnggKyBib3VuZGluZ0JveC53aWR0aCAqIHRoaXMuZ2V0QXR0cmlidXRlKCdjeCcpLmdldE51bWJlcigpIDogdGhpcy5nZXRBdHRyaWJ1dGUoJ2N4JykuZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGNvbnN0IGN5ID0gaXNCb3VuZGluZ0JveFVuaXRzID8gYm91bmRpbmdCb3gueSArIGJvdW5kaW5nQm94LmhlaWdodCAqIHRoaXMuZ2V0QXR0cmlidXRlKCdjeScpLmdldE51bWJlcigpIDogdGhpcy5nZXRBdHRyaWJ1dGUoJ2N5JykuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgIGxldCBmeCA9IGN4O1xuICAgICAgICBsZXQgZnkgPSBjeTtcbiAgICAgICAgaWYgKHRoaXMuZ2V0QXR0cmlidXRlKCdmeCcpLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIGZ4ID0gaXNCb3VuZGluZ0JveFVuaXRzID8gYm91bmRpbmdCb3gueCArIGJvdW5kaW5nQm94LndpZHRoICogdGhpcy5nZXRBdHRyaWJ1dGUoJ2Z4JykuZ2V0TnVtYmVyKCkgOiB0aGlzLmdldEF0dHJpYnV0ZSgnZngnKS5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoJ2Z5JykuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgZnkgPSBpc0JvdW5kaW5nQm94VW5pdHMgPyBib3VuZGluZ0JveC55ICsgYm91bmRpbmdCb3guaGVpZ2h0ICogdGhpcy5nZXRBdHRyaWJ1dGUoJ2Z5JykuZ2V0TnVtYmVyKCkgOiB0aGlzLmdldEF0dHJpYnV0ZSgnZnknKS5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCByID0gaXNCb3VuZGluZ0JveFVuaXRzID8gKGJvdW5kaW5nQm94LndpZHRoICsgYm91bmRpbmdCb3guaGVpZ2h0KSAvIDIgKiB0aGlzLmdldEF0dHJpYnV0ZSgncicpLmdldE51bWJlcigpIDogdGhpcy5nZXRBdHRyaWJ1dGUoJ3InKS5nZXRQaXhlbHMoKTtcbiAgICAgICAgY29uc3QgZnIgPSB0aGlzLmdldEF0dHJpYnV0ZSgnZnInKS5nZXRQaXhlbHMoKTtcbiAgICAgICAgcmV0dXJuIGN0eC5jcmVhdGVSYWRpYWxHcmFkaWVudChmeCwgZnksIGZyLCBjeCwgY3ksIHIpO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyl7XG4gICAgICAgIHN1cGVyKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3JhZGlhbEdyYWRpZW50JztcbiAgICAgICAgdGhpcy5hdHRyaWJ1dGVzVG9Jbmhlcml0LnB1c2goJ2N4JywgJ2N5JywgJ3InLCAnZngnLCAnZnknLCAnZnInKTtcbiAgICB9XG59XG5cbmNsYXNzIFN0b3BFbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpe1xuICAgICAgICBzdXBlcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdzdG9wJztcbiAgICAgICAgY29uc3Qgb2Zmc2V0ID0gTWF0aC5tYXgoMCwgTWF0aC5taW4oMSwgdGhpcy5nZXRBdHRyaWJ1dGUoJ29mZnNldCcpLmdldE51bWJlcigpKSk7XG4gICAgICAgIGNvbnN0IHN0b3BPcGFjaXR5ID0gdGhpcy5nZXRTdHlsZSgnc3RvcC1vcGFjaXR5Jyk7XG4gICAgICAgIGxldCBzdG9wQ29sb3IgPSB0aGlzLmdldFN0eWxlKCdzdG9wLWNvbG9yJywgdHJ1ZSk7XG4gICAgICAgIGlmIChzdG9wQ29sb3IuZ2V0U3RyaW5nKCkgPT09ICcnKSB7XG4gICAgICAgICAgICBzdG9wQ29sb3Iuc2V0VmFsdWUoJyMwMDAnKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoc3RvcE9wYWNpdHkuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgc3RvcENvbG9yID0gc3RvcENvbG9yLmFkZE9wYWNpdHkoc3RvcE9wYWNpdHkpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMub2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgICB0aGlzLmNvbG9yID0gc3RvcENvbG9yLmdldENvbG9yKCk7XG4gICAgfVxufVxuXG5jbGFzcyBBbmltYXRlRWxlbWVudCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGdldFByb3BlcnR5KCkge1xuICAgICAgICBjb25zdCBhdHRyaWJ1dGVUeXBlID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2F0dHJpYnV0ZVR5cGUnKS5nZXRTdHJpbmcoKTtcbiAgICAgICAgY29uc3QgYXR0cmlidXRlTmFtZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdhdHRyaWJ1dGVOYW1lJykuZ2V0U3RyaW5nKCk7XG4gICAgICAgIGlmIChhdHRyaWJ1dGVUeXBlID09PSAnQ1NTJykge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucGFyZW50LmdldFN0eWxlKGF0dHJpYnV0ZU5hbWUsIHRydWUpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnBhcmVudC5nZXRBdHRyaWJ1dGUoYXR0cmlidXRlTmFtZSwgdHJ1ZSk7XG4gICAgfVxuICAgIGNhbGNWYWx1ZSgpIHtcbiAgICAgICAgY29uc3QgeyBpbml0aWFsVW5pdHMgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7IHByb2dyZXNzICwgZnJvbSAsIHRvICB9ID0gdGhpcy5nZXRQcm9ncmVzcygpO1xuICAgICAgICAvLyB0d2VlbiB2YWx1ZSBsaW5lYXJseVxuICAgICAgICBsZXQgbmV3VmFsdWUgPSBmcm9tLmdldE51bWJlcigpICsgKHRvLmdldE51bWJlcigpIC0gZnJvbS5nZXROdW1iZXIoKSkgKiBwcm9ncmVzcztcbiAgICAgICAgaWYgKGluaXRpYWxVbml0cyA9PT0gJyUnKSB7XG4gICAgICAgICAgICBuZXdWYWx1ZSAqPSAxMDAgLy8gbnVtVmFsdWUoKSByZXR1cm5zIDAtMSB3aGVyZWFzIHByb3BlcnRpZXMgYXJlIDAtMTAwXG4gICAgICAgICAgICA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFwiXCIuY29uY2F0KG5ld1ZhbHVlKS5jb25jYXQoaW5pdGlhbFVuaXRzKTtcbiAgICB9XG4gICAgdXBkYXRlKGRlbHRhKSB7XG4gICAgICAgIGNvbnN0IHsgcGFyZW50ICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgcHJvcCA9IHRoaXMuZ2V0UHJvcGVydHkoKTtcbiAgICAgICAgLy8gc2V0IGluaXRpYWwgdmFsdWVcbiAgICAgICAgaWYgKCF0aGlzLmluaXRpYWxWYWx1ZSkge1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsVmFsdWUgPSBwcm9wLmdldFN0cmluZygpO1xuICAgICAgICAgICAgdGhpcy5pbml0aWFsVW5pdHMgPSBwcm9wLmdldFVuaXRzKCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaWYgd2UncmUgcGFzdCB0aGUgZW5kIHRpbWVcbiAgICAgICAgaWYgKHRoaXMuZHVyYXRpb24gPiB0aGlzLm1heER1cmF0aW9uKSB7XG4gICAgICAgICAgICBjb25zdCBmaWxsID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2ZpbGwnKS5nZXRTdHJpbmcoJ3JlbW92ZScpO1xuICAgICAgICAgICAgLy8gbG9vcCBmb3IgaW5kZWZpbml0ZWx5IHJlcGVhdGluZyBhbmltYXRpb25zXG4gICAgICAgICAgICBpZiAodGhpcy5nZXRBdHRyaWJ1dGUoJ3JlcGVhdENvdW50JykuZ2V0U3RyaW5nKCkgPT09ICdpbmRlZmluaXRlJyB8fCB0aGlzLmdldEF0dHJpYnV0ZSgncmVwZWF0RHVyJykuZ2V0U3RyaW5nKCkgPT09ICdpbmRlZmluaXRlJykge1xuICAgICAgICAgICAgICAgIHRoaXMuZHVyYXRpb24gPSAwO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChmaWxsID09PSAnZnJlZXplJyAmJiAhdGhpcy5mcm96ZW4pIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZyb3plbiA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudCAmJiBwcm9wKSB7XG4gICAgICAgICAgICAgICAgICAgIHBhcmVudC5hbmltYXRpb25Gcm96ZW4gPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICBwYXJlbnQuYW5pbWF0aW9uRnJvemVuVmFsdWUgPSBwcm9wLmdldFN0cmluZygpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZmlsbCA9PT0gJ3JlbW92ZScgJiYgIXRoaXMucmVtb3ZlZCkge1xuICAgICAgICAgICAgICAgIHRoaXMucmVtb3ZlZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgaWYgKHBhcmVudCAmJiBwcm9wKSB7XG4gICAgICAgICAgICAgICAgICAgIHByb3Auc2V0VmFsdWUocGFyZW50LmFuaW1hdGlvbkZyb3plbiA/IHBhcmVudC5hbmltYXRpb25Gcm96ZW5WYWx1ZSA6IHRoaXMuaW5pdGlhbFZhbHVlKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5kdXJhdGlvbiArPSBkZWx0YTtcbiAgICAgICAgLy8gaWYgd2UncmUgcGFzdCB0aGUgYmVnaW4gdGltZVxuICAgICAgICBsZXQgdXBkYXRlZCA9IGZhbHNlO1xuICAgICAgICBpZiAodGhpcy5iZWdpbiA8IHRoaXMuZHVyYXRpb24pIHtcbiAgICAgICAgICAgIGxldCBuZXdWYWx1ZSA9IHRoaXMuY2FsY1ZhbHVlKCkgLy8gdHdlZW5cbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIGNvbnN0IHR5cGVBdHRyID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3R5cGUnKTtcbiAgICAgICAgICAgIGlmICh0eXBlQXR0ci5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgLy8gZm9yIHRyYW5zZm9ybSwgZXRjLlxuICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSB0eXBlQXR0ci5nZXRTdHJpbmcoKTtcbiAgICAgICAgICAgICAgICBuZXdWYWx1ZSA9IFwiXCIuY29uY2F0KHR5cGUsIFwiKFwiKS5jb25jYXQobmV3VmFsdWUsIFwiKVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHByb3Auc2V0VmFsdWUobmV3VmFsdWUpO1xuICAgICAgICAgICAgdXBkYXRlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHVwZGF0ZWQ7XG4gICAgfVxuICAgIGdldFByb2dyZXNzKCkge1xuICAgICAgICBjb25zdCB7IGRvY3VtZW50ICwgdmFsdWVzICB9ID0gdGhpcztcbiAgICAgICAgbGV0IHByb2dyZXNzID0gKHRoaXMuZHVyYXRpb24gLSB0aGlzLmJlZ2luKSAvICh0aGlzLm1heER1cmF0aW9uIC0gdGhpcy5iZWdpbik7XG4gICAgICAgIGxldCBmcm9tO1xuICAgICAgICBsZXQgdG87XG4gICAgICAgIGlmICh2YWx1ZXMuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgY29uc3QgcCA9IHByb2dyZXNzICogKHZhbHVlcy5nZXRWYWx1ZSgpLmxlbmd0aCAtIDEpO1xuICAgICAgICAgICAgY29uc3QgbGIgPSBNYXRoLmZsb29yKHApO1xuICAgICAgICAgICAgY29uc3QgdWIgPSBNYXRoLmNlaWwocCk7XG4gICAgICAgICAgICBsZXQgdmFsdWU7XG4gICAgICAgICAgICB2YWx1ZSA9IHZhbHVlcy5nZXRWYWx1ZSgpW2xiXTtcbiAgICAgICAgICAgIGZyb20gPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsICdmcm9tJywgdmFsdWUgPyBwYXJzZUZsb2F0KHZhbHVlKSA6IDApO1xuICAgICAgICAgICAgdmFsdWUgPSB2YWx1ZXMuZ2V0VmFsdWUoKVt1Yl07XG4gICAgICAgICAgICB0byA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ3RvJywgdmFsdWUgPyBwYXJzZUZsb2F0KHZhbHVlKSA6IDApO1xuICAgICAgICAgICAgcHJvZ3Jlc3MgPSAocCAtIGxiKSAvICh1YiAtIGxiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGZyb20gPSB0aGlzLmZyb207XG4gICAgICAgICAgICB0byA9IHRoaXMudG87XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHByb2dyZXNzLFxuICAgICAgICAgICAgZnJvbSxcbiAgICAgICAgICAgIHRvXG4gICAgICAgIH07XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKXtcbiAgICAgICAgc3VwZXIoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnYW5pbWF0ZSc7XG4gICAgICAgIHRoaXMuZHVyYXRpb24gPSAwO1xuICAgICAgICB0aGlzLmluaXRpYWxVbml0cyA9ICcnO1xuICAgICAgICB0aGlzLnJlbW92ZWQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5mcm96ZW4gPSBmYWxzZTtcbiAgICAgICAgZG9jdW1lbnQuc2NyZWVuLmFuaW1hdGlvbnMucHVzaCh0aGlzKTtcbiAgICAgICAgdGhpcy5iZWdpbiA9IHRoaXMuZ2V0QXR0cmlidXRlKCdiZWdpbicpLmdldE1pbGxpc2Vjb25kcygpO1xuICAgICAgICB0aGlzLm1heER1cmF0aW9uID0gdGhpcy5iZWdpbiArIHRoaXMuZ2V0QXR0cmlidXRlKCdkdXInKS5nZXRNaWxsaXNlY29uZHMoKTtcbiAgICAgICAgdGhpcy5mcm9tID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2Zyb20nKTtcbiAgICAgICAgdGhpcy50byA9IHRoaXMuZ2V0QXR0cmlidXRlKCd0bycpO1xuICAgICAgICB0aGlzLnZhbHVlcyA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ3ZhbHVlcycsIG51bGwpO1xuICAgICAgICBjb25zdCB2YWx1ZXNBdHRyID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3ZhbHVlcycpO1xuICAgICAgICBpZiAodmFsdWVzQXR0ci5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICB0aGlzLnZhbHVlcy5zZXRWYWx1ZSh2YWx1ZXNBdHRyLmdldFN0cmluZygpLnNwbGl0KCc7JykpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBBbmltYXRlQ29sb3JFbGVtZW50IGV4dGVuZHMgQW5pbWF0ZUVsZW1lbnQge1xuICAgIGNhbGNWYWx1ZSgpIHtcbiAgICAgICAgY29uc3QgeyBwcm9ncmVzcyAsIGZyb20gLCB0byAgfSA9IHRoaXMuZ2V0UHJvZ3Jlc3MoKTtcbiAgICAgICAgY29uc3QgY29sb3JGcm9tID0gbmV3IFJHQkNvbG9yX19kZWZhdWx0W1wiZGVmYXVsdFwiXShmcm9tLmdldENvbG9yKCkpO1xuICAgICAgICBjb25zdCBjb2xvclRvID0gbmV3IFJHQkNvbG9yX19kZWZhdWx0W1wiZGVmYXVsdFwiXSh0by5nZXRDb2xvcigpKTtcbiAgICAgICAgaWYgKGNvbG9yRnJvbS5vayAmJiBjb2xvclRvLm9rKSB7XG4gICAgICAgICAgICAvLyB0d2VlbiBjb2xvciBsaW5lYXJseVxuICAgICAgICAgICAgY29uc3QgciA9IGNvbG9yRnJvbS5yICsgKGNvbG9yVG8uciAtIGNvbG9yRnJvbS5yKSAqIHByb2dyZXNzO1xuICAgICAgICAgICAgY29uc3QgZyA9IGNvbG9yRnJvbS5nICsgKGNvbG9yVG8uZyAtIGNvbG9yRnJvbS5nKSAqIHByb2dyZXNzO1xuICAgICAgICAgICAgY29uc3QgYiA9IGNvbG9yRnJvbS5iICsgKGNvbG9yVG8uYiAtIGNvbG9yRnJvbS5iKSAqIHByb2dyZXNzO1xuICAgICAgICAgICAgLy8gPyBhbHBoYVxuICAgICAgICAgICAgcmV0dXJuIFwicmdiKFwiLmNvbmNhdChNYXRoLmZsb29yKHIpLCBcIiwgXCIpLmNvbmNhdChNYXRoLmZsb29yKGcpLCBcIiwgXCIpLmNvbmNhdChNYXRoLmZsb29yKGIpLCBcIilcIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2V0QXR0cmlidXRlKCdmcm9tJykuZ2V0Q29sb3IoKTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnYW5pbWF0ZUNvbG9yJztcbiAgICB9XG59XG5cbmNsYXNzIEFuaW1hdGVUcmFuc2Zvcm1FbGVtZW50IGV4dGVuZHMgQW5pbWF0ZUVsZW1lbnQge1xuICAgIGNhbGNWYWx1ZSgpIHtcbiAgICAgICAgY29uc3QgeyBwcm9ncmVzcyAsIGZyb206IGZyb20xICwgdG86IHRvMSAgfSA9IHRoaXMuZ2V0UHJvZ3Jlc3MoKTtcbiAgICAgICAgLy8gdHdlZW4gdmFsdWUgbGluZWFybHlcbiAgICAgICAgY29uc3QgdHJhbnNmb3JtRnJvbSA9IHRvTnVtYmVycyhmcm9tMS5nZXRTdHJpbmcoKSk7XG4gICAgICAgIGNvbnN0IHRyYW5zZm9ybVRvID0gdG9OdW1iZXJzKHRvMS5nZXRTdHJpbmcoKSk7XG4gICAgICAgIGNvbnN0IG5ld1ZhbHVlID0gdHJhbnNmb3JtRnJvbS5tYXAoKGZyb20sIGkpPT57XG4gICAgICAgICAgICBjb25zdCB0byA9IHRyYW5zZm9ybVRvW2ldO1xuICAgICAgICAgICAgcmV0dXJuIGZyb20gKyAodG8gLSBmcm9tKSAqIHByb2dyZXNzO1xuICAgICAgICB9KS5qb2luKCcgJyk7XG4gICAgICAgIHJldHVybiBuZXdWYWx1ZTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnYW5pbWF0ZVRyYW5zZm9ybSc7XG4gICAgfVxufVxuXG5jbGFzcyBGb250RmFjZUVsZW1lbnQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyl7XG4gICAgICAgIHN1cGVyKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2ZvbnQtZmFjZSc7XG4gICAgICAgIHRoaXMuYXNjZW50ID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2FzY2VudCcpLmdldE51bWJlcigpO1xuICAgICAgICB0aGlzLmRlc2NlbnQgPSB0aGlzLmdldEF0dHJpYnV0ZSgnZGVzY2VudCcpLmdldE51bWJlcigpO1xuICAgICAgICB0aGlzLnVuaXRzUGVyRW0gPSB0aGlzLmdldEF0dHJpYnV0ZSgndW5pdHMtcGVyLWVtJykuZ2V0TnVtYmVyKCk7XG4gICAgfVxufVxuXG5jbGFzcyBHbHlwaEVsZW1lbnQgZXh0ZW5kcyBQYXRoRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpe1xuICAgICAgICBzdXBlcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdnbHlwaCc7XG4gICAgICAgIHRoaXMuaG9yaXpBZHZYID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2hvcml6LWFkdi14JykuZ2V0TnVtYmVyKCk7XG4gICAgICAgIHRoaXMudW5pY29kZSA9IHRoaXMuZ2V0QXR0cmlidXRlKCd1bmljb2RlJykuZ2V0U3RyaW5nKCk7XG4gICAgICAgIHRoaXMuYXJhYmljRm9ybSA9IHRoaXMuZ2V0QXR0cmlidXRlKCdhcmFiaWMtZm9ybScpLmdldFN0cmluZygpO1xuICAgIH1cbn1cblxuY2xhc3MgTWlzc2luZ0dseXBoRWxlbWVudCBleHRlbmRzIEdseXBoRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnbWlzc2luZy1nbHlwaCc7XG4gICAgICAgIHRoaXMuaG9yaXpBZHZYID0gMDtcbiAgICB9XG59XG5cbmNsYXNzIEZvbnRFbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgcmVuZGVyKCkge1xuICAgIC8vIE5PIFJFTkRFUlxuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyl7XG4gICAgICAgIHN1cGVyKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2ZvbnQnO1xuICAgICAgICB0aGlzLmlzQXJhYmljID0gZmFsc2U7XG4gICAgICAgIHRoaXMuZ2x5cGhzID0ge307XG4gICAgICAgIHRoaXMuYXJhYmljR2x5cGhzID0ge307XG4gICAgICAgIHRoaXMuaXNSVEwgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5ob3JpekFkdlggPSB0aGlzLmdldEF0dHJpYnV0ZSgnaG9yaXotYWR2LXgnKS5nZXROdW1iZXIoKTtcbiAgICAgICAgY29uc3QgeyBkZWZpbml0aW9ucyAgfSA9IGRvY3VtZW50O1xuICAgICAgICBjb25zdCB7IGNoaWxkcmVuICB9ID0gdGhpcztcbiAgICAgICAgZm9yIChjb25zdCBjaGlsZCBvZiBjaGlsZHJlbil7XG4gICAgICAgICAgICBpZiAoY2hpbGQgaW5zdGFuY2VvZiBGb250RmFjZUVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmZvbnRGYWNlID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgY29uc3QgZm9udEZhbWlseVN0eWxlID0gY2hpbGQuZ2V0U3R5bGUoJ2ZvbnQtZmFtaWx5Jyk7XG4gICAgICAgICAgICAgICAgaWYgKGZvbnRGYW1pbHlTdHlsZS5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICAgICAgICAgIGRlZmluaXRpb25zW2ZvbnRGYW1pbHlTdHlsZS5nZXRTdHJpbmcoKV0gPSB0aGlzO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGQgaW5zdGFuY2VvZiBNaXNzaW5nR2x5cGhFbGVtZW50KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5taXNzaW5nR2x5cGggPSBjaGlsZDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoY2hpbGQgaW5zdGFuY2VvZiBHbHlwaEVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAoY2hpbGQuYXJhYmljRm9ybSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmlzUlRMID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5pc0FyYWJpYyA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFyYWJpY0dseXBoID0gdGhpcy5hcmFiaWNHbHlwaHNbY2hpbGQudW5pY29kZV07XG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgYXJhYmljR2x5cGggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmFyYWJpY0dseXBoc1tjaGlsZC51bmljb2RlXSA9IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBbY2hpbGQuYXJhYmljRm9ybV06IGNoaWxkXG4gICAgICAgICAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXJhYmljR2x5cGhbY2hpbGQuYXJhYmljRm9ybV0gPSBjaGlsZDtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZ2x5cGhzW2NoaWxkLnVuaWNvZGVdID0gY2hpbGQ7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5jbGFzcyBUUmVmRWxlbWVudCBleHRlbmRzIFRleHRFbGVtZW50IHtcbiAgICBnZXRUZXh0KCkge1xuICAgICAgICBjb25zdCBlbGVtZW50ID0gdGhpcy5nZXRIcmVmQXR0cmlidXRlKCkuZ2V0RGVmaW5pdGlvbigpO1xuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgY29uc3QgZmlyc3RDaGlsZCA9IGVsZW1lbnQuY2hpbGRyZW5bMF07XG4gICAgICAgICAgICBpZiAoZmlyc3RDaGlsZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBmaXJzdENoaWxkLmdldFRleHQoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gJyc7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3RyZWYnO1xuICAgIH1cbn1cblxuY2xhc3MgQUVsZW1lbnQgZXh0ZW5kcyBUZXh0RWxlbWVudCB7XG4gICAgZ2V0VGV4dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dDtcbiAgICB9XG4gICAgcmVuZGVyQ2hpbGRyZW4oY3R4KSB7XG4gICAgICAgIGlmICh0aGlzLmhhc1RleHQpIHtcbiAgICAgICAgICAgIC8vIHJlbmRlciBhcyB0ZXh0IGVsZW1lbnRcbiAgICAgICAgICAgIHN1cGVyLnJlbmRlckNoaWxkcmVuKGN0eCk7XG4gICAgICAgICAgICBjb25zdCB7IGRvY3VtZW50ICwgeCAsIHkgIH0gPSB0aGlzO1xuICAgICAgICAgICAgY29uc3QgeyBtb3VzZSAgfSA9IGRvY3VtZW50LnNjcmVlbjtcbiAgICAgICAgICAgIGNvbnN0IGZvbnRTaXplID0gbmV3IFByb3BlcnR5KGRvY3VtZW50LCAnZm9udFNpemUnLCBGb250LnBhcnNlKGRvY3VtZW50LmN0eC5mb250KS5mb250U2l6ZSk7XG4gICAgICAgICAgICAvLyBEbyBub3QgY2FsYyBib3VuZGluZyBib3ggaWYgbW91c2UgaXMgbm90IHdvcmtpbmcuXG4gICAgICAgICAgICBpZiAobW91c2UuaXNXb3JraW5nKCkpIHtcbiAgICAgICAgICAgICAgICBtb3VzZS5jaGVja0JvdW5kaW5nQm94KHRoaXMsIG5ldyBCb3VuZGluZ0JveCh4LCB5IC0gZm9udFNpemUuZ2V0UGl4ZWxzKCd5JyksIHggKyB0aGlzLm1lYXN1cmVUZXh0KGN0eCksIHkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIC8vIHJlbmRlciBhcyB0ZW1wb3JhcnkgZ3JvdXBcbiAgICAgICAgICAgIGNvbnN0IGcgPSBuZXcgR0VsZW1lbnQodGhpcy5kb2N1bWVudCk7XG4gICAgICAgICAgICBnLmNoaWxkcmVuID0gdGhpcy5jaGlsZHJlbjtcbiAgICAgICAgICAgIGcucGFyZW50ID0gdGhpcztcbiAgICAgICAgICAgIGcucmVuZGVyKGN0eCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25DbGljaygpIHtcbiAgICAgICAgY29uc3QgeyB3aW5kb3cgIH0gPSB0aGlzLmRvY3VtZW50O1xuICAgICAgICBpZiAod2luZG93KSB7XG4gICAgICAgICAgICB3aW5kb3cub3Blbih0aGlzLmdldEhyZWZBdHRyaWJ1dGUoKS5nZXRTdHJpbmcoKSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgb25Nb3VzZU1vdmUoKSB7XG4gICAgICAgIGNvbnN0IGN0eCA9IHRoaXMuZG9jdW1lbnQuY3R4O1xuICAgICAgICBjdHguY2FudmFzLnN0eWxlLmN1cnNvciA9ICdwb2ludGVyJztcbiAgICB9XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG5vZGUxLCBjYXB0dXJlVGV4dE5vZGVzKXtcbiAgICAgICAgc3VwZXIoZG9jdW1lbnQsIG5vZGUxLCBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2EnO1xuICAgICAgICBjb25zdCB7IGNoaWxkTm9kZXMgIH0gPSBub2RlMTtcbiAgICAgICAgY29uc3QgZmlyc3RDaGlsZCA9IGNoaWxkTm9kZXNbMF07XG4gICAgICAgIGNvbnN0IGhhc1RleHQgPSBjaGlsZE5vZGVzLmxlbmd0aCA+IDAgJiYgQXJyYXkuZnJvbShjaGlsZE5vZGVzKS5ldmVyeSgobm9kZSk9Pm5vZGUubm9kZVR5cGUgPT09IDNcbiAgICAgICAgKTtcbiAgICAgICAgdGhpcy5oYXNUZXh0ID0gaGFzVGV4dDtcbiAgICAgICAgdGhpcy50ZXh0ID0gaGFzVGV4dCA/IHRoaXMuZ2V0VGV4dEZyb21Ob2RlKGZpcnN0Q2hpbGQpIDogJyc7XG4gICAgfVxufVxuXG5jbGFzcyBUZXh0UGF0aEVsZW1lbnQgZXh0ZW5kcyBUZXh0RWxlbWVudCB7XG4gICAgZ2V0VGV4dCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGV4dDtcbiAgICB9XG4gICAgcGF0aChjdHgpIHtcbiAgICAgICAgY29uc3QgeyBkYXRhQXJyYXkgIH0gPSB0aGlzO1xuICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICBjdHguYmVnaW5QYXRoKCk7XG4gICAgICAgIH1cbiAgICAgICAgZGF0YUFycmF5LmZvckVhY2goKHBhcmFtKT0+e1xuICAgICAgICAgICAgbGV0IHsgdHlwZSAsIHBvaW50cyAgfSA9IHBhcmFtO1xuICAgICAgICAgICAgc3dpdGNoKHR5cGUpe1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5MSU5FX1RPOlxuICAgICAgICAgICAgICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHgubGluZVRvKHBvaW50c1swXSwgcG9pbnRzWzFdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBhdGhQYXJzZXIuTU9WRV9UTzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3R4Lm1vdmVUbyhwb2ludHNbMF0sIHBvaW50c1sxXSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLkNVUlZFX1RPOlxuICAgICAgICAgICAgICAgICAgICBpZiAoY3R4KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHguYmV6aWVyQ3VydmVUbyhwb2ludHNbMF0sIHBvaW50c1sxXSwgcG9pbnRzWzJdLCBwb2ludHNbM10sIHBvaW50c1s0XSwgcG9pbnRzWzVdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBhdGhQYXJzZXIuUVVBRF9UTzpcbiAgICAgICAgICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgY3R4LnF1YWRyYXRpY0N1cnZlVG8ocG9pbnRzWzBdLCBwb2ludHNbMV0sIHBvaW50c1syXSwgcG9pbnRzWzNdKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBhdGhQYXJzZXIuQVJDOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBbY3gsIGN5LCByeCwgcnksIHRoZXRhLCBkVGhldGEsIHBzaSwgZnNdID0gcG9pbnRzO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgciA9IHJ4ID4gcnkgPyByeCA6IHJ5O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2NhbGVYID0gcnggPiByeSA/IDEgOiByeCAvIHJ5O1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc2NhbGVZID0gcnggPiByeSA/IHJ5IC8gcnggOiAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGN0eCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoY3gsIGN5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHgucm90YXRlKHBzaSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LnNjYWxlKHNjYWxlWCwgc2NhbGVZKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguYXJjKDAsIDAsIHIsIHRoZXRhLCB0aGV0YSArIGRUaGV0YSwgQm9vbGVhbigxIC0gZnMpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHguc2NhbGUoMSAvIHNjYWxlWCwgMSAvIHNjYWxlWSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3R4LnJvdGF0ZSgtcHNpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdHgudHJhbnNsYXRlKC1jeCwgLWN5KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLkNMT1NFX1BBVEg6XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdHgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHJlbmRlckNoaWxkcmVuKGN0eCkge1xuICAgICAgICB0aGlzLnNldFRleHREYXRhKGN0eCk7XG4gICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgIGNvbnN0IHRleHREZWNvcmF0aW9uID0gdGhpcy5wYXJlbnQuZ2V0U3R5bGUoJ3RleHQtZGVjb3JhdGlvbicpLmdldFN0cmluZygpO1xuICAgICAgICBjb25zdCBmb250U2l6ZSA9IHRoaXMuZ2V0Rm9udFNpemUoKTtcbiAgICAgICAgY29uc3QgeyBnbHlwaEluZm8gIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBmaWxsID0gY3R4LmZpbGxTdHlsZTtcbiAgICAgICAgaWYgKHRleHREZWNvcmF0aW9uID09PSAndW5kZXJsaW5lJykge1xuICAgICAgICAgICAgY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICB9XG4gICAgICAgIGdseXBoSW5mby5mb3JFYWNoKChnbHlwaCwgaSk9PntcbiAgICAgICAgICAgIGNvbnN0IHsgcDAgLCBwMSAsIHJvdGF0aW9uICwgdGV4dDogcGFydGlhbFRleHQgIH0gPSBnbHlwaDtcbiAgICAgICAgICAgIGN0eC5zYXZlKCk7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKHAwLngsIHAwLnkpO1xuICAgICAgICAgICAgY3R4LnJvdGF0ZShyb3RhdGlvbik7XG4gICAgICAgICAgICBpZiAoY3R4LmZpbGxTdHlsZSkge1xuICAgICAgICAgICAgICAgIGN0eC5maWxsVGV4dChwYXJ0aWFsVGV4dCwgMCwgMCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY3R4LnN0cm9rZVN0eWxlKSB7XG4gICAgICAgICAgICAgICAgY3R4LnN0cm9rZVRleHQocGFydGlhbFRleHQsIDAsIDApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY3R4LnJlc3RvcmUoKTtcbiAgICAgICAgICAgIGlmICh0ZXh0RGVjb3JhdGlvbiA9PT0gJ3VuZGVybGluZScpIHtcbiAgICAgICAgICAgICAgICBpZiAoaSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBjdHgubW92ZVRvKHAwLngsIHAwLnkgKyBmb250U2l6ZSAvIDgpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjdHgubGluZVRvKHAxLngsIHAxLnkgKyBmb250U2l6ZSAvIDUpO1xuICAgICAgICAgICAgfVxuICAgICAgICAvLyAvLyBUbyBhc3Npc3Qgd2l0aCBkZWJ1Z2dpbmcgdmlzdWFsbHksIHVuY29tbWVudCBmb2xsb3dpbmdcbiAgICAgICAgLy9cbiAgICAgICAgLy8gY3R4LmJlZ2luUGF0aCgpO1xuICAgICAgICAvLyBpZiAoaSAlIDIpXG4gICAgICAgIC8vICAgY3R4LnN0cm9rZVN0eWxlID0gJ3JlZCc7XG4gICAgICAgIC8vIGVsc2VcbiAgICAgICAgLy8gICBjdHguc3Ryb2tlU3R5bGUgPSAnZ3JlZW4nO1xuICAgICAgICAvLyBjdHgubW92ZVRvKHAwLngsIHAwLnkpO1xuICAgICAgICAvLyBjdHgubGluZVRvKHAxLngsIHAxLnkpO1xuICAgICAgICAvLyBjdHguc3Ryb2tlKCk7XG4gICAgICAgIC8vIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgfSk7XG4gICAgICAgIGlmICh0ZXh0RGVjb3JhdGlvbiA9PT0gJ3VuZGVybGluZScpIHtcbiAgICAgICAgICAgIGN0eC5saW5lV2lkdGggPSBmb250U2l6ZSAvIDIwO1xuICAgICAgICAgICAgY3R4LnN0cm9rZVN0eWxlID0gZmlsbDtcbiAgICAgICAgICAgIGN0eC5zdHJva2UoKTtcbiAgICAgICAgICAgIGN0eC5jbG9zZVBhdGgoKTtcbiAgICAgICAgfVxuICAgICAgICBjdHgucmVzdG9yZSgpO1xuICAgIH1cbiAgICBnZXRMZXR0ZXJTcGFjaW5nQXQoKSB7XG4gICAgICAgIGxldCBpZHggPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1swXSA6IDA7XG4gICAgICAgIHJldHVybiB0aGlzLmxldHRlclNwYWNpbmdDYWNoZVtpZHhdIHx8IDA7XG4gICAgfVxuICAgIGZpbmRTZWdtZW50VG9GaXRDaGFyKGN0eCwgYW5jaG9yLCB0ZXh0RnVsbFdpZHRoLCBmdWxsUGF0aFdpZHRoLCBzcGFjZXNOdW1iZXIsIGlucHV0T2Zmc2V0LCBkeSwgYywgY2hhckkpIHtcbiAgICAgICAgbGV0IG9mZnNldCA9IGlucHV0T2Zmc2V0O1xuICAgICAgICBsZXQgZ2x5cGhXaWR0aCA9IHRoaXMubWVhc3VyZVRleHQoY3R4LCBjKTtcbiAgICAgICAgaWYgKGMgPT09ICcgJyAmJiBhbmNob3IgPT09ICdqdXN0aWZ5JyAmJiB0ZXh0RnVsbFdpZHRoIDwgZnVsbFBhdGhXaWR0aCkge1xuICAgICAgICAgICAgZ2x5cGhXaWR0aCArPSAoZnVsbFBhdGhXaWR0aCAtIHRleHRGdWxsV2lkdGgpIC8gc3BhY2VzTnVtYmVyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChjaGFySSA+IC0xKSB7XG4gICAgICAgICAgICBvZmZzZXQgKz0gdGhpcy5nZXRMZXR0ZXJTcGFjaW5nQXQoY2hhckkpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNwbGluZVN0ZXAgPSB0aGlzLnRleHRIZWlnaHQgLyAyMDtcbiAgICAgICAgY29uc3QgcDAgPSB0aGlzLmdldEVxdWlkaXN0YW50UG9pbnRPblBhdGgob2Zmc2V0LCBzcGxpbmVTdGVwLCAwKTtcbiAgICAgICAgY29uc3QgcDEgPSB0aGlzLmdldEVxdWlkaXN0YW50UG9pbnRPblBhdGgob2Zmc2V0ICsgZ2x5cGhXaWR0aCwgc3BsaW5lU3RlcCwgMCk7XG4gICAgICAgIGNvbnN0IHNlZ21lbnQgPSB7XG4gICAgICAgICAgICBwMCxcbiAgICAgICAgICAgIHAxXG4gICAgICAgIH07XG4gICAgICAgIGNvbnN0IHJvdGF0aW9uID0gcDAgJiYgcDEgPyBNYXRoLmF0YW4yKHAxLnkgLSBwMC55LCBwMS54IC0gcDAueCkgOiAwO1xuICAgICAgICBpZiAoZHkpIHtcbiAgICAgICAgICAgIGNvbnN0IGR5WCA9IE1hdGguY29zKE1hdGguUEkgLyAyICsgcm90YXRpb24pICogZHk7XG4gICAgICAgICAgICBjb25zdCBkeVkgPSBNYXRoLmNvcygtcm90YXRpb24pICogZHk7XG4gICAgICAgICAgICBzZWdtZW50LnAwID0ge1xuICAgICAgICAgICAgICAgIC4uLnAwLFxuICAgICAgICAgICAgICAgIHg6IHAwLnggKyBkeVgsXG4gICAgICAgICAgICAgICAgeTogcDAueSArIGR5WVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHNlZ21lbnQucDEgPSB7XG4gICAgICAgICAgICAgICAgLi4ucDEsXG4gICAgICAgICAgICAgICAgeDogcDEueCArIGR5WCxcbiAgICAgICAgICAgICAgICB5OiBwMS55ICsgZHlZXG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICAgIG9mZnNldCArPSBnbHlwaFdpZHRoO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgb2Zmc2V0LFxuICAgICAgICAgICAgc2VnbWVudCxcbiAgICAgICAgICAgIHJvdGF0aW9uXG4gICAgICAgIH07XG4gICAgfVxuICAgIG1lYXN1cmVUZXh0KGN0eCwgdGV4dCkge1xuICAgICAgICBjb25zdCB7IG1lYXN1cmVzQ2FjaGUgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB0YXJnZXRUZXh0ID0gdGV4dCB8fCB0aGlzLmdldFRleHQoKTtcbiAgICAgICAgaWYgKG1lYXN1cmVzQ2FjaGUuaGFzKHRhcmdldFRleHQpKSB7XG4gICAgICAgICAgICByZXR1cm4gbWVhc3VyZXNDYWNoZS5nZXQodGFyZ2V0VGV4dCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbWVhc3VyZSA9IHRoaXMubWVhc3VyZVRhcmdldFRleHQoY3R4LCB0YXJnZXRUZXh0KTtcbiAgICAgICAgbWVhc3VyZXNDYWNoZS5zZXQodGFyZ2V0VGV4dCwgbWVhc3VyZSk7XG4gICAgICAgIHJldHVybiBtZWFzdXJlO1xuICAgIH1cbiAgICAvLyBUaGlzIG1ldGhvZCBzdXBwb3NlcyB3aGF0IGFsbCBjdXN0b20gZm9udHMgYWxyZWFkeSBsb2FkZWQuXG4gICAgLy8gSWYgc29tZSBmb250IHdpbGwgYmUgbG9hZGVkIGFmdGVyIHRoaXMgbWV0aG9kIGNhbGwsIDx0ZXh0UGF0aD4gd2lsbCBub3QgYmUgcmVuZGVyZWQgY29ycmVjdGx5LlxuICAgIC8vIFlvdSBuZWVkIHRvIGNhbGwgdGhpcyBtZXRob2QgbWFudWFsbHkgdG8gdXBkYXRlIGdseXBocyBjYWNoZS5cbiAgICBzZXRUZXh0RGF0YShjdHgpIHtcbiAgICAgICAgaWYgKHRoaXMuZ2x5cGhJbmZvKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVuZGVyVGV4dCA9IHRoaXMuZ2V0VGV4dCgpO1xuICAgICAgICBjb25zdCBjaGFycyA9IHJlbmRlclRleHQuc3BsaXQoJycpO1xuICAgICAgICBjb25zdCBzcGFjZXNOdW1iZXIgPSByZW5kZXJUZXh0LnNwbGl0KCcgJykubGVuZ3RoIC0gMTtcbiAgICAgICAgY29uc3QgZHggPSB0aGlzLnBhcmVudC5nZXRBdHRyaWJ1dGUoJ2R4Jykuc3BsaXQoKS5tYXAoKF8pPT5fLmdldFBpeGVscygneCcpXG4gICAgICAgICk7XG4gICAgICAgIGNvbnN0IGR5ID0gdGhpcy5wYXJlbnQuZ2V0QXR0cmlidXRlKCdkeScpLmdldFBpeGVscygneScpO1xuICAgICAgICBjb25zdCBhbmNob3IgPSB0aGlzLnBhcmVudC5nZXRTdHlsZSgndGV4dC1hbmNob3InKS5nZXRTdHJpbmcoJ3N0YXJ0Jyk7XG4gICAgICAgIGNvbnN0IHRoaXNTcGFjaW5nID0gdGhpcy5nZXRTdHlsZSgnbGV0dGVyLXNwYWNpbmcnKTtcbiAgICAgICAgY29uc3QgcGFyZW50U3BhY2luZyA9IHRoaXMucGFyZW50LmdldFN0eWxlKCdsZXR0ZXItc3BhY2luZycpO1xuICAgICAgICBsZXQgbGV0dGVyU3BhY2luZyA9IDA7XG4gICAgICAgIGlmICghdGhpc1NwYWNpbmcuaGFzVmFsdWUoKSB8fCB0aGlzU3BhY2luZy5nZXRWYWx1ZSgpID09PSAnaW5oZXJpdCcpIHtcbiAgICAgICAgICAgIGxldHRlclNwYWNpbmcgPSBwYXJlbnRTcGFjaW5nLmdldFBpeGVscygpO1xuICAgICAgICB9IGVsc2UgaWYgKHRoaXNTcGFjaW5nLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzU3BhY2luZy5nZXRWYWx1ZSgpICE9PSAnaW5pdGlhbCcgJiYgdGhpc1NwYWNpbmcuZ2V0VmFsdWUoKSAhPT0gJ3Vuc2V0Jykge1xuICAgICAgICAgICAgICAgIGxldHRlclNwYWNpbmcgPSB0aGlzU3BhY2luZy5nZXRQaXhlbHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICAvLyBmaWxsIGxldHRlci1zcGFjaW5nIGNhY2hlXG4gICAgICAgIGNvbnN0IGxldHRlclNwYWNpbmdDYWNoZSA9IFtdO1xuICAgICAgICBjb25zdCB0ZXh0TGVuID0gcmVuZGVyVGV4dC5sZW5ndGg7XG4gICAgICAgIHRoaXMubGV0dGVyU3BhY2luZ0NhY2hlID0gbGV0dGVyU3BhY2luZ0NhY2hlO1xuICAgICAgICBmb3IobGV0IGkxID0gMDsgaTEgPCB0ZXh0TGVuOyBpMSsrKXtcbiAgICAgICAgICAgIGxldHRlclNwYWNpbmdDYWNoZS5wdXNoKHR5cGVvZiBkeFtpMV0gIT09ICd1bmRlZmluZWQnID8gZHhbaTFdIDogbGV0dGVyU3BhY2luZyk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZHhTdW0gPSBsZXR0ZXJTcGFjaW5nQ2FjaGUucmVkdWNlKChhY2MsIGN1ciwgaSk9PmkgPT09IDAgPyAwIDogYWNjICsgY3VyIHx8IDBcbiAgICAgICAgLCAwKTtcbiAgICAgICAgY29uc3QgdGV4dFdpZHRoID0gdGhpcy5tZWFzdXJlVGV4dChjdHgpO1xuICAgICAgICBjb25zdCB0ZXh0RnVsbFdpZHRoID0gTWF0aC5tYXgodGV4dFdpZHRoICsgZHhTdW0sIDApO1xuICAgICAgICB0aGlzLnRleHRXaWR0aCA9IHRleHRXaWR0aDtcbiAgICAgICAgdGhpcy50ZXh0SGVpZ2h0ID0gdGhpcy5nZXRGb250U2l6ZSgpO1xuICAgICAgICB0aGlzLmdseXBoSW5mbyA9IFtdO1xuICAgICAgICBjb25zdCBmdWxsUGF0aFdpZHRoID0gdGhpcy5nZXRQYXRoTGVuZ3RoKCk7XG4gICAgICAgIGNvbnN0IHN0YXJ0T2Zmc2V0ID0gdGhpcy5nZXRTdHlsZSgnc3RhcnRPZmZzZXQnKS5nZXROdW1iZXIoMCkgKiBmdWxsUGF0aFdpZHRoO1xuICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICAgICAgaWYgKGFuY2hvciA9PT0gJ21pZGRsZScgfHwgYW5jaG9yID09PSAnY2VudGVyJykge1xuICAgICAgICAgICAgb2Zmc2V0ID0gLXRleHRGdWxsV2lkdGggLyAyO1xuICAgICAgICB9XG4gICAgICAgIGlmIChhbmNob3IgPT09ICdlbmQnIHx8IGFuY2hvciA9PT0gJ3JpZ2h0Jykge1xuICAgICAgICAgICAgb2Zmc2V0ID0gLXRleHRGdWxsV2lkdGg7XG4gICAgICAgIH1cbiAgICAgICAgb2Zmc2V0ICs9IHN0YXJ0T2Zmc2V0O1xuICAgICAgICBjaGFycy5mb3JFYWNoKChjaGFyLCBpKT0+e1xuICAgICAgICAgICAgLy8gRmluZCBzdWNoIHNlZ21lbnQgd2hhdCBkaXN0YW5jZSBiZXR3ZWVuIHAwIGFuZCBwMSBpcyBhcHByb3guIHdpZHRoIG9mIGdseXBoXG4gICAgICAgICAgICBjb25zdCB7IG9mZnNldDogbmV4dE9mZnNldCAsIHNlZ21lbnQgLCByb3RhdGlvbiAgfSA9IHRoaXMuZmluZFNlZ21lbnRUb0ZpdENoYXIoY3R4LCBhbmNob3IsIHRleHRGdWxsV2lkdGgsIGZ1bGxQYXRoV2lkdGgsIHNwYWNlc051bWJlciwgb2Zmc2V0LCBkeSwgY2hhciwgaSk7XG4gICAgICAgICAgICBvZmZzZXQgPSBuZXh0T2Zmc2V0O1xuICAgICAgICAgICAgaWYgKCFzZWdtZW50LnAwIHx8ICFzZWdtZW50LnAxKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gY29uc3Qgd2lkdGggPSB0aGlzLmdldExpbmVMZW5ndGgoXG4gICAgICAgICAgICAvLyAgIHNlZ21lbnQucDAueCxcbiAgICAgICAgICAgIC8vICAgc2VnbWVudC5wMC55LFxuICAgICAgICAgICAgLy8gICBzZWdtZW50LnAxLngsXG4gICAgICAgICAgICAvLyAgIHNlZ21lbnQucDEueVxuICAgICAgICAgICAgLy8gKTtcbiAgICAgICAgICAgIC8vIE5vdGU6IFNpbmNlIGdseXBocyBhcmUgcmVuZGVyZWQgb25lIGF0IGEgdGltZSwgYW55IGtlcm5pbmcgcGFpciBkYXRhIGJ1aWx0IGludG8gdGhlIGZvbnQgd2lsbCBub3QgYmUgdXNlZC5cbiAgICAgICAgICAgIC8vIENhbiBmb3Jlc2VlIGhhdmluZyBhIHJvdWdoIHBhaXIgdGFibGUgYnVpbHQgaW4gdGhhdCB0aGUgZGV2ZWxvcGVyIGNhbiBvdmVycmlkZSBhcyBuZWVkZWQuXG4gICAgICAgICAgICAvLyBPciB1c2UgXCJkeFwiIGF0dHJpYnV0ZSBvZiB0aGUgPHRleHQ+IG5vZGUgYXMgYSBuYWl2ZSByZXBsYWNlbWVudFxuICAgICAgICAgICAgLy8gY29uc3Qga2VybiA9IDA7XG4gICAgICAgICAgICAvLyBwbGFjZWhvbGRlciBmb3IgZnV0dXJlIGltcGxlbWVudGF0aW9uXG4gICAgICAgICAgICAvLyBjb25zdCBtaWRwb2ludCA9IHRoaXMuZ2V0UG9pbnRPbkxpbmUoXG4gICAgICAgICAgICAvLyAgIGtlcm4gKyB3aWR0aCAvIDIuMCxcbiAgICAgICAgICAgIC8vICAgc2VnbWVudC5wMC54LCBzZWdtZW50LnAwLnksIHNlZ21lbnQucDEueCwgc2VnbWVudC5wMS55XG4gICAgICAgICAgICAvLyApO1xuICAgICAgICAgICAgdGhpcy5nbHlwaEluZm8ucHVzaCh7XG4gICAgICAgICAgICAgICAgLy8gdHJhbnNwb3NlWDogbWlkcG9pbnQueCxcbiAgICAgICAgICAgICAgICAvLyB0cmFuc3Bvc2VZOiBtaWRwb2ludC55LFxuICAgICAgICAgICAgICAgIHRleHQ6IGNoYXJzW2ldLFxuICAgICAgICAgICAgICAgIHAwOiBzZWdtZW50LnAwLFxuICAgICAgICAgICAgICAgIHAxOiBzZWdtZW50LnAxLFxuICAgICAgICAgICAgICAgIHJvdGF0aW9uXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIHBhcnNlUGF0aERhdGEocGF0aCkge1xuICAgICAgICB0aGlzLnBhdGhMZW5ndGggPSAtMSAvLyByZXNldCBwYXRoIGxlbmd0aFxuICAgICAgICA7XG4gICAgICAgIGlmICghcGF0aCkge1xuICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHBhdGhDb21tYW5kcyA9IFtdO1xuICAgICAgICBjb25zdCB7IHBhdGhQYXJzZXIgIH0gPSBwYXRoO1xuICAgICAgICBwYXRoUGFyc2VyLnJlc2V0KCk7XG4gICAgICAgIC8vIGNvbnZlcnQgbCwgSCwgaCwgViwgYW5kIHYgdG8gTFxuICAgICAgICB3aGlsZSghcGF0aFBhcnNlci5pc0VuZCgpKXtcbiAgICAgICAgICAgIGNvbnN0IHsgY3VycmVudCAgfSA9IHBhdGhQYXJzZXI7XG4gICAgICAgICAgICBjb25zdCBzdGFydFggPSBjdXJyZW50ID8gY3VycmVudC54IDogMDtcbiAgICAgICAgICAgIGNvbnN0IHN0YXJ0WSA9IGN1cnJlbnQgPyBjdXJyZW50LnkgOiAwO1xuICAgICAgICAgICAgY29uc3QgY29tbWFuZCA9IHBhdGhQYXJzZXIubmV4dCgpO1xuICAgICAgICAgICAgbGV0IG5leHRDb21tYW5kVHlwZSA9IGNvbW1hbmQudHlwZTtcbiAgICAgICAgICAgIGxldCBwb2ludHMgPSBbXTtcbiAgICAgICAgICAgIHN3aXRjaChjb21tYW5kLnR5cGUpe1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5NT1ZFX1RPOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdGhNKHBhdGhQYXJzZXIsIHBvaW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5MSU5FX1RPOlxuICAgICAgICAgICAgICAgICAgICBuZXh0Q29tbWFuZFR5cGUgPSB0aGlzLnBhdGhMKHBhdGhQYXJzZXIsIHBvaW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5IT1JJWl9MSU5FX1RPOlxuICAgICAgICAgICAgICAgICAgICBuZXh0Q29tbWFuZFR5cGUgPSB0aGlzLnBhdGhIKHBhdGhQYXJzZXIsIHBvaW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5WRVJUX0xJTkVfVE86XG4gICAgICAgICAgICAgICAgICAgIG5leHRDb21tYW5kVHlwZSA9IHRoaXMucGF0aFYocGF0aFBhcnNlciwgcG9pbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLkNVUlZFX1RPOlxuICAgICAgICAgICAgICAgICAgICB0aGlzLnBhdGhDKHBhdGhQYXJzZXIsIHBvaW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5TTU9PVEhfQ1VSVkVfVE86XG4gICAgICAgICAgICAgICAgICAgIG5leHRDb21tYW5kVHlwZSA9IHRoaXMucGF0aFMocGF0aFBhcnNlciwgcG9pbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLlFVQURfVE86XG4gICAgICAgICAgICAgICAgICAgIHRoaXMucGF0aFEocGF0aFBhcnNlciwgcG9pbnRzKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLlNNT09USF9RVUFEX1RPOlxuICAgICAgICAgICAgICAgICAgICBuZXh0Q29tbWFuZFR5cGUgPSB0aGlzLnBhdGhUKHBhdGhQYXJzZXIsIHBvaW50cyk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5BUkM6XG4gICAgICAgICAgICAgICAgICAgIHBvaW50cyA9IHRoaXMucGF0aEEocGF0aFBhcnNlcik7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5DTE9TRV9QQVRIOlxuICAgICAgICAgICAgICAgICAgICBQYXRoRWxlbWVudC5wYXRoWihwYXRoUGFyc2VyKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29tbWFuZC50eXBlICE9PSBQYXRoUGFyc2VyLkNMT1NFX1BBVEgpIHtcbiAgICAgICAgICAgICAgICBwYXRoQ29tbWFuZHMucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHR5cGU6IG5leHRDb21tYW5kVHlwZSxcbiAgICAgICAgICAgICAgICAgICAgcG9pbnRzLFxuICAgICAgICAgICAgICAgICAgICBzdGFydDoge1xuICAgICAgICAgICAgICAgICAgICAgICAgeDogc3RhcnRYLFxuICAgICAgICAgICAgICAgICAgICAgICAgeTogc3RhcnRZXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIHBhdGhMZW5ndGg6IHRoaXMuY2FsY0xlbmd0aChzdGFydFgsIHN0YXJ0WSwgbmV4dENvbW1hbmRUeXBlLCBwb2ludHMpXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHBhdGhDb21tYW5kcy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgdHlwZTogUGF0aFBhcnNlci5DTE9TRV9QQVRILFxuICAgICAgICAgICAgICAgICAgICBwb2ludHM6IFtdLFxuICAgICAgICAgICAgICAgICAgICBwYXRoTGVuZ3RoOiAwXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHBhdGhDb21tYW5kcztcbiAgICB9XG4gICAgcGF0aE0ocGF0aFBhcnNlciwgcG9pbnRzKSB7XG4gICAgICAgIGNvbnN0IHsgeCAsIHkgIH0gPSBQYXRoRWxlbWVudC5wYXRoTShwYXRoUGFyc2VyKS5wb2ludDtcbiAgICAgICAgcG9pbnRzLnB1c2goeCwgeSk7XG4gICAgfVxuICAgIHBhdGhMKHBhdGhQYXJzZXIsIHBvaW50cykge1xuICAgICAgICBjb25zdCB7IHggLCB5ICB9ID0gUGF0aEVsZW1lbnQucGF0aEwocGF0aFBhcnNlcikucG9pbnQ7XG4gICAgICAgIHBvaW50cy5wdXNoKHgsIHkpO1xuICAgICAgICByZXR1cm4gUGF0aFBhcnNlci5MSU5FX1RPO1xuICAgIH1cbiAgICBwYXRoSChwYXRoUGFyc2VyLCBwb2ludHMpIHtcbiAgICAgICAgY29uc3QgeyB4ICwgeSAgfSA9IFBhdGhFbGVtZW50LnBhdGhIKHBhdGhQYXJzZXIpLnBvaW50O1xuICAgICAgICBwb2ludHMucHVzaCh4LCB5KTtcbiAgICAgICAgcmV0dXJuIFBhdGhQYXJzZXIuTElORV9UTztcbiAgICB9XG4gICAgcGF0aFYocGF0aFBhcnNlciwgcG9pbnRzKSB7XG4gICAgICAgIGNvbnN0IHsgeCAsIHkgIH0gPSBQYXRoRWxlbWVudC5wYXRoVihwYXRoUGFyc2VyKS5wb2ludDtcbiAgICAgICAgcG9pbnRzLnB1c2goeCwgeSk7XG4gICAgICAgIHJldHVybiBQYXRoUGFyc2VyLkxJTkVfVE87XG4gICAgfVxuICAgIHBhdGhDKHBhdGhQYXJzZXIsIHBvaW50cykge1xuICAgICAgICBjb25zdCB7IHBvaW50ICwgY29udHJvbFBvaW50ICwgY3VycmVudFBvaW50ICB9ID0gUGF0aEVsZW1lbnQucGF0aEMocGF0aFBhcnNlcik7XG4gICAgICAgIHBvaW50cy5wdXNoKHBvaW50LngsIHBvaW50LnksIGNvbnRyb2xQb2ludC54LCBjb250cm9sUG9pbnQueSwgY3VycmVudFBvaW50LngsIGN1cnJlbnRQb2ludC55KTtcbiAgICB9XG4gICAgcGF0aFMocGF0aFBhcnNlciwgcG9pbnRzKSB7XG4gICAgICAgIGNvbnN0IHsgcG9pbnQgLCBjb250cm9sUG9pbnQgLCBjdXJyZW50UG9pbnQgIH0gPSBQYXRoRWxlbWVudC5wYXRoUyhwYXRoUGFyc2VyKTtcbiAgICAgICAgcG9pbnRzLnB1c2gocG9pbnQueCwgcG9pbnQueSwgY29udHJvbFBvaW50LngsIGNvbnRyb2xQb2ludC55LCBjdXJyZW50UG9pbnQueCwgY3VycmVudFBvaW50LnkpO1xuICAgICAgICByZXR1cm4gUGF0aFBhcnNlci5DVVJWRV9UTztcbiAgICB9XG4gICAgcGF0aFEocGF0aFBhcnNlciwgcG9pbnRzKSB7XG4gICAgICAgIGNvbnN0IHsgY29udHJvbFBvaW50ICwgY3VycmVudFBvaW50ICB9ID0gUGF0aEVsZW1lbnQucGF0aFEocGF0aFBhcnNlcik7XG4gICAgICAgIHBvaW50cy5wdXNoKGNvbnRyb2xQb2ludC54LCBjb250cm9sUG9pbnQueSwgY3VycmVudFBvaW50LngsIGN1cnJlbnRQb2ludC55KTtcbiAgICB9XG4gICAgcGF0aFQocGF0aFBhcnNlciwgcG9pbnRzKSB7XG4gICAgICAgIGNvbnN0IHsgY29udHJvbFBvaW50ICwgY3VycmVudFBvaW50ICB9ID0gUGF0aEVsZW1lbnQucGF0aFQocGF0aFBhcnNlcik7XG4gICAgICAgIHBvaW50cy5wdXNoKGNvbnRyb2xQb2ludC54LCBjb250cm9sUG9pbnQueSwgY3VycmVudFBvaW50LngsIGN1cnJlbnRQb2ludC55KTtcbiAgICAgICAgcmV0dXJuIFBhdGhQYXJzZXIuUVVBRF9UTztcbiAgICB9XG4gICAgcGF0aEEocGF0aFBhcnNlcikge1xuICAgICAgICBsZXQgeyByWCAsIHJZICwgc3dlZXBGbGFnICwgeEF4aXNSb3RhdGlvbiAsIGNlbnRwICwgYTEgLCBhZCAgfSA9IFBhdGhFbGVtZW50LnBhdGhBKHBhdGhQYXJzZXIpO1xuICAgICAgICBpZiAoc3dlZXBGbGFnID09PSAwICYmIGFkID4gMCkge1xuICAgICAgICAgICAgYWQgLT0gMiAqIE1hdGguUEk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHN3ZWVwRmxhZyA9PT0gMSAmJiBhZCA8IDApIHtcbiAgICAgICAgICAgIGFkICs9IDIgKiBNYXRoLlBJO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICBjZW50cC54LFxuICAgICAgICAgICAgY2VudHAueSxcbiAgICAgICAgICAgIHJYLFxuICAgICAgICAgICAgclksXG4gICAgICAgICAgICBhMSxcbiAgICAgICAgICAgIGFkLFxuICAgICAgICAgICAgeEF4aXNSb3RhdGlvbixcbiAgICAgICAgICAgIHN3ZWVwRmxhZ1xuICAgICAgICBdO1xuICAgIH1cbiAgICBjYWxjTGVuZ3RoKHgsIHksIGNvbW1hbmRUeXBlLCBwb2ludHMpIHtcbiAgICAgICAgbGV0IGxlbiA9IDA7XG4gICAgICAgIGxldCBwMSA9IG51bGw7XG4gICAgICAgIGxldCBwMiA9IG51bGw7XG4gICAgICAgIGxldCB0ID0gMDtcbiAgICAgICAgc3dpdGNoKGNvbW1hbmRUeXBlKXtcbiAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5MSU5FX1RPOlxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLmdldExpbmVMZW5ndGgoeCwgeSwgcG9pbnRzWzBdLCBwb2ludHNbMV0pO1xuICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLkNVUlZFX1RPOlxuICAgICAgICAgICAgICAgIC8vIEFwcHJveGltYXRlcyBieSBicmVha2luZyBjdXJ2ZSBpbnRvIDEwMCBsaW5lIHNlZ21lbnRzXG4gICAgICAgICAgICAgICAgbGVuID0gMDtcbiAgICAgICAgICAgICAgICBwMSA9IHRoaXMuZ2V0UG9pbnRPbkN1YmljQmV6aWVyKDAsIHgsIHksIHBvaW50c1swXSwgcG9pbnRzWzFdLCBwb2ludHNbMl0sIHBvaW50c1szXSwgcG9pbnRzWzRdLCBwb2ludHNbNV0pO1xuICAgICAgICAgICAgICAgIGZvcih0ID0gMC4wMTsgdCA8PSAxOyB0ICs9IDAuMDEpe1xuICAgICAgICAgICAgICAgICAgICBwMiA9IHRoaXMuZ2V0UG9pbnRPbkN1YmljQmV6aWVyKHQsIHgsIHksIHBvaW50c1swXSwgcG9pbnRzWzFdLCBwb2ludHNbMl0sIHBvaW50c1szXSwgcG9pbnRzWzRdLCBwb2ludHNbNV0pO1xuICAgICAgICAgICAgICAgICAgICBsZW4gKz0gdGhpcy5nZXRMaW5lTGVuZ3RoKHAxLngsIHAxLnksIHAyLngsIHAyLnkpO1xuICAgICAgICAgICAgICAgICAgICBwMSA9IHAyO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gbGVuO1xuICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLlFVQURfVE86XG4gICAgICAgICAgICAgICAgLy8gQXBwcm94aW1hdGVzIGJ5IGJyZWFraW5nIGN1cnZlIGludG8gMTAwIGxpbmUgc2VnbWVudHNcbiAgICAgICAgICAgICAgICBsZW4gPSAwO1xuICAgICAgICAgICAgICAgIHAxID0gdGhpcy5nZXRQb2ludE9uUXVhZHJhdGljQmV6aWVyKDAsIHgsIHksIHBvaW50c1swXSwgcG9pbnRzWzFdLCBwb2ludHNbMl0sIHBvaW50c1szXSk7XG4gICAgICAgICAgICAgICAgZm9yKHQgPSAwLjAxOyB0IDw9IDE7IHQgKz0gMC4wMSl7XG4gICAgICAgICAgICAgICAgICAgIHAyID0gdGhpcy5nZXRQb2ludE9uUXVhZHJhdGljQmV6aWVyKHQsIHgsIHksIHBvaW50c1swXSwgcG9pbnRzWzFdLCBwb2ludHNbMl0sIHBvaW50c1szXSk7XG4gICAgICAgICAgICAgICAgICAgIGxlbiArPSB0aGlzLmdldExpbmVMZW5ndGgocDEueCwgcDEueSwgcDIueCwgcDIueSk7XG4gICAgICAgICAgICAgICAgICAgIHAxID0gcDI7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBsZW47XG4gICAgICAgICAgICBjYXNlIFBhdGhQYXJzZXIuQVJDOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gQXBwcm94aW1hdGVzIGJ5IGJyZWFraW5nIGN1cnZlIGludG8gbGluZSBzZWdtZW50c1xuICAgICAgICAgICAgICAgICAgICBsZW4gPSAwO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IHBvaW50c1s0XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gNCA9IHRoZXRhXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRUaGV0YSA9IHBvaW50c1s1XTtcbiAgICAgICAgICAgICAgICAgICAgLy8gNSA9IGRUaGV0YVxuICAgICAgICAgICAgICAgICAgICBjb25zdCBlbmQgPSBwb2ludHNbNF0gKyBkVGhldGE7XG4gICAgICAgICAgICAgICAgICAgIGxldCBpbmMgPSBNYXRoLlBJIC8gMTgwO1xuICAgICAgICAgICAgICAgICAgICAvLyAxIGRlZ3JlZSByZXNvbHV0aW9uXG4gICAgICAgICAgICAgICAgICAgIGlmIChNYXRoLmFicyhzdGFydCAtIGVuZCkgPCBpbmMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluYyA9IE1hdGguYWJzKHN0YXJ0IC0gZW5kKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBmb3IgcHVycG9zZSBvZiBjYWxjdWxhdGluZyBhcmMgbGVuZ3RoLCBub3QgZ29pbmcgdG8gd29ycnkgYWJvdXQgcm90YXRpbmcgWC1heGlzIGJ5IGFuZ2xlIHBzaVxuICAgICAgICAgICAgICAgICAgICBwMSA9IHRoaXMuZ2V0UG9pbnRPbkVsbGlwdGljYWxBcmMocG9pbnRzWzBdLCBwb2ludHNbMV0sIHBvaW50c1syXSwgcG9pbnRzWzNdLCBzdGFydCwgMCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkVGhldGEgPCAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBmb3IodCA9IHN0YXJ0IC0gaW5jOyB0ID4gZW5kOyB0IC09IGluYyl7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcDIgPSB0aGlzLmdldFBvaW50T25FbGxpcHRpY2FsQXJjKHBvaW50c1swXSwgcG9pbnRzWzFdLCBwb2ludHNbMl0sIHBvaW50c1szXSwgdCwgMCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbGVuICs9IHRoaXMuZ2V0TGluZUxlbmd0aChwMS54LCBwMS55LCBwMi54LCBwMi55KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwMSA9IHAyO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgZm9yKHQgPSBzdGFydCArIGluYzsgdCA8IGVuZDsgdCArPSBpbmMpe1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHAyID0gdGhpcy5nZXRQb2ludE9uRWxsaXB0aWNhbEFyYyhwb2ludHNbMF0sIHBvaW50c1sxXSwgcG9pbnRzWzJdLCBwb2ludHNbM10sIHQsIDApO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGxlbiArPSB0aGlzLmdldExpbmVMZW5ndGgocDEueCwgcDEueSwgcDIueCwgcDIueSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcDEgPSBwMjtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwMiA9IHRoaXMuZ2V0UG9pbnRPbkVsbGlwdGljYWxBcmMocG9pbnRzWzBdLCBwb2ludHNbMV0sIHBvaW50c1syXSwgcG9pbnRzWzNdLCBlbmQsIDApO1xuICAgICAgICAgICAgICAgICAgICBsZW4gKz0gdGhpcy5nZXRMaW5lTGVuZ3RoKHAxLngsIHAxLnksIHAyLngsIHAyLnkpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbGVuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gMDtcbiAgICB9XG4gICAgZ2V0UG9pbnRPbkxpbmUoZGlzdCwgcDF4LCBwMXksIHAyeCwgcDJ5KSB7XG4gICAgICAgIGxldCBmcm9tWCA9IGFyZ3VtZW50cy5sZW5ndGggPiA1ICYmIGFyZ3VtZW50c1s1XSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzVdIDogcDF4LCBmcm9tWSA9IGFyZ3VtZW50cy5sZW5ndGggPiA2ICYmIGFyZ3VtZW50c1s2XSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzZdIDogcDF5O1xuICAgICAgICBjb25zdCBtID0gKHAyeSAtIHAxeSkgLyAocDJ4IC0gcDF4ICsgUFNFVURPX1pFUk8pO1xuICAgICAgICBsZXQgcnVuID0gTWF0aC5zcXJ0KGRpc3QgKiBkaXN0IC8gKDEgKyBtICogbSkpO1xuICAgICAgICBpZiAocDJ4IDwgcDF4KSB7XG4gICAgICAgICAgICBydW4gKj0gLTE7XG4gICAgICAgIH1cbiAgICAgICAgbGV0IHJpc2UgPSBtICogcnVuO1xuICAgICAgICBsZXQgcHQgPSBudWxsO1xuICAgICAgICBpZiAocDJ4ID09PSBwMXgpIHtcbiAgICAgICAgICAgIHB0ID0ge1xuICAgICAgICAgICAgICAgIHg6IGZyb21YLFxuICAgICAgICAgICAgICAgIHk6IGZyb21ZICsgcmlzZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIGlmICgoZnJvbVkgLSBwMXkpIC8gKGZyb21YIC0gcDF4ICsgUFNFVURPX1pFUk8pID09PSBtKSB7XG4gICAgICAgICAgICBwdCA9IHtcbiAgICAgICAgICAgICAgICB4OiBmcm9tWCArIHJ1bixcbiAgICAgICAgICAgICAgICB5OiBmcm9tWSArIHJpc2VcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZXQgaXggPSAwO1xuICAgICAgICAgICAgbGV0IGl5ID0gMDtcbiAgICAgICAgICAgIGNvbnN0IGxlbiA9IHRoaXMuZ2V0TGluZUxlbmd0aChwMXgsIHAxeSwgcDJ4LCBwMnkpO1xuICAgICAgICAgICAgaWYgKGxlbiA8IFBTRVVET19aRVJPKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdSA9IChmcm9tWCAtIHAxeCkgKiAocDJ4IC0gcDF4KSArIChmcm9tWSAtIHAxeSkgKiAocDJ5IC0gcDF5KTtcbiAgICAgICAgICAgIHUgLz0gbGVuICogbGVuO1xuICAgICAgICAgICAgaXggPSBwMXggKyB1ICogKHAyeCAtIHAxeCk7XG4gICAgICAgICAgICBpeSA9IHAxeSArIHUgKiAocDJ5IC0gcDF5KTtcbiAgICAgICAgICAgIGNvbnN0IHBSaXNlID0gdGhpcy5nZXRMaW5lTGVuZ3RoKGZyb21YLCBmcm9tWSwgaXgsIGl5KTtcbiAgICAgICAgICAgIGNvbnN0IHBSdW4gPSBNYXRoLnNxcnQoZGlzdCAqIGRpc3QgLSBwUmlzZSAqIHBSaXNlKTtcbiAgICAgICAgICAgIHJ1biA9IE1hdGguc3FydChwUnVuICogcFJ1biAvICgxICsgbSAqIG0pKTtcbiAgICAgICAgICAgIGlmIChwMnggPCBwMXgpIHtcbiAgICAgICAgICAgICAgICBydW4gKj0gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByaXNlID0gbSAqIHJ1bjtcbiAgICAgICAgICAgIHB0ID0ge1xuICAgICAgICAgICAgICAgIHg6IGl4ICsgcnVuLFxuICAgICAgICAgICAgICAgIHk6IGl5ICsgcmlzZVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gcHQ7XG4gICAgfVxuICAgIGdldFBvaW50T25QYXRoKGRpc3RhbmNlKSB7XG4gICAgICAgIGNvbnN0IGZ1bGxMZW4gPSB0aGlzLmdldFBhdGhMZW5ndGgoKTtcbiAgICAgICAgbGV0IGN1bXVsYXRpdmVQYXRoTGVuZ3RoID0gMDtcbiAgICAgICAgbGV0IHAgPSBudWxsO1xuICAgICAgICBpZiAoZGlzdGFuY2UgPCAtMC4wMDAwNSB8fCBkaXN0YW5jZSAtIDAuMDAwMDUgPiBmdWxsTGVuKSB7XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCB7IGRhdGFBcnJheSAgfSA9IHRoaXM7XG4gICAgICAgIGZvciAoY29uc3QgY29tbWFuZCBvZiBkYXRhQXJyYXkpe1xuICAgICAgICAgICAgaWYgKGNvbW1hbmQgJiYgKGNvbW1hbmQucGF0aExlbmd0aCA8IDAuMDAwMDUgfHwgY3VtdWxhdGl2ZVBhdGhMZW5ndGggKyBjb21tYW5kLnBhdGhMZW5ndGggKyAwLjAwMDA1IDwgZGlzdGFuY2UpKSB7XG4gICAgICAgICAgICAgICAgY3VtdWxhdGl2ZVBhdGhMZW5ndGggKz0gY29tbWFuZC5wYXRoTGVuZ3RoO1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGVsdGEgPSBkaXN0YW5jZSAtIGN1bXVsYXRpdmVQYXRoTGVuZ3RoO1xuICAgICAgICAgICAgbGV0IGN1cnJlbnRUID0gMDtcbiAgICAgICAgICAgIHN3aXRjaChjb21tYW5kLnR5cGUpe1xuICAgICAgICAgICAgICAgIGNhc2UgUGF0aFBhcnNlci5MSU5FX1RPOlxuICAgICAgICAgICAgICAgICAgICBwID0gdGhpcy5nZXRQb2ludE9uTGluZShkZWx0YSwgY29tbWFuZC5zdGFydC54LCBjb21tYW5kLnN0YXJ0LnksIGNvbW1hbmQucG9pbnRzWzBdLCBjb21tYW5kLnBvaW50c1sxXSwgY29tbWFuZC5zdGFydC54LCBjb21tYW5kLnN0YXJ0LnkpO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFBhdGhQYXJzZXIuQVJDOlxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBzdGFydCA9IGNvbW1hbmQucG9pbnRzWzRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gNCA9IHRoZXRhXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBkVGhldGEgPSBjb21tYW5kLnBvaW50c1s1XTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIDUgPSBkVGhldGFcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGVuZCA9IGNvbW1hbmQucG9pbnRzWzRdICsgZFRoZXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgY3VycmVudFQgPSBzdGFydCArIGRlbHRhIC8gY29tbWFuZC5wYXRoTGVuZ3RoICogZFRoZXRhO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGRUaGV0YSA8IDAgJiYgY3VycmVudFQgPCBlbmQgfHwgZFRoZXRhID49IDAgJiYgY3VycmVudFQgPiBlbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHAgPSB0aGlzLmdldFBvaW50T25FbGxpcHRpY2FsQXJjKGNvbW1hbmQucG9pbnRzWzBdLCBjb21tYW5kLnBvaW50c1sxXSwgY29tbWFuZC5wb2ludHNbMl0sIGNvbW1hbmQucG9pbnRzWzNdLCBjdXJyZW50VCwgY29tbWFuZC5wb2ludHNbNl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjYXNlIFBhdGhQYXJzZXIuQ1VSVkVfVE86XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUID0gZGVsdGEgLyBjb21tYW5kLnBhdGhMZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwID0gdGhpcy5nZXRQb2ludE9uQ3ViaWNCZXppZXIoY3VycmVudFQsIGNvbW1hbmQuc3RhcnQueCwgY29tbWFuZC5zdGFydC55LCBjb21tYW5kLnBvaW50c1swXSwgY29tbWFuZC5wb2ludHNbMV0sIGNvbW1hbmQucG9pbnRzWzJdLCBjb21tYW5kLnBvaW50c1szXSwgY29tbWFuZC5wb2ludHNbNF0sIGNvbW1hbmQucG9pbnRzWzVdKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBQYXRoUGFyc2VyLlFVQURfVE86XG4gICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUID0gZGVsdGEgLyBjb21tYW5kLnBhdGhMZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjdXJyZW50VCA+IDEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN1cnJlbnRUID0gMTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBwID0gdGhpcy5nZXRQb2ludE9uUXVhZHJhdGljQmV6aWVyKGN1cnJlbnRULCBjb21tYW5kLnN0YXJ0LngsIGNvbW1hbmQuc3RhcnQueSwgY29tbWFuZC5wb2ludHNbMF0sIGNvbW1hbmQucG9pbnRzWzFdLCBjb21tYW5kLnBvaW50c1syXSwgY29tbWFuZC5wb2ludHNbM10pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHA7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZ2V0TGluZUxlbmd0aCh4MSwgeTEsIHgyLCB5Mikge1xuICAgICAgICByZXR1cm4gTWF0aC5zcXJ0KCh4MiAtIHgxKSAqICh4MiAtIHgxKSArICh5MiAtIHkxKSAqICh5MiAtIHkxKSk7XG4gICAgfVxuICAgIGdldFBhdGhMZW5ndGgoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhdGhMZW5ndGggPT09IC0xKSB7XG4gICAgICAgICAgICB0aGlzLnBhdGhMZW5ndGggPSB0aGlzLmRhdGFBcnJheS5yZWR1Y2UoKGxlbmd0aCwgY29tbWFuZCk9PmNvbW1hbmQucGF0aExlbmd0aCA+IDAgPyBsZW5ndGggKyBjb21tYW5kLnBhdGhMZW5ndGggOiBsZW5ndGhcbiAgICAgICAgICAgICwgMCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMucGF0aExlbmd0aDtcbiAgICB9XG4gICAgZ2V0UG9pbnRPbkN1YmljQmV6aWVyKHBjdCwgcDF4LCBwMXksIHAyeCwgcDJ5LCBwM3gsIHAzeSwgcDR4LCBwNHkpIHtcbiAgICAgICAgY29uc3QgeCA9IHA0eCAqIENCMShwY3QpICsgcDN4ICogQ0IyKHBjdCkgKyBwMnggKiBDQjMocGN0KSArIHAxeCAqIENCNChwY3QpO1xuICAgICAgICBjb25zdCB5ID0gcDR5ICogQ0IxKHBjdCkgKyBwM3kgKiBDQjIocGN0KSArIHAyeSAqIENCMyhwY3QpICsgcDF5ICogQ0I0KHBjdCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4LFxuICAgICAgICAgICAgeVxuICAgICAgICB9O1xuICAgIH1cbiAgICBnZXRQb2ludE9uUXVhZHJhdGljQmV6aWVyKHBjdCwgcDF4LCBwMXksIHAyeCwgcDJ5LCBwM3gsIHAzeSkge1xuICAgICAgICBjb25zdCB4ID0gcDN4ICogUUIxKHBjdCkgKyBwMnggKiBRQjIocGN0KSArIHAxeCAqIFFCMyhwY3QpO1xuICAgICAgICBjb25zdCB5ID0gcDN5ICogUUIxKHBjdCkgKyBwMnkgKiBRQjIocGN0KSArIHAxeSAqIFFCMyhwY3QpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgeCxcbiAgICAgICAgICAgIHlcbiAgICAgICAgfTtcbiAgICB9XG4gICAgZ2V0UG9pbnRPbkVsbGlwdGljYWxBcmMoY3gsIGN5LCByeCwgcnksIHRoZXRhLCBwc2kpIHtcbiAgICAgICAgY29uc3QgY29zUHNpID0gTWF0aC5jb3MocHNpKTtcbiAgICAgICAgY29uc3Qgc2luUHNpID0gTWF0aC5zaW4ocHNpKTtcbiAgICAgICAgY29uc3QgcHQgPSB7XG4gICAgICAgICAgICB4OiByeCAqIE1hdGguY29zKHRoZXRhKSxcbiAgICAgICAgICAgIHk6IHJ5ICogTWF0aC5zaW4odGhldGEpXG4gICAgICAgIH07XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiBjeCArIChwdC54ICogY29zUHNpIC0gcHQueSAqIHNpblBzaSksXG4gICAgICAgICAgICB5OiBjeSArIChwdC54ICogc2luUHNpICsgcHQueSAqIGNvc1BzaSlcbiAgICAgICAgfTtcbiAgICB9XG4gICAgLy8gVE9ETyBuZWVkIHNvbWUgb3B0aW1pc2F0aW9ucy4gcG9zc2libHkgYnVpbGQgY2FjaGUgb25seSBmb3IgY3VydmVkIHNlZ21lbnRzP1xuICAgIGJ1aWxkRXF1aWRpc3RhbnRDYWNoZShpbnB1dFN0ZXAsIGlucHV0UHJlY2lzaW9uKSB7XG4gICAgICAgIGNvbnN0IGZ1bGxMZW4gPSB0aGlzLmdldFBhdGhMZW5ndGgoKTtcbiAgICAgICAgY29uc3QgcHJlY2lzaW9uID0gaW5wdXRQcmVjaXNpb24gfHwgMC4yNSAvLyBhY2N1cmFjeSB2cyBwZXJmb3JtYW5jZVxuICAgICAgICA7XG4gICAgICAgIGNvbnN0IHN0ZXAgPSBpbnB1dFN0ZXAgfHwgZnVsbExlbiAvIDEwMDtcbiAgICAgICAgaWYgKCF0aGlzLmVxdWlkaXN0YW50Q2FjaGUgfHwgdGhpcy5lcXVpZGlzdGFudENhY2hlLnN0ZXAgIT09IHN0ZXAgfHwgdGhpcy5lcXVpZGlzdGFudENhY2hlLnByZWNpc2lvbiAhPT0gcHJlY2lzaW9uKSB7XG4gICAgICAgICAgICAvLyBQcmVwYXJlIGNhY2hlXG4gICAgICAgICAgICB0aGlzLmVxdWlkaXN0YW50Q2FjaGUgPSB7XG4gICAgICAgICAgICAgICAgc3RlcCxcbiAgICAgICAgICAgICAgICBwcmVjaXNpb24sXG4gICAgICAgICAgICAgICAgcG9pbnRzOiBbXVxuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIC8vIENhbGN1bGF0ZSBwb2ludHNcbiAgICAgICAgICAgIGxldCBzID0gMDtcbiAgICAgICAgICAgIGZvcihsZXQgbCA9IDA7IGwgPD0gZnVsbExlbjsgbCArPSBwcmVjaXNpb24pe1xuICAgICAgICAgICAgICAgIGNvbnN0IHAwID0gdGhpcy5nZXRQb2ludE9uUGF0aChsKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwMSA9IHRoaXMuZ2V0UG9pbnRPblBhdGgobCArIHByZWNpc2lvbik7XG4gICAgICAgICAgICAgICAgaWYgKCFwMCB8fCAhcDEpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHMgKz0gdGhpcy5nZXRMaW5lTGVuZ3RoKHAwLngsIHAwLnksIHAxLngsIHAxLnkpO1xuICAgICAgICAgICAgICAgIGlmIChzID49IHN0ZXApIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5lcXVpZGlzdGFudENhY2hlLnBvaW50cy5wdXNoKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHg6IHAwLngsXG4gICAgICAgICAgICAgICAgICAgICAgICB5OiBwMC55LFxuICAgICAgICAgICAgICAgICAgICAgICAgZGlzdGFuY2U6IGxcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgIHMgLT0gc3RlcDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgZ2V0RXF1aWRpc3RhbnRQb2ludE9uUGF0aCh0YXJnZXREaXN0YW5jZSwgc3RlcCwgcHJlY2lzaW9uKSB7XG4gICAgICAgIHRoaXMuYnVpbGRFcXVpZGlzdGFudENhY2hlKHN0ZXAsIHByZWNpc2lvbik7XG4gICAgICAgIGlmICh0YXJnZXREaXN0YW5jZSA8IDAgfHwgdGFyZ2V0RGlzdGFuY2UgLSB0aGlzLmdldFBhdGhMZW5ndGgoKSA+IDAuMDAwMDUpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGlkeCA9IE1hdGgucm91bmQodGFyZ2V0RGlzdGFuY2UgLyB0aGlzLmdldFBhdGhMZW5ndGgoKSAqICh0aGlzLmVxdWlkaXN0YW50Q2FjaGUucG9pbnRzLmxlbmd0aCAtIDEpKTtcbiAgICAgICAgcmV0dXJuIHRoaXMuZXF1aWRpc3RhbnRDYWNoZS5wb2ludHNbaWR4XSB8fCBudWxsO1xuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyl7XG4gICAgICAgIHN1cGVyKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3RleHRQYXRoJztcbiAgICAgICAgdGhpcy50ZXh0V2lkdGggPSAwO1xuICAgICAgICB0aGlzLnRleHRIZWlnaHQgPSAwO1xuICAgICAgICB0aGlzLnBhdGhMZW5ndGggPSAtMTtcbiAgICAgICAgdGhpcy5nbHlwaEluZm8gPSBudWxsO1xuICAgICAgICB0aGlzLmxldHRlclNwYWNpbmdDYWNoZSA9IFtdO1xuICAgICAgICB0aGlzLm1lYXN1cmVzQ2FjaGUgPSBuZXcgTWFwKFtcbiAgICAgICAgICAgIFtcbiAgICAgICAgICAgICAgICAnJyxcbiAgICAgICAgICAgICAgICAwXG4gICAgICAgICAgICBdXG4gICAgICAgIF0pO1xuICAgICAgICBjb25zdCBwYXRoRWxlbWVudCA9IHRoaXMuZ2V0SHJlZkF0dHJpYnV0ZSgpLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgdGhpcy50ZXh0ID0gdGhpcy5nZXRUZXh0RnJvbU5vZGUoKTtcbiAgICAgICAgdGhpcy5kYXRhQXJyYXkgPSB0aGlzLnBhcnNlUGF0aERhdGEocGF0aEVsZW1lbnQpO1xuICAgIH1cbn1cblxuLy8gZ3JvdXBzOiAxOiBtaW1lLXR5cGUgKCsgY2hhcnNldCksIDI6IG1pbWUtdHlwZSAody9vIGNoYXJzZXQpLCAzOiBjaGFyc2V0LCA0OiBiYXNlNjQ/LCA1OiBib2R5XG5jb25zdCBkYXRhVXJpUmVnZXggPSAvXlxccypkYXRhOigoW14vLDtdK1xcL1teLyw7XSspKD86OyhbXiw7PV0rPVteLDs9XSspKT8pPyg/OjsoYmFzZTY0KSk/LCguKikkL2k7XG5jbGFzcyBJbWFnZUVsZW1lbnQgZXh0ZW5kcyBSZW5kZXJlZEVsZW1lbnQge1xuICAgIGFzeW5jIGxvYWRJbWFnZShocmVmKSB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBpbWFnZSA9IGF3YWl0IHRoaXMuZG9jdW1lbnQuY3JlYXRlSW1hZ2UoaHJlZik7XG4gICAgICAgICAgICB0aGlzLmltYWdlID0gaW1hZ2U7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoaWxlIGxvYWRpbmcgaW1hZ2UgXFxcIlwiLmNvbmNhdChocmVmLCBcIlxcXCI6XCIpLCBlcnIpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubG9hZGVkID0gdHJ1ZTtcbiAgICB9XG4gICAgYXN5bmMgbG9hZFN2ZyhocmVmKSB7XG4gICAgICAgIGNvbnN0IG1hdGNoID0gZGF0YVVyaVJlZ2V4LmV4ZWMoaHJlZik7XG4gICAgICAgIGlmIChtYXRjaCkge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG1hdGNoWzVdO1xuICAgICAgICAgICAgaWYgKGRhdGEpIHtcbiAgICAgICAgICAgICAgICBpZiAobWF0Y2hbNF0gPT09ICdiYXNlNjQnKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UgPSBhdG9iKGRhdGEpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UgPSBkZWNvZGVVUklDb21wb25lbnQoZGF0YSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMuZG9jdW1lbnQuZmV0Y2goaHJlZik7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ZnID0gYXdhaXQgcmVzcG9uc2UudGV4dCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaW1hZ2UgPSBzdmc7XG4gICAgICAgICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKFwiRXJyb3Igd2hpbGUgbG9hZGluZyBpbWFnZSBcXFwiXCIuY29uY2F0KGhyZWYsIFwiXFxcIjpcIiksIGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5sb2FkZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZW5kZXJDaGlsZHJlbihjdHgpIHtcbiAgICAgICAgY29uc3QgeyBkb2N1bWVudCAsIGltYWdlICwgbG9hZGVkICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgeCA9IHRoaXMuZ2V0QXR0cmlidXRlKCd4JykuZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGNvbnN0IHkgPSB0aGlzLmdldEF0dHJpYnV0ZSgneScpLmdldFBpeGVscygneScpO1xuICAgICAgICBjb25zdCB3aWR0aCA9IHRoaXMuZ2V0U3R5bGUoJ3dpZHRoJykuZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuZ2V0U3R5bGUoJ2hlaWdodCcpLmdldFBpeGVscygneScpO1xuICAgICAgICBpZiAoIWxvYWRlZCB8fCAhaW1hZ2UgfHwgIXdpZHRoIHx8ICFoZWlnaHQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBjdHguc2F2ZSgpO1xuICAgICAgICBjdHgudHJhbnNsYXRlKHgsIHkpO1xuICAgICAgICBpZiAodHlwZW9mIGltYWdlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uc3Qgc3ViRG9jdW1lbnQgPSBkb2N1bWVudC5jYW52Zy5mb3JrU3RyaW5nKGN0eCwgaW1hZ2UsIHtcbiAgICAgICAgICAgICAgICBpZ25vcmVNb3VzZTogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpZ25vcmVBbmltYXRpb246IHRydWUsXG4gICAgICAgICAgICAgICAgaWdub3JlRGltZW5zaW9uczogdHJ1ZSxcbiAgICAgICAgICAgICAgICBpZ25vcmVDbGVhcjogdHJ1ZSxcbiAgICAgICAgICAgICAgICBvZmZzZXRYOiAwLFxuICAgICAgICAgICAgICAgIG9mZnNldFk6IDAsXG4gICAgICAgICAgICAgICAgc2NhbGVXaWR0aDogd2lkdGgsXG4gICAgICAgICAgICAgICAgc2NhbGVIZWlnaHQ6IGhlaWdodFxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjb25zdCB7IGRvY3VtZW50RWxlbWVudCAgfSA9IHN1YkRvY3VtZW50LmRvY3VtZW50O1xuICAgICAgICAgICAgaWYgKGRvY3VtZW50RWxlbWVudCkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50RWxlbWVudC5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdm9pZCBzdWJEb2N1bWVudC5yZW5kZXIoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnNldFZpZXdCb3goe1xuICAgICAgICAgICAgICAgIGN0eCxcbiAgICAgICAgICAgICAgICBhc3BlY3RSYXRpbzogdGhpcy5nZXRBdHRyaWJ1dGUoJ3ByZXNlcnZlQXNwZWN0UmF0aW8nKS5nZXRTdHJpbmcoKSxcbiAgICAgICAgICAgICAgICB3aWR0aCxcbiAgICAgICAgICAgICAgICBkZXNpcmVkV2lkdGg6IGltYWdlLndpZHRoLFxuICAgICAgICAgICAgICAgIGhlaWdodCxcbiAgICAgICAgICAgICAgICBkZXNpcmVkSGVpZ2h0OiBpbWFnZS5oZWlnaHRcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKHRoaXMubG9hZGVkKSB7XG4gICAgICAgICAgICAgICAgaWYgKCEoJ2NvbXBsZXRlJyBpbiBpbWFnZSkgfHwgaW1hZ2UuY29tcGxldGUpIHtcbiAgICAgICAgICAgICAgICAgICAgY3R4LmRyYXdJbWFnZShpbWFnZSwgMCwgMCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGN0eC5yZXN0b3JlKCk7XG4gICAgfVxuICAgIGdldEJvdW5kaW5nQm94KCkge1xuICAgICAgICBjb25zdCB4ID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3gnKS5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgY29uc3QgeSA9IHRoaXMuZ2V0QXR0cmlidXRlKCd5JykuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy5nZXRTdHlsZSgnd2lkdGgnKS5nZXRQaXhlbHMoJ3gnKTtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5nZXRTdHlsZSgnaGVpZ2h0JykuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgIHJldHVybiBuZXcgQm91bmRpbmdCb3goeCwgeSwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0KTtcbiAgICB9XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpe1xuICAgICAgICBzdXBlcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdpbWFnZSc7XG4gICAgICAgIHRoaXMubG9hZGVkID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGhyZWYgPSB0aGlzLmdldEhyZWZBdHRyaWJ1dGUoKS5nZXRTdHJpbmcoKTtcbiAgICAgICAgaWYgKCFocmVmKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgaXNTdmcgPSBocmVmLmVuZHNXaXRoKCcuc3ZnJykgfHwgL15cXHMqZGF0YTppbWFnZVxcL3N2Z1xcK3htbC9pLnRlc3QoaHJlZik7XG4gICAgICAgIGRvY3VtZW50LmltYWdlcy5wdXNoKHRoaXMpO1xuICAgICAgICBpZiAoIWlzU3ZnKSB7XG4gICAgICAgICAgICB2b2lkIHRoaXMubG9hZEltYWdlKGhyZWYpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdm9pZCB0aGlzLmxvYWRTdmcoaHJlZik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmNsYXNzIFN5bWJvbEVsZW1lbnQgZXh0ZW5kcyBSZW5kZXJlZEVsZW1lbnQge1xuICAgIHJlbmRlcihfKSB7XG4gICAgLy8gTk8gUkVOREVSXG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3N5bWJvbCc7XG4gICAgfVxufVxuXG5jbGFzcyBTVkdGb250TG9hZGVyIHtcbiAgICBhc3luYyBsb2FkKGZvbnRGYW1pbHksIHVybCkge1xuICAgICAgICB0cnkge1xuICAgICAgICAgICAgY29uc3QgeyBkb2N1bWVudCAgfSA9IHRoaXM7XG4gICAgICAgICAgICBjb25zdCBzdmdEb2N1bWVudCA9IGF3YWl0IGRvY3VtZW50LmNhbnZnLnBhcnNlci5sb2FkKHVybCk7XG4gICAgICAgICAgICBjb25zdCBmb250cyA9IHN2Z0RvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdmb250Jyk7XG4gICAgICAgICAgICBBcnJheS5mcm9tKGZvbnRzKS5mb3JFYWNoKChmb250Tm9kZSk9PntcbiAgICAgICAgICAgICAgICBjb25zdCBmb250ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChmb250Tm9kZSk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZGVmaW5pdGlvbnNbZm9udEZhbWlseV0gPSBmb250O1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihcIkVycm9yIHdoaWxlIGxvYWRpbmcgZm9udCBcXFwiXCIuY29uY2F0KHVybCwgXCJcXFwiOlwiKSwgZXJyKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLmxvYWRlZCA9IHRydWU7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50KXtcbiAgICAgICAgdGhpcy5kb2N1bWVudCA9IGRvY3VtZW50O1xuICAgICAgICB0aGlzLmxvYWRlZCA9IGZhbHNlO1xuICAgICAgICBkb2N1bWVudC5mb250cy5wdXNoKHRoaXMpO1xuICAgIH1cbn1cblxuY2xhc3MgU3R5bGVFbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpe1xuICAgICAgICBzdXBlcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdzdHlsZSc7XG4gICAgICAgIGNvbnN0IGNzcyA9IGNvbXByZXNzU3BhY2VzKEFycmF5LmZyb20obm9kZS5jaGlsZE5vZGVzKS8vIE5FRUQgVEVTVFxuICAgICAgICAubWFwKChfKT0+Xy50ZXh0Q29udGVudFxuICAgICAgICApLmpvaW4oJycpLnJlcGxhY2UoLyhcXC9cXCooW14qXXxbXFxyXFxuXXwoXFwqKyhbXiovXXxbXFxyXFxuXSkpKSpcXCorXFwvKXwoXltcXHNdKlxcL1xcLy4qKS9nbSwgJycpIC8vIHJlbW92ZSBjb21tZW50c1xuICAgICAgICAucmVwbGFjZSgvQGltcG9ydC4qOy9nLCAnJykgLy8gcmVtb3ZlIGltcG9ydHNcbiAgICAgICAgKTtcbiAgICAgICAgY29uc3QgY3NzRGVmcyA9IGNzcy5zcGxpdCgnfScpO1xuICAgICAgICBjc3NEZWZzLmZvckVhY2goKF8xKT0+e1xuICAgICAgICAgICAgY29uc3QgZGVmID0gXzEudHJpbSgpO1xuICAgICAgICAgICAgaWYgKCFkZWYpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBjc3NQYXJ0cyA9IGRlZi5zcGxpdCgneycpO1xuICAgICAgICAgICAgY29uc3QgY3NzQ2xhc3NlcyA9IGNzc1BhcnRzWzBdLnNwbGl0KCcsJyk7XG4gICAgICAgICAgICBjb25zdCBjc3NQcm9wcyA9IGNzc1BhcnRzWzFdLnNwbGl0KCc7Jyk7XG4gICAgICAgICAgICBjc3NDbGFzc2VzLmZvckVhY2goKF8pPT57XG4gICAgICAgICAgICAgICAgY29uc3QgY3NzQ2xhc3MgPSBfLnRyaW0oKTtcbiAgICAgICAgICAgICAgICBpZiAoIWNzc0NsYXNzKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29uc3QgcHJvcHMgPSBkb2N1bWVudC5zdHlsZXNbY3NzQ2xhc3NdIHx8IHt9O1xuICAgICAgICAgICAgICAgIGNzc1Byb3BzLmZvckVhY2goKGNzc1Byb3ApPT57XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHByb3AgPSBjc3NQcm9wLmluZGV4T2YoJzonKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbmFtZSA9IGNzc1Byb3Auc3Vic3RyKDAsIHByb3ApLnRyaW0oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgdmFsdWUgPSBjc3NQcm9wLnN1YnN0cihwcm9wICsgMSwgY3NzUHJvcC5sZW5ndGggLSBwcm9wKS50cmltKCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChuYW1lICYmIHZhbHVlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBwcm9wc1tuYW1lXSA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgbmFtZSwgdmFsdWUpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuc3R5bGVzW2Nzc0NsYXNzXSA9IHByb3BzO1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LnN0eWxlc1NwZWNpZmljaXR5W2Nzc0NsYXNzXSA9IGdldFNlbGVjdG9yU3BlY2lmaWNpdHkoY3NzQ2xhc3MpO1xuICAgICAgICAgICAgICAgIGlmIChjc3NDbGFzcyA9PT0gJ0Bmb250LWZhY2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGZvbnRGYW1pbHkgPSBwcm9wc1snZm9udC1mYW1pbHknXS5nZXRTdHJpbmcoKS5yZXBsYWNlKC9cInwnL2csICcnKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3JjcyA9IHByb3BzLnNyYy5nZXRTdHJpbmcoKS5zcGxpdCgnLCcpO1xuICAgICAgICAgICAgICAgICAgICBzcmNzLmZvckVhY2goKHNyYyk9PntcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzcmMuaW5kZXhPZignZm9ybWF0KFwic3ZnXCIpJykgPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgdXJsID0gcGFyc2VFeHRlcm5hbFVybChzcmMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICh1cmwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgdm9pZCBuZXcgU1ZHRm9udExvYWRlcihkb2N1bWVudCkubG9hZChmb250RmFtaWx5LCB1cmwpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cbn1cblN0eWxlRWxlbWVudC5wYXJzZUV4dGVybmFsVXJsID0gcGFyc2VFeHRlcm5hbFVybDtcblxuY2xhc3MgVXNlRWxlbWVudCBleHRlbmRzIFJlbmRlcmVkRWxlbWVudCB7XG4gICAgc2V0Q29udGV4dChjdHgpIHtcbiAgICAgICAgc3VwZXIuc2V0Q29udGV4dChjdHgpO1xuICAgICAgICBjb25zdCB4QXR0ciA9IHRoaXMuZ2V0QXR0cmlidXRlKCd4Jyk7XG4gICAgICAgIGNvbnN0IHlBdHRyID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ3knKTtcbiAgICAgICAgaWYgKHhBdHRyLmhhc1ZhbHVlKCkpIHtcbiAgICAgICAgICAgIGN0eC50cmFuc2xhdGUoeEF0dHIuZ2V0UGl4ZWxzKCd4JyksIDApO1xuICAgICAgICB9XG4gICAgICAgIGlmICh5QXR0ci5oYXNWYWx1ZSgpKSB7XG4gICAgICAgICAgICBjdHgudHJhbnNsYXRlKDAsIHlBdHRyLmdldFBpeGVscygneScpKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBwYXRoKGN0eCkge1xuICAgICAgICBjb25zdCB7IGVsZW1lbnQgIH0gPSB0aGlzO1xuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5wYXRoKGN0eCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmVuZGVyQ2hpbGRyZW4oY3R4KSB7XG4gICAgICAgIGNvbnN0IHsgZG9jdW1lbnQgLCBlbGVtZW50ICB9ID0gdGhpcztcbiAgICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGxldCB0ZW1wU3ZnID0gZWxlbWVudDtcbiAgICAgICAgICAgIGlmIChlbGVtZW50LnR5cGUgPT09ICdzeW1ib2wnKSB7XG4gICAgICAgICAgICAgICAgLy8gcmVuZGVyIG1lIHVzaW5nIGEgdGVtcG9yYXJ5IHN2ZyBlbGVtZW50IGluIHN5bWJvbCBjYXNlcyAoaHR0cDovL3d3dy53My5vcmcvVFIvU1ZHL3N0cnVjdC5odG1sI1VzZUVsZW1lbnQpXG4gICAgICAgICAgICAgICAgdGVtcFN2ZyA9IG5ldyBTVkdFbGVtZW50KGRvY3VtZW50KTtcbiAgICAgICAgICAgICAgICB0ZW1wU3ZnLmF0dHJpYnV0ZXMudmlld0JveCA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ3ZpZXdCb3gnLCBlbGVtZW50LmdldEF0dHJpYnV0ZSgndmlld0JveCcpLmdldFN0cmluZygpKTtcbiAgICAgICAgICAgICAgICB0ZW1wU3ZnLmF0dHJpYnV0ZXMucHJlc2VydmVBc3BlY3RSYXRpbyA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ3ByZXNlcnZlQXNwZWN0UmF0aW8nLCBlbGVtZW50LmdldEF0dHJpYnV0ZSgncHJlc2VydmVBc3BlY3RSYXRpbycpLmdldFN0cmluZygpKTtcbiAgICAgICAgICAgICAgICB0ZW1wU3ZnLmF0dHJpYnV0ZXMub3ZlcmZsb3cgPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsICdvdmVyZmxvdycsIGVsZW1lbnQuZ2V0QXR0cmlidXRlKCdvdmVyZmxvdycpLmdldFN0cmluZygpKTtcbiAgICAgICAgICAgICAgICB0ZW1wU3ZnLmNoaWxkcmVuID0gZWxlbWVudC5jaGlsZHJlbjtcbiAgICAgICAgICAgICAgICAvLyBlbGVtZW50IGlzIHN0aWxsIHRoZSBwYXJlbnQgb2YgdGhlIGNoaWxkcmVuXG4gICAgICAgICAgICAgICAgZWxlbWVudC5zdHlsZXMub3BhY2l0eSA9IG5ldyBQcm9wZXJ0eShkb2N1bWVudCwgJ29wYWNpdHknLCB0aGlzLmNhbGN1bGF0ZU9wYWNpdHkoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodGVtcFN2Zy50eXBlID09PSAnc3ZnJykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHdpZHRoU3R5bGUgPSB0aGlzLmdldFN0eWxlKCd3aWR0aCcsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICBjb25zdCBoZWlnaHRTdHlsZSA9IHRoaXMuZ2V0U3R5bGUoJ2hlaWdodCcsIGZhbHNlLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAvLyBpZiBzeW1ib2wgb3Igc3ZnLCBpbmhlcml0IHdpZHRoL2hlaWdodCBmcm9tIG1lXG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoU3R5bGUuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wU3ZnLmF0dHJpYnV0ZXMud2lkdGggPSBuZXcgUHJvcGVydHkoZG9jdW1lbnQsICd3aWR0aCcsIHdpZHRoU3R5bGUuZ2V0U3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAoaGVpZ2h0U3R5bGUuaGFzVmFsdWUoKSkge1xuICAgICAgICAgICAgICAgICAgICB0ZW1wU3ZnLmF0dHJpYnV0ZXMuaGVpZ2h0ID0gbmV3IFByb3BlcnR5KGRvY3VtZW50LCAnaGVpZ2h0JywgaGVpZ2h0U3R5bGUuZ2V0U3RyaW5nKCkpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IG9sZFBhcmVudCA9IHRlbXBTdmcucGFyZW50O1xuICAgICAgICAgICAgdGVtcFN2Zy5wYXJlbnQgPSB0aGlzO1xuICAgICAgICAgICAgdGVtcFN2Zy5yZW5kZXIoY3R4KTtcbiAgICAgICAgICAgIHRlbXBTdmcucGFyZW50ID0gb2xkUGFyZW50O1xuICAgICAgICB9XG4gICAgfVxuICAgIGdldEJvdW5kaW5nQm94KGN0eCkge1xuICAgICAgICBjb25zdCB7IGVsZW1lbnQgIH0gPSB0aGlzO1xuICAgICAgICBpZiAoZWxlbWVudCkge1xuICAgICAgICAgICAgcmV0dXJuIGVsZW1lbnQuZ2V0Qm91bmRpbmdCb3goY3R4KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG4gICAgZWxlbWVudFRyYW5zZm9ybSgpIHtcbiAgICAgICAgY29uc3QgeyBkb2N1bWVudCAsIGVsZW1lbnQgIH0gPSB0aGlzO1xuICAgICAgICBpZiAoIWVsZW1lbnQpIHtcbiAgICAgICAgICAgIHJldHVybiBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBUcmFuc2Zvcm0uZnJvbUVsZW1lbnQoZG9jdW1lbnQsIGVsZW1lbnQpO1xuICAgIH1cbiAgICBnZXQgZWxlbWVudCgpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNhY2hlZEVsZW1lbnQpIHtcbiAgICAgICAgICAgIHRoaXMuY2FjaGVkRWxlbWVudCA9IHRoaXMuZ2V0SHJlZkF0dHJpYnV0ZSgpLmdldERlZmluaXRpb24oKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5jYWNoZWRFbGVtZW50O1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICd1c2UnO1xuICAgIH1cbn1cblxuZnVuY3Rpb24gaW1HZXQoaW1nLCB4LCB5LCB3aWR0aCwgX2hlaWdodCwgcmdiYSkge1xuICAgIHJldHVybiBpbWdbeSAqIHdpZHRoICogNCArIHggKiA0ICsgcmdiYV07XG59XG5mdW5jdGlvbiBpbVNldChpbWcsIHgsIHksIHdpZHRoLCBfaGVpZ2h0LCByZ2JhLCB2YWwpIHtcbiAgICBpbWdbeSAqIHdpZHRoICogNCArIHggKiA0ICsgcmdiYV0gPSB2YWw7XG59XG5mdW5jdGlvbiBtKG1hdHJpeCwgaSwgdikge1xuICAgIGNvbnN0IG1pID0gbWF0cml4W2ldO1xuICAgIHJldHVybiBtaSAqIHY7XG59XG5mdW5jdGlvbiBjKGEsIG0xLCBtMiwgbTMpIHtcbiAgICByZXR1cm4gbTEgKyBNYXRoLmNvcyhhKSAqIG0yICsgTWF0aC5zaW4oYSkgKiBtMztcbn1cbmNsYXNzIEZlQ29sb3JNYXRyaXhFbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgYXBwbHkoY3R4LCBfeCwgX3ksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgLy8gYXNzdW1pbmcgeD09MCAmJiB5PT0wIGZvciBub3dcbiAgICAgICAgY29uc3QgeyBpbmNsdWRlT3BhY2l0eSAsIG1hdHJpeCAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHNyY0RhdGEgPSBjdHguZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICBmb3IobGV0IHkgPSAwOyB5IDwgaGVpZ2h0OyB5Kyspe1xuICAgICAgICAgICAgZm9yKGxldCB4ID0gMDsgeCA8IHdpZHRoOyB4Kyspe1xuICAgICAgICAgICAgICAgIGNvbnN0IHIgPSBpbUdldChzcmNEYXRhLmRhdGEsIHgsIHksIHdpZHRoLCBoZWlnaHQsIDApO1xuICAgICAgICAgICAgICAgIGNvbnN0IGcgPSBpbUdldChzcmNEYXRhLmRhdGEsIHgsIHksIHdpZHRoLCBoZWlnaHQsIDEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGIgPSBpbUdldChzcmNEYXRhLmRhdGEsIHgsIHksIHdpZHRoLCBoZWlnaHQsIDIpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSBpbUdldChzcmNEYXRhLmRhdGEsIHgsIHksIHdpZHRoLCBoZWlnaHQsIDMpO1xuICAgICAgICAgICAgICAgIGxldCBuciA9IG0obWF0cml4LCAwLCByKSArIG0obWF0cml4LCAxLCBnKSArIG0obWF0cml4LCAyLCBiKSArIG0obWF0cml4LCAzLCBhKSArIG0obWF0cml4LCA0LCAxKTtcbiAgICAgICAgICAgICAgICBsZXQgbmcgPSBtKG1hdHJpeCwgNSwgcikgKyBtKG1hdHJpeCwgNiwgZykgKyBtKG1hdHJpeCwgNywgYikgKyBtKG1hdHJpeCwgOCwgYSkgKyBtKG1hdHJpeCwgOSwgMSk7XG4gICAgICAgICAgICAgICAgbGV0IG5iID0gbShtYXRyaXgsIDEwLCByKSArIG0obWF0cml4LCAxMSwgZykgKyBtKG1hdHJpeCwgMTIsIGIpICsgbShtYXRyaXgsIDEzLCBhKSArIG0obWF0cml4LCAxNCwgMSk7XG4gICAgICAgICAgICAgICAgbGV0IG5hID0gbShtYXRyaXgsIDE1LCByKSArIG0obWF0cml4LCAxNiwgZykgKyBtKG1hdHJpeCwgMTcsIGIpICsgbShtYXRyaXgsIDE4LCBhKSArIG0obWF0cml4LCAxOSwgMSk7XG4gICAgICAgICAgICAgICAgaWYgKGluY2x1ZGVPcGFjaXR5KSB7XG4gICAgICAgICAgICAgICAgICAgIG5yID0gMDtcbiAgICAgICAgICAgICAgICAgICAgbmcgPSAwO1xuICAgICAgICAgICAgICAgICAgICBuYiA9IDA7XG4gICAgICAgICAgICAgICAgICAgIG5hICo9IGEgLyAyNTU7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGltU2V0KHNyY0RhdGEuZGF0YSwgeCwgeSwgd2lkdGgsIGhlaWdodCwgMCwgbnIpO1xuICAgICAgICAgICAgICAgIGltU2V0KHNyY0RhdGEuZGF0YSwgeCwgeSwgd2lkdGgsIGhlaWdodCwgMSwgbmcpO1xuICAgICAgICAgICAgICAgIGltU2V0KHNyY0RhdGEuZGF0YSwgeCwgeSwgd2lkdGgsIGhlaWdodCwgMiwgbmIpO1xuICAgICAgICAgICAgICAgIGltU2V0KHNyY0RhdGEuZGF0YSwgeCwgeSwgd2lkdGgsIGhlaWdodCwgMywgbmEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIGN0eC5wdXRJbWFnZURhdGEoc3JjRGF0YSwgMCwgMCk7XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKXtcbiAgICAgICAgc3VwZXIoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnZmVDb2xvck1hdHJpeCc7XG4gICAgICAgIGxldCBtYXRyaXggPSB0b051bWJlcnModGhpcy5nZXRBdHRyaWJ1dGUoJ3ZhbHVlcycpLmdldFN0cmluZygpKTtcbiAgICAgICAgc3dpdGNoKHRoaXMuZ2V0QXR0cmlidXRlKCd0eXBlJykuZ2V0U3RyaW5nKCdtYXRyaXgnKSl7XG4gICAgICAgICAgICBjYXNlICdzYXR1cmF0ZSc6XG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBzID0gbWF0cml4WzBdO1xuICAgICAgICAgICAgICAgICAgICAvKiBlc2xpbnQtZGlzYWJsZSBhcnJheS1lbGVtZW50LW5ld2xpbmUgKi8gbWF0cml4ID0gW1xuICAgICAgICAgICAgICAgICAgICAgICAgMC4yMTMgKyAwLjc4NyAqIHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLjcxNSAtIDAuNzE1ICogcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMDcyIC0gMC4wNzIgKiBzLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLjIxMyAtIDAuMjEzICogcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuNzE1ICsgMC4yODUgKiBzLFxuICAgICAgICAgICAgICAgICAgICAgICAgMC4wNzIgLSAwLjA3MiAqIHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAuMjEzIC0gMC4yMTMgKiBzLFxuICAgICAgICAgICAgICAgICAgICAgICAgMC43MTUgLSAwLjcxNSAqIHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLjA3MiArIDAuOTI4ICogcyxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMVxuICAgICAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlICdodWVSb3RhdGUnOlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYSA9IG1hdHJpeFswXSAqIE1hdGguUEkgLyAxODA7XG4gICAgICAgICAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGFycmF5LWVsZW1lbnQtbmV3bGluZSAqLyBtYXRyaXggPSBbXG4gICAgICAgICAgICAgICAgICAgICAgICBjKGEsIDAuMjEzLCAwLjc4NywgLTAuMjEzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGMoYSwgMC43MTUsIC0wLjcxNSwgLTAuNzE1KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGMoYSwgMC4wNzIsIC0wLjA3MiwgMC45MjgpLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBjKGEsIDAuMjEzLCAtMC4yMTMsIDAuMTQzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGMoYSwgMC43MTUsIDAuMjg1LCAwLjE0KSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGMoYSwgMC4wNzIsIC0wLjA3MiwgLTAuMjgzKSxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgYyhhLCAwLjIxMywgLTAuMjEzLCAtMC43ODcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgYyhhLCAwLjcxNSwgLTAuNzE1LCAwLjcxNSksXG4gICAgICAgICAgICAgICAgICAgICAgICBjKGEsIDAuMDcyLCAwLjkyOCwgMC4wNzIpLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICAxXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgJ2x1bWluYW5jZVRvQWxwaGEnOlxuICAgICAgICAgICAgICAgIC8qIGVzbGludC1kaXNhYmxlIGFycmF5LWVsZW1lbnQtbmV3bGluZSAqLyBtYXRyaXggPSBbXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAuMjEyNSxcbiAgICAgICAgICAgICAgICAgICAgMC43MTU0LFxuICAgICAgICAgICAgICAgICAgICAwLjA3MjEsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgIDFcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMubWF0cml4ID0gbWF0cml4O1xuICAgICAgICB0aGlzLmluY2x1ZGVPcGFjaXR5ID0gdGhpcy5nZXRBdHRyaWJ1dGUoJ2luY2x1ZGVPcGFjaXR5JykuaGFzVmFsdWUoKTtcbiAgICB9XG59XG5cbmNsYXNzIE1hc2tFbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgYXBwbHkoY3R4LCBlbGVtZW50KSB7XG4gICAgICAgIGNvbnN0IHsgZG9jdW1lbnQgIH0gPSB0aGlzO1xuICAgICAgICAvLyByZW5kZXIgYXMgdGVtcCBzdmdcbiAgICAgICAgbGV0IHggPSB0aGlzLmdldEF0dHJpYnV0ZSgneCcpLmdldFBpeGVscygneCcpO1xuICAgICAgICBsZXQgeSA9IHRoaXMuZ2V0QXR0cmlidXRlKCd5JykuZ2V0UGl4ZWxzKCd5Jyk7XG4gICAgICAgIGxldCB3aWR0aCA9IHRoaXMuZ2V0U3R5bGUoJ3dpZHRoJykuZ2V0UGl4ZWxzKCd4Jyk7XG4gICAgICAgIGxldCBoZWlnaHQgPSB0aGlzLmdldFN0eWxlKCdoZWlnaHQnKS5nZXRQaXhlbHMoJ3knKTtcbiAgICAgICAgaWYgKCF3aWR0aCAmJiAhaGVpZ2h0KSB7XG4gICAgICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9IG5ldyBCb3VuZGluZ0JveCgpO1xuICAgICAgICAgICAgdGhpcy5jaGlsZHJlbi5mb3JFYWNoKChjaGlsZCk9PntcbiAgICAgICAgICAgICAgICBib3VuZGluZ0JveC5hZGRCb3VuZGluZ0JveChjaGlsZC5nZXRCb3VuZGluZ0JveChjdHgpKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgeCA9IE1hdGguZmxvb3IoYm91bmRpbmdCb3gueDEpO1xuICAgICAgICAgICAgeSA9IE1hdGguZmxvb3IoYm91bmRpbmdCb3gueTEpO1xuICAgICAgICAgICAgd2lkdGggPSBNYXRoLmZsb29yKGJvdW5kaW5nQm94LndpZHRoKTtcbiAgICAgICAgICAgIGhlaWdodCA9IE1hdGguZmxvb3IoYm91bmRpbmdCb3guaGVpZ2h0KTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBpZ25vcmVkU3R5bGVzID0gdGhpcy5yZW1vdmVTdHlsZXMoZWxlbWVudCwgTWFza0VsZW1lbnQuaWdub3JlU3R5bGVzKTtcbiAgICAgICAgY29uc3QgbWFza0NhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUNhbnZhcyh4ICsgd2lkdGgsIHkgKyBoZWlnaHQpO1xuICAgICAgICBjb25zdCBtYXNrQ3R4ID0gbWFza0NhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBkb2N1bWVudC5zY3JlZW4uc2V0RGVmYXVsdHMobWFza0N0eCk7XG4gICAgICAgIHRoaXMucmVuZGVyQ2hpbGRyZW4obWFza0N0eCk7XG4gICAgICAgIC8vIGNvbnZlcnQgbWFzayB0byBhbHBoYSB3aXRoIGEgZmFrZSBub2RlXG4gICAgICAgIC8vIFRPRE86IHJlZmFjdG9yIG91dCBhcHBseSBmcm9tIGZlQ29sb3JNYXRyaXhcbiAgICAgICAgbmV3IEZlQ29sb3JNYXRyaXhFbGVtZW50KGRvY3VtZW50LCB7XG4gICAgICAgICAgICBub2RlVHlwZTogMSxcbiAgICAgICAgICAgIGNoaWxkTm9kZXM6IFtdLFxuICAgICAgICAgICAgYXR0cmlidXRlczogW1xuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgbm9kZU5hbWU6ICd0eXBlJyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICdsdW1pbmFuY2VUb0FscGhhJ1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBub2RlTmFtZTogJ2luY2x1ZGVPcGFjaXR5JyxcbiAgICAgICAgICAgICAgICAgICAgdmFsdWU6ICd0cnVlJ1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIF1cbiAgICAgICAgfSkuYXBwbHkobWFza0N0eCwgMCwgMCwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0KTtcbiAgICAgICAgY29uc3QgdG1wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlQ2FudmFzKHggKyB3aWR0aCwgeSArIGhlaWdodCk7XG4gICAgICAgIGNvbnN0IHRtcEN0eCA9IHRtcENhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xuICAgICAgICBkb2N1bWVudC5zY3JlZW4uc2V0RGVmYXVsdHModG1wQ3R4KTtcbiAgICAgICAgZWxlbWVudC5yZW5kZXIodG1wQ3R4KTtcbiAgICAgICAgdG1wQ3R4Lmdsb2JhbENvbXBvc2l0ZU9wZXJhdGlvbiA9ICdkZXN0aW5hdGlvbi1pbic7XG4gICAgICAgIHRtcEN0eC5maWxsU3R5bGUgPSBtYXNrQ3R4LmNyZWF0ZVBhdHRlcm4obWFza0NhbnZhcywgJ25vLXJlcGVhdCcpO1xuICAgICAgICB0bXBDdHguZmlsbFJlY3QoMCwgMCwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0KTtcbiAgICAgICAgY3R4LmZpbGxTdHlsZSA9IHRtcEN0eC5jcmVhdGVQYXR0ZXJuKHRtcENhbnZhcywgJ25vLXJlcGVhdCcpO1xuICAgICAgICBjdHguZmlsbFJlY3QoMCwgMCwgeCArIHdpZHRoLCB5ICsgaGVpZ2h0KTtcbiAgICAgICAgLy8gcmVhc3NpZ24gbWFza1xuICAgICAgICB0aGlzLnJlc3RvcmVTdHlsZXMoZWxlbWVudCwgaWdub3JlZFN0eWxlcyk7XG4gICAgfVxuICAgIHJlbmRlcihfKSB7XG4gICAgLy8gTk8gUkVOREVSXG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ21hc2snO1xuICAgIH1cbn1cbk1hc2tFbGVtZW50Lmlnbm9yZVN0eWxlcyA9IFtcbiAgICAnbWFzaycsXG4gICAgJ3RyYW5zZm9ybScsXG4gICAgJ2NsaXAtcGF0aCdcbl07XG5cbmNvbnN0IG5vb3AgPSAoKT0+e1xuLy8gTk9PUFxufTtcbmNsYXNzIENsaXBQYXRoRWxlbWVudCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFwcGx5KGN0eCkge1xuICAgICAgICBjb25zdCB7IGRvY3VtZW50ICB9ID0gdGhpcztcbiAgICAgICAgY29uc3QgY29udGV4dFByb3RvID0gUmVmbGVjdC5nZXRQcm90b3R5cGVPZihjdHgpO1xuICAgICAgICBjb25zdCB7IGJlZ2luUGF0aCAsIGNsb3NlUGF0aCAgfSA9IGN0eDtcbiAgICAgICAgaWYgKGNvbnRleHRQcm90bykge1xuICAgICAgICAgICAgY29udGV4dFByb3RvLmJlZ2luUGF0aCA9IG5vb3A7XG4gICAgICAgICAgICBjb250ZXh0UHJvdG8uY2xvc2VQYXRoID0gbm9vcDtcbiAgICAgICAgfVxuICAgICAgICBSZWZsZWN0LmFwcGx5KGJlZ2luUGF0aCwgY3R4LCBbXSk7XG4gICAgICAgIHRoaXMuY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpPT57XG4gICAgICAgICAgICBpZiAoISgncGF0aCcgaW4gY2hpbGQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHRyYW5zZm9ybSA9ICdlbGVtZW50VHJhbnNmb3JtJyBpbiBjaGlsZCA/IGNoaWxkLmVsZW1lbnRUcmFuc2Zvcm0oKSA6IG51bGwgLy8gaGFuZGxlIDx1c2UgLz5cbiAgICAgICAgICAgIDtcbiAgICAgICAgICAgIGlmICghdHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtID0gVHJhbnNmb3JtLmZyb21FbGVtZW50KGRvY3VtZW50LCBjaGlsZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAodHJhbnNmb3JtKSB7XG4gICAgICAgICAgICAgICAgdHJhbnNmb3JtLmFwcGx5KGN0eCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjaGlsZC5wYXRoKGN0eCk7XG4gICAgICAgICAgICBpZiAoY29udGV4dFByb3RvKSB7XG4gICAgICAgICAgICAgICAgY29udGV4dFByb3RvLmNsb3NlUGF0aCA9IGNsb3NlUGF0aDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cmFuc2Zvcm0pIHtcbiAgICAgICAgICAgICAgICB0cmFuc2Zvcm0udW5hcHBseShjdHgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgUmVmbGVjdC5hcHBseShjbG9zZVBhdGgsIGN0eCwgW10pO1xuICAgICAgICBjdHguY2xpcCgpO1xuICAgICAgICBpZiAoY29udGV4dFByb3RvKSB7XG4gICAgICAgICAgICBjb250ZXh0UHJvdG8uYmVnaW5QYXRoID0gYmVnaW5QYXRoO1xuICAgICAgICAgICAgY29udGV4dFByb3RvLmNsb3NlUGF0aCA9IGNsb3NlUGF0aDtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZW5kZXIoXykge1xuICAgIC8vIE5PIFJFTkRFUlxuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdjbGlwUGF0aCc7XG4gICAgfVxufVxuXG5jbGFzcyBGaWx0ZXJFbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgYXBwbHkoY3R4LCBlbGVtZW50KSB7XG4gICAgICAgIC8vIHJlbmRlciBhcyB0ZW1wIHN2Z1xuICAgICAgICBjb25zdCB7IGRvY3VtZW50ICwgY2hpbGRyZW4gIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBib3VuZGluZ0JveCA9ICdnZXRCb3VuZGluZ0JveCcgaW4gZWxlbWVudCA/IGVsZW1lbnQuZ2V0Qm91bmRpbmdCb3goY3R4KSA6IG51bGw7XG4gICAgICAgIGlmICghYm91bmRpbmdCb3gpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBsZXQgcHggPSAwO1xuICAgICAgICBsZXQgcHkgPSAwO1xuICAgICAgICBjaGlsZHJlbi5mb3JFYWNoKChjaGlsZCk9PntcbiAgICAgICAgICAgIGNvbnN0IGVmZCA9IGNoaWxkLmV4dHJhRmlsdGVyRGlzdGFuY2UgfHwgMDtcbiAgICAgICAgICAgIHB4ID0gTWF0aC5tYXgocHgsIGVmZCk7XG4gICAgICAgICAgICBweSA9IE1hdGgubWF4KHB5LCBlZmQpO1xuICAgICAgICB9KTtcbiAgICAgICAgY29uc3Qgd2lkdGggPSBNYXRoLmZsb29yKGJvdW5kaW5nQm94LndpZHRoKTtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gTWF0aC5mbG9vcihib3VuZGluZ0JveC5oZWlnaHQpO1xuICAgICAgICBjb25zdCB0bXBDYW52YXNXaWR0aCA9IHdpZHRoICsgMiAqIHB4O1xuICAgICAgICBjb25zdCB0bXBDYW52YXNIZWlnaHQgPSBoZWlnaHQgKyAyICogcHk7XG4gICAgICAgIGlmICh0bXBDYW52YXNXaWR0aCA8IDEgfHwgdG1wQ2FudmFzSGVpZ2h0IDwgMSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHggPSBNYXRoLmZsb29yKGJvdW5kaW5nQm94LngpO1xuICAgICAgICBjb25zdCB5ID0gTWF0aC5mbG9vcihib3VuZGluZ0JveC55KTtcbiAgICAgICAgY29uc3QgaWdub3JlZFN0eWxlcyA9IHRoaXMucmVtb3ZlU3R5bGVzKGVsZW1lbnQsIEZpbHRlckVsZW1lbnQuaWdub3JlU3R5bGVzKTtcbiAgICAgICAgY29uc3QgdG1wQ2FudmFzID0gZG9jdW1lbnQuY3JlYXRlQ2FudmFzKHRtcENhbnZhc1dpZHRoLCB0bXBDYW52YXNIZWlnaHQpO1xuICAgICAgICBjb25zdCB0bXBDdHggPSB0bXBDYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAgICAgZG9jdW1lbnQuc2NyZWVuLnNldERlZmF1bHRzKHRtcEN0eCk7XG4gICAgICAgIHRtcEN0eC50cmFuc2xhdGUoLXggKyBweCwgLXkgKyBweSk7XG4gICAgICAgIGVsZW1lbnQucmVuZGVyKHRtcEN0eCk7XG4gICAgICAgIC8vIGFwcGx5IGZpbHRlcnNcbiAgICAgICAgY2hpbGRyZW4uZm9yRWFjaCgoY2hpbGQpPT57XG4gICAgICAgICAgICBpZiAodHlwZW9mIGNoaWxkLmFwcGx5ID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgY2hpbGQuYXBwbHkodG1wQ3R4LCAwLCAwLCB0bXBDYW52YXNXaWR0aCwgdG1wQ2FudmFzSGVpZ2h0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIC8vIHJlbmRlciBvbiBtZVxuICAgICAgICBjdHguZHJhd0ltYWdlKHRtcENhbnZhcywgMCwgMCwgdG1wQ2FudmFzV2lkdGgsIHRtcENhbnZhc0hlaWdodCwgeCAtIHB4LCB5IC0gcHksIHRtcENhbnZhc1dpZHRoLCB0bXBDYW52YXNIZWlnaHQpO1xuICAgICAgICB0aGlzLnJlc3RvcmVTdHlsZXMoZWxlbWVudCwgaWdub3JlZFN0eWxlcyk7XG4gICAgfVxuICAgIHJlbmRlcihfKSB7XG4gICAgLy8gTk8gUkVOREVSXG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2ZpbHRlcic7XG4gICAgfVxufVxuRmlsdGVyRWxlbWVudC5pZ25vcmVTdHlsZXMgPSBbXG4gICAgJ2ZpbHRlcicsXG4gICAgJ3RyYW5zZm9ybScsXG4gICAgJ2NsaXAtcGF0aCdcbl07XG5cbmNsYXNzIEZlRHJvcFNoYWRvd0VsZW1lbnQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBhcHBseShfLCBfeCwgX3ksIF93aWR0aCwgX2hlaWdodCkge1xuICAgIC8vIFRPRE86IGltcGxlbWVudFxuICAgIH1cbiAgICBjb25zdHJ1Y3Rvcihkb2N1bWVudCwgbm9kZSwgY2FwdHVyZVRleHROb2Rlcyl7XG4gICAgICAgIHN1cGVyKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2ZlRHJvcFNoYWRvdyc7XG4gICAgICAgIHRoaXMuYWRkU3R5bGVzRnJvbVN0eWxlRGVmaW5pdGlvbigpO1xuICAgIH1cbn1cblxuY2xhc3MgRmVNb3JwaG9sb2d5RWxlbWVudCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGFwcGx5KF8sIF94LCBfeSwgX3dpZHRoLCBfaGVpZ2h0KSB7XG4gICAgLy8gVE9ETzogaW1wbGVtZW50XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ2ZlTW9ycGhvbG9neSc7XG4gICAgfVxufVxuXG5jbGFzcyBGZUNvbXBvc2l0ZUVsZW1lbnQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBhcHBseShfLCBfeCwgX3ksIF93aWR0aCwgX2hlaWdodCkge1xuICAgIC8vIFRPRE86IGltcGxlbWVudFxuICAgIH1cbiAgICBjb25zdHJ1Y3RvciguLi5hcmdzKXtcbiAgICAgICAgc3VwZXIoLi4uYXJncyk7XG4gICAgICAgIHRoaXMudHlwZSA9ICdmZUNvbXBvc2l0ZSc7XG4gICAgfVxufVxuXG5jbGFzcyBGZUdhdXNzaWFuQmx1ckVsZW1lbnQgZXh0ZW5kcyBFbGVtZW50IHtcbiAgICBhcHBseShjdHgsIHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgICAgY29uc3QgeyBkb2N1bWVudCAsIGJsdXJSYWRpdXMgIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCBib2R5ID0gZG9jdW1lbnQud2luZG93ID8gZG9jdW1lbnQud2luZG93LmRvY3VtZW50LmJvZHkgOiBudWxsO1xuICAgICAgICBjb25zdCBjYW52YXMgPSBjdHguY2FudmFzO1xuICAgICAgICAvLyBTdGFja0JsdXIgcmVxdWlyZXMgY2FudmFzIGJlIG9uIGRvY3VtZW50XG4gICAgICAgIGNhbnZhcy5pZCA9IGRvY3VtZW50LmdldFVuaXF1ZUlkKCk7XG4gICAgICAgIGlmIChib2R5KSB7XG4gICAgICAgICAgICBjYW52YXMuc3R5bGUuZGlzcGxheSA9ICdub25lJztcbiAgICAgICAgICAgIGJvZHkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcbiAgICAgICAgfVxuICAgICAgICBzdGFja2JsdXJDYW52YXMuY2FudmFzUkdCQShjYW52YXMsIHgsIHksIHdpZHRoLCBoZWlnaHQsIGJsdXJSYWRpdXMpO1xuICAgICAgICBpZiAoYm9keSkge1xuICAgICAgICAgICAgYm9keS5yZW1vdmVDaGlsZChjYW52YXMpO1xuICAgICAgICB9XG4gICAgfVxuICAgIGNvbnN0cnVjdG9yKGRvY3VtZW50LCBub2RlLCBjYXB0dXJlVGV4dE5vZGVzKXtcbiAgICAgICAgc3VwZXIoZG9jdW1lbnQsIG5vZGUsIGNhcHR1cmVUZXh0Tm9kZXMpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnZmVHYXVzc2lhbkJsdXInO1xuICAgICAgICB0aGlzLmJsdXJSYWRpdXMgPSBNYXRoLmZsb29yKHRoaXMuZ2V0QXR0cmlidXRlKCdzdGREZXZpYXRpb24nKS5nZXROdW1iZXIoKSk7XG4gICAgICAgIHRoaXMuZXh0cmFGaWx0ZXJEaXN0YW5jZSA9IHRoaXMuYmx1clJhZGl1cztcbiAgICB9XG59XG5cbmNsYXNzIFRpdGxlRWxlbWVudCBleHRlbmRzIEVsZW1lbnQge1xuICAgIGNvbnN0cnVjdG9yKC4uLmFyZ3Mpe1xuICAgICAgICBzdXBlciguLi5hcmdzKTtcbiAgICAgICAgdGhpcy50eXBlID0gJ3RpdGxlJztcbiAgICB9XG59XG5cbmNsYXNzIERlc2NFbGVtZW50IGV4dGVuZHMgRWxlbWVudCB7XG4gICAgY29uc3RydWN0b3IoLi4uYXJncyl7XG4gICAgICAgIHN1cGVyKC4uLmFyZ3MpO1xuICAgICAgICB0aGlzLnR5cGUgPSAnZGVzYyc7XG4gICAgfVxufVxuXG5jb25zdCBlbGVtZW50cyA9IHtcbiAgICAnc3ZnJzogU1ZHRWxlbWVudCxcbiAgICAncmVjdCc6IFJlY3RFbGVtZW50LFxuICAgICdjaXJjbGUnOiBDaXJjbGVFbGVtZW50LFxuICAgICdlbGxpcHNlJzogRWxsaXBzZUVsZW1lbnQsXG4gICAgJ2xpbmUnOiBMaW5lRWxlbWVudCxcbiAgICAncG9seWxpbmUnOiBQb2x5bGluZUVsZW1lbnQsXG4gICAgJ3BvbHlnb24nOiBQb2x5Z29uRWxlbWVudCxcbiAgICAncGF0aCc6IFBhdGhFbGVtZW50LFxuICAgICdwYXR0ZXJuJzogUGF0dGVybkVsZW1lbnQsXG4gICAgJ21hcmtlcic6IE1hcmtlckVsZW1lbnQsXG4gICAgJ2RlZnMnOiBEZWZzRWxlbWVudCxcbiAgICAnbGluZWFyR3JhZGllbnQnOiBMaW5lYXJHcmFkaWVudEVsZW1lbnQsXG4gICAgJ3JhZGlhbEdyYWRpZW50JzogUmFkaWFsR3JhZGllbnRFbGVtZW50LFxuICAgICdzdG9wJzogU3RvcEVsZW1lbnQsXG4gICAgJ2FuaW1hdGUnOiBBbmltYXRlRWxlbWVudCxcbiAgICAnYW5pbWF0ZUNvbG9yJzogQW5pbWF0ZUNvbG9yRWxlbWVudCxcbiAgICAnYW5pbWF0ZVRyYW5zZm9ybSc6IEFuaW1hdGVUcmFuc2Zvcm1FbGVtZW50LFxuICAgICdmb250JzogRm9udEVsZW1lbnQsXG4gICAgJ2ZvbnQtZmFjZSc6IEZvbnRGYWNlRWxlbWVudCxcbiAgICAnbWlzc2luZy1nbHlwaCc6IE1pc3NpbmdHbHlwaEVsZW1lbnQsXG4gICAgJ2dseXBoJzogR2x5cGhFbGVtZW50LFxuICAgICd0ZXh0JzogVGV4dEVsZW1lbnQsXG4gICAgJ3RzcGFuJzogVFNwYW5FbGVtZW50LFxuICAgICd0cmVmJzogVFJlZkVsZW1lbnQsXG4gICAgJ2EnOiBBRWxlbWVudCxcbiAgICAndGV4dFBhdGgnOiBUZXh0UGF0aEVsZW1lbnQsXG4gICAgJ2ltYWdlJzogSW1hZ2VFbGVtZW50LFxuICAgICdnJzogR0VsZW1lbnQsXG4gICAgJ3N5bWJvbCc6IFN5bWJvbEVsZW1lbnQsXG4gICAgJ3N0eWxlJzogU3R5bGVFbGVtZW50LFxuICAgICd1c2UnOiBVc2VFbGVtZW50LFxuICAgICdtYXNrJzogTWFza0VsZW1lbnQsXG4gICAgJ2NsaXBQYXRoJzogQ2xpcFBhdGhFbGVtZW50LFxuICAgICdmaWx0ZXInOiBGaWx0ZXJFbGVtZW50LFxuICAgICdmZURyb3BTaGFkb3cnOiBGZURyb3BTaGFkb3dFbGVtZW50LFxuICAgICdmZU1vcnBob2xvZ3knOiBGZU1vcnBob2xvZ3lFbGVtZW50LFxuICAgICdmZUNvbXBvc2l0ZSc6IEZlQ29tcG9zaXRlRWxlbWVudCxcbiAgICAnZmVDb2xvck1hdHJpeCc6IEZlQ29sb3JNYXRyaXhFbGVtZW50LFxuICAgICdmZUdhdXNzaWFuQmx1cic6IEZlR2F1c3NpYW5CbHVyRWxlbWVudCxcbiAgICAndGl0bGUnOiBUaXRsZUVsZW1lbnQsXG4gICAgJ2Rlc2MnOiBEZXNjRWxlbWVudFxufTtcblxuZnVuY3Rpb24gY3JlYXRlQ2FudmFzKHdpZHRoLCBoZWlnaHQpIHtcbiAgICBjb25zdCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICBjYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHJldHVybiBjYW52YXM7XG59XG5hc3luYyBmdW5jdGlvbiBjcmVhdGVJbWFnZShzcmMpIHtcbiAgICBsZXQgYW5vbnltb3VzQ3Jvc3NPcmlnaW4gPSBhcmd1bWVudHMubGVuZ3RoID4gMSAmJiBhcmd1bWVudHNbMV0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1sxXSA6IGZhbHNlO1xuICAgIGNvbnN0IGltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgaWYgKGFub255bW91c0Nyb3NzT3JpZ2luKSB7XG4gICAgICAgIGltYWdlLmNyb3NzT3JpZ2luID0gJ0Fub255bW91cyc7XG4gICAgfVxuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KT0+e1xuICAgICAgICBpbWFnZS5vbmxvYWQgPSAoKT0+e1xuICAgICAgICAgICAgcmVzb2x2ZShpbWFnZSk7XG4gICAgICAgIH07XG4gICAgICAgIGltYWdlLm9uZXJyb3IgPSAoX2V2ZW50LCBfc291cmNlLCBfbGluZW5vLCBfY29sbm8sIGVycm9yKT0+e1xuICAgICAgICAgICAgcmVqZWN0KGVycm9yKTtcbiAgICAgICAgfTtcbiAgICAgICAgaW1hZ2Uuc3JjID0gc3JjO1xuICAgIH0pO1xufVxuY29uc3QgREVGQVVMVF9FTV9TSVpFID0gMTI7XG5jbGFzcyBEb2N1bWVudCB7XG4gICAgYmluZENyZWF0ZUltYWdlKGNyZWF0ZUltYWdlMSwgYW5vbnltb3VzQ3Jvc3NPcmlnaW4pIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhbm9ueW1vdXNDcm9zc09yaWdpbiA9PT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgICAgICByZXR1cm4gKHNvdXJjZSwgZm9yY2VBbm9ueW1vdXNDcm9zc09yaWdpbik9PmNyZWF0ZUltYWdlMShzb3VyY2UsIHR5cGVvZiBmb3JjZUFub255bW91c0Nyb3NzT3JpZ2luID09PSAnYm9vbGVhbicgPyBmb3JjZUFub255bW91c0Nyb3NzT3JpZ2luIDogYW5vbnltb3VzQ3Jvc3NPcmlnaW4pXG4gICAgICAgICAgICA7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGNyZWF0ZUltYWdlMTtcbiAgICB9XG4gICAgZ2V0IHdpbmRvdygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NyZWVuLndpbmRvdztcbiAgICB9XG4gICAgZ2V0IGZldGNoKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zY3JlZW4uZmV0Y2g7XG4gICAgfVxuICAgIGdldCBjdHgoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNjcmVlbi5jdHg7XG4gICAgfVxuICAgIGdldCBlbVNpemUoKSB7XG4gICAgICAgIGNvbnN0IHsgZW1TaXplU3RhY2sgIH0gPSB0aGlzO1xuICAgICAgICByZXR1cm4gZW1TaXplU3RhY2tbZW1TaXplU3RhY2subGVuZ3RoIC0gMV0gfHwgREVGQVVMVF9FTV9TSVpFO1xuICAgIH1cbiAgICBzZXQgZW1TaXplKHZhbHVlKSB7XG4gICAgICAgIGNvbnN0IHsgZW1TaXplU3RhY2sgIH0gPSB0aGlzO1xuICAgICAgICBlbVNpemVTdGFjay5wdXNoKHZhbHVlKTtcbiAgICB9XG4gICAgcG9wRW1TaXplKCkge1xuICAgICAgICBjb25zdCB7IGVtU2l6ZVN0YWNrICB9ID0gdGhpcztcbiAgICAgICAgZW1TaXplU3RhY2sucG9wKCk7XG4gICAgfVxuICAgIGdldFVuaXF1ZUlkKCkge1xuICAgICAgICByZXR1cm4gXCJjYW52Z1wiLmNvbmNhdCgrK3RoaXMudW5pcXVlSWQpO1xuICAgIH1cbiAgICBpc0ltYWdlc0xvYWRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW1hZ2VzLmV2ZXJ5KChfKT0+Xy5sb2FkZWRcbiAgICAgICAgKTtcbiAgICB9XG4gICAgaXNGb250c0xvYWRlZCgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZm9udHMuZXZlcnkoKF8pPT5fLmxvYWRlZFxuICAgICAgICApO1xuICAgIH1cbiAgICBjcmVhdGVEb2N1bWVudEVsZW1lbnQoZG9jdW1lbnQpIHtcbiAgICAgICAgY29uc3QgZG9jdW1lbnRFbGVtZW50ID0gdGhpcy5jcmVhdGVFbGVtZW50KGRvY3VtZW50LmRvY3VtZW50RWxlbWVudCk7XG4gICAgICAgIGRvY3VtZW50RWxlbWVudC5yb290ID0gdHJ1ZTtcbiAgICAgICAgZG9jdW1lbnRFbGVtZW50LmFkZFN0eWxlc0Zyb21TdHlsZURlZmluaXRpb24oKTtcbiAgICAgICAgdGhpcy5kb2N1bWVudEVsZW1lbnQgPSBkb2N1bWVudEVsZW1lbnQ7XG4gICAgICAgIHJldHVybiBkb2N1bWVudEVsZW1lbnQ7XG4gICAgfVxuICAgIGNyZWF0ZUVsZW1lbnQobm9kZSkge1xuICAgICAgICBjb25zdCBlbGVtZW50VHlwZSA9IG5vZGUubm9kZU5hbWUucmVwbGFjZSgvXlteOl0rOi8sICcnKTtcbiAgICAgICAgY29uc3QgRWxlbWVudFR5cGUgPSBEb2N1bWVudC5lbGVtZW50VHlwZXNbZWxlbWVudFR5cGVdO1xuICAgICAgICBpZiAoRWxlbWVudFR5cGUpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRWxlbWVudFR5cGUodGhpcywgbm9kZSk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBVbmtub3duRWxlbWVudCh0aGlzLCBub2RlKTtcbiAgICB9XG4gICAgY3JlYXRlVGV4dE5vZGUobm9kZSkge1xuICAgICAgICByZXR1cm4gbmV3IFRleHROb2RlKHRoaXMsIG5vZGUpO1xuICAgIH1cbiAgICBzZXRWaWV3Qm94KGNvbmZpZykge1xuICAgICAgICB0aGlzLnNjcmVlbi5zZXRWaWV3Qm94KHtcbiAgICAgICAgICAgIGRvY3VtZW50OiB0aGlzLFxuICAgICAgICAgICAgLi4uY29uZmlnXG4gICAgICAgIH0pO1xuICAgIH1cbiAgICBjb25zdHJ1Y3RvcihjYW52ZywgeyByb290RW1TaXplID1ERUZBVUxUX0VNX1NJWkUgLCBlbVNpemUgPURFRkFVTFRfRU1fU0laRSAsIGNyZWF0ZUNhbnZhczogY3JlYXRlQ2FudmFzMSA9IERvY3VtZW50LmNyZWF0ZUNhbnZhcyAsIGNyZWF0ZUltYWdlOiBjcmVhdGVJbWFnZTIgPSBEb2N1bWVudC5jcmVhdGVJbWFnZSAsIGFub255bW91c0Nyb3NzT3JpZ2luICB9ID0ge30pe1xuICAgICAgICB0aGlzLmNhbnZnID0gY2Fudmc7XG4gICAgICAgIHRoaXMuZGVmaW5pdGlvbnMgPSB7fTtcbiAgICAgICAgdGhpcy5zdHlsZXMgPSB7fTtcbiAgICAgICAgdGhpcy5zdHlsZXNTcGVjaWZpY2l0eSA9IHt9O1xuICAgICAgICB0aGlzLmltYWdlcyA9IFtdO1xuICAgICAgICB0aGlzLmZvbnRzID0gW107XG4gICAgICAgIHRoaXMuZW1TaXplU3RhY2sgPSBbXTtcbiAgICAgICAgdGhpcy51bmlxdWVJZCA9IDA7XG4gICAgICAgIHRoaXMuc2NyZWVuID0gY2Fudmcuc2NyZWVuO1xuICAgICAgICB0aGlzLnJvb3RFbVNpemUgPSByb290RW1TaXplO1xuICAgICAgICB0aGlzLmVtU2l6ZSA9IGVtU2l6ZTtcbiAgICAgICAgdGhpcy5jcmVhdGVDYW52YXMgPSBjcmVhdGVDYW52YXMxO1xuICAgICAgICB0aGlzLmNyZWF0ZUltYWdlID0gdGhpcy5iaW5kQ3JlYXRlSW1hZ2UoY3JlYXRlSW1hZ2UyLCBhbm9ueW1vdXNDcm9zc09yaWdpbik7XG4gICAgICAgIHRoaXMuc2NyZWVuLndhaXQoKCk9PnRoaXMuaXNJbWFnZXNMb2FkZWQoKVxuICAgICAgICApO1xuICAgICAgICB0aGlzLnNjcmVlbi53YWl0KCgpPT50aGlzLmlzRm9udHNMb2FkZWQoKVxuICAgICAgICApO1xuICAgIH1cbn1cbkRvY3VtZW50LmNyZWF0ZUNhbnZhcyA9IGNyZWF0ZUNhbnZhcztcbkRvY3VtZW50LmNyZWF0ZUltYWdlID0gY3JlYXRlSW1hZ2U7XG5Eb2N1bWVudC5lbGVtZW50VHlwZXMgPSBlbGVtZW50cztcblxuLyoqXG4gKiBTVkcgcmVuZGVyZXIgb24gY2FudmFzLlxuICovIGNsYXNzIENhbnZnIHtcbiAgICAvKipcbiAgICogQ3JlYXRlIENhbnZnIGluc3RhbmNlIGZyb20gU1ZHIHNvdXJjZSBzdHJpbmcgb3IgVVJMLlxuICAgKiBAcGFyYW0gY3R4IC0gUmVuZGVyaW5nIGNvbnRleHQuXG4gICAqIEBwYXJhbSBzdmcgLSBTVkcgc291cmNlIHN0cmluZyBvciBVUkwuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gUmVuZGVyaW5nIG9wdGlvbnMuXG4gICAqIEByZXR1cm5zIENhbnZnIGluc3RhbmNlLlxuICAgKi8gc3RhdGljIGFzeW5jIGZyb20oY3R4LCBzdmcpIHtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgICAgICBjb25zdCBwYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xuICAgICAgICBjb25zdCBzdmdEb2N1bWVudCA9IGF3YWl0IHBhcnNlci5wYXJzZShzdmcpO1xuICAgICAgICByZXR1cm4gbmV3IENhbnZnKGN0eCwgc3ZnRG9jdW1lbnQsIG9wdGlvbnMpO1xuICAgIH1cbiAgICAvKipcbiAgICogQ3JlYXRlIENhbnZnIGluc3RhbmNlIGZyb20gU1ZHIHNvdXJjZSBzdHJpbmcuXG4gICAqIEBwYXJhbSBjdHggLSBSZW5kZXJpbmcgY29udGV4dC5cbiAgICogQHBhcmFtIHN2ZyAtIFNWRyBzb3VyY2Ugc3RyaW5nLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIFJlbmRlcmluZyBvcHRpb25zLlxuICAgKiBAcmV0dXJucyBDYW52ZyBpbnN0YW5jZS5cbiAgICovIHN0YXRpYyBmcm9tU3RyaW5nKGN0eCwgc3ZnKSB7XG4gICAgICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMl0gOiB7fTtcbiAgICAgICAgY29uc3QgcGFyc2VyID0gbmV3IFBhcnNlcihvcHRpb25zKTtcbiAgICAgICAgY29uc3Qgc3ZnRG9jdW1lbnQgPSBwYXJzZXIucGFyc2VGcm9tU3RyaW5nKHN2Zyk7XG4gICAgICAgIHJldHVybiBuZXcgQ2FudmcoY3R4LCBzdmdEb2N1bWVudCwgb3B0aW9ucyk7XG4gICAgfVxuICAgIC8qKlxuICAgKiBDcmVhdGUgbmV3IENhbnZnIGluc3RhbmNlIHdpdGggaW5oZXJpdGVkIG9wdGlvbnMuXG4gICAqIEBwYXJhbSBjdHggLSBSZW5kZXJpbmcgY29udGV4dC5cbiAgICogQHBhcmFtIHN2ZyAtIFNWRyBzb3VyY2Ugc3RyaW5nIG9yIFVSTC5cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBSZW5kZXJpbmcgb3B0aW9ucy5cbiAgICogQHJldHVybnMgQ2FudmcgaW5zdGFuY2UuXG4gICAqLyBmb3JrKGN0eCwgc3ZnKSB7XG4gICAgICAgIGxldCBvcHRpb25zID0gYXJndW1lbnRzLmxlbmd0aCA+IDIgJiYgYXJndW1lbnRzWzJdICE9PSB2b2lkIDAgPyBhcmd1bWVudHNbMl0gOiB7fTtcbiAgICAgICAgcmV0dXJuIENhbnZnLmZyb20oY3R4LCBzdmcsIHtcbiAgICAgICAgICAgIC4uLnRoaXMub3B0aW9ucyxcbiAgICAgICAgICAgIC4uLm9wdGlvbnNcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgKiBDcmVhdGUgbmV3IENhbnZnIGluc3RhbmNlIHdpdGggaW5oZXJpdGVkIG9wdGlvbnMuXG4gICAqIEBwYXJhbSBjdHggLSBSZW5kZXJpbmcgY29udGV4dC5cbiAgICogQHBhcmFtIHN2ZyAtIFNWRyBzb3VyY2Ugc3RyaW5nLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIFJlbmRlcmluZyBvcHRpb25zLlxuICAgKiBAcmV0dXJucyBDYW52ZyBpbnN0YW5jZS5cbiAgICovIGZvcmtTdHJpbmcoY3R4LCBzdmcpIHtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IHt9O1xuICAgICAgICByZXR1cm4gQ2FudmcuZnJvbVN0cmluZyhjdHgsIHN2Zywge1xuICAgICAgICAgICAgLi4udGhpcy5vcHRpb25zLFxuICAgICAgICAgICAgLi4ub3B0aW9uc1xuICAgICAgICB9KTtcbiAgICB9XG4gICAgLyoqXG4gICAqIERvY3VtZW50IGlzIHJlYWR5IHByb21pc2UuXG4gICAqIEByZXR1cm5zIFJlYWR5IHByb21pc2UuXG4gICAqLyByZWFkeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NyZWVuLnJlYWR5KCk7XG4gICAgfVxuICAgIC8qKlxuICAgKiBEb2N1bWVudCBpcyByZWFkeSB2YWx1ZS5cbiAgICogQHJldHVybnMgSXMgcmVhZHkgb3Igbm90LlxuICAgKi8gaXNSZWFkeSgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuc2NyZWVuLmlzUmVhZHkoKTtcbiAgICB9XG4gICAgLyoqXG4gICAqIFJlbmRlciBvbmx5IGZpcnN0IGZyYW1lLCBpZ25vcmluZyBhbmltYXRpb25zIGFuZCBtb3VzZS5cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBSZW5kZXJpbmcgb3B0aW9ucy5cbiAgICovIGFzeW5jIHJlbmRlcigpIHtcbiAgICAgICAgbGV0IG9wdGlvbnMgPSBhcmd1bWVudHMubGVuZ3RoID4gMCAmJiBhcmd1bWVudHNbMF0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1swXSA6IHt9O1xuICAgICAgICB0aGlzLnN0YXJ0KHtcbiAgICAgICAgICAgIGVuYWJsZVJlZHJhdzogdHJ1ZSxcbiAgICAgICAgICAgIGlnbm9yZUFuaW1hdGlvbjogdHJ1ZSxcbiAgICAgICAgICAgIGlnbm9yZU1vdXNlOiB0cnVlLFxuICAgICAgICAgICAgLi4ub3B0aW9uc1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgdGhpcy5yZWFkeSgpO1xuICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICB9XG4gICAgLyoqXG4gICAqIFN0YXJ0IHJlbmRlcmluZy5cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBSZW5kZXIgb3B0aW9ucy5cbiAgICovIHN0YXJ0KCkge1xuICAgICAgICBsZXQgb3B0aW9ucyA9IGFyZ3VtZW50cy5sZW5ndGggPiAwICYmIGFyZ3VtZW50c1swXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzBdIDoge307XG4gICAgICAgIGNvbnN0IHsgZG9jdW1lbnRFbGVtZW50ICwgc2NyZWVuICwgb3B0aW9uczogYmFzZU9wdGlvbnMgIH0gPSB0aGlzO1xuICAgICAgICBzY3JlZW4uc3RhcnQoZG9jdW1lbnRFbGVtZW50LCB7XG4gICAgICAgICAgICBlbmFibGVSZWRyYXc6IHRydWUsXG4gICAgICAgICAgICAuLi5iYXNlT3B0aW9ucyxcbiAgICAgICAgICAgIC4uLm9wdGlvbnNcbiAgICAgICAgfSk7XG4gICAgfVxuICAgIC8qKlxuICAgKiBTdG9wIHJlbmRlcmluZy5cbiAgICovIHN0b3AoKSB7XG4gICAgICAgIHRoaXMuc2NyZWVuLnN0b3AoKTtcbiAgICB9XG4gICAgLyoqXG4gICAqIFJlc2l6ZSBTVkcgdG8gZml0IGluIGdpdmVuIHNpemUuXG4gICAqIEBwYXJhbSB3aWR0aFxuICAgKiBAcGFyYW0gaGVpZ2h0XG4gICAqIEBwYXJhbSBwcmVzZXJ2ZUFzcGVjdFJhdGlvXG4gICAqLyByZXNpemUod2lkdGgpIHtcbiAgICAgICAgbGV0IGhlaWdodCA9IGFyZ3VtZW50cy5sZW5ndGggPiAxICYmIGFyZ3VtZW50c1sxXSAhPT0gdm9pZCAwID8gYXJndW1lbnRzWzFdIDogd2lkdGgsIHByZXNlcnZlQXNwZWN0UmF0aW8gPSBhcmd1bWVudHMubGVuZ3RoID4gMiAmJiBhcmd1bWVudHNbMl0gIT09IHZvaWQgMCA/IGFyZ3VtZW50c1syXSA6IGZhbHNlO1xuICAgICAgICB0aGlzLmRvY3VtZW50RWxlbWVudC5yZXNpemUod2lkdGgsIGhlaWdodCwgcHJlc2VydmVBc3BlY3RSYXRpbyk7XG4gICAgfVxuICAgIC8qKlxuICAgKiBNYWluIGNvbnN0cnVjdG9yLlxuICAgKiBAcGFyYW0gY3R4IC0gUmVuZGVyaW5nIGNvbnRleHQuXG4gICAqIEBwYXJhbSBzdmcgLSBTVkcgRG9jdW1lbnQuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gUmVuZGVyaW5nIG9wdGlvbnMuXG4gICAqLyBjb25zdHJ1Y3RvcihjdHgsIHN2Zywgb3B0aW9ucyA9IHt9KXtcbiAgICAgICAgdGhpcy5wYXJzZXIgPSBuZXcgUGFyc2VyKG9wdGlvbnMpO1xuICAgICAgICB0aGlzLnNjcmVlbiA9IG5ldyBTY3JlZW4oY3R4LCBvcHRpb25zKTtcbiAgICAgICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgY29uc3QgZG9jdW1lbnQgPSBuZXcgRG9jdW1lbnQodGhpcywgb3B0aW9ucyk7XG4gICAgICAgIGNvbnN0IGRvY3VtZW50RWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZURvY3VtZW50RWxlbWVudChzdmcpO1xuICAgICAgICB0aGlzLmRvY3VtZW50ID0gZG9jdW1lbnQ7XG4gICAgICAgIHRoaXMuZG9jdW1lbnRFbGVtZW50ID0gZG9jdW1lbnRFbGVtZW50O1xuICAgIH1cbn1cblxuZXhwb3J0cy5BRWxlbWVudCA9IEFFbGVtZW50O1xuZXhwb3J0cy5BbmltYXRlQ29sb3JFbGVtZW50ID0gQW5pbWF0ZUNvbG9yRWxlbWVudDtcbmV4cG9ydHMuQW5pbWF0ZUVsZW1lbnQgPSBBbmltYXRlRWxlbWVudDtcbmV4cG9ydHMuQW5pbWF0ZVRyYW5zZm9ybUVsZW1lbnQgPSBBbmltYXRlVHJhbnNmb3JtRWxlbWVudDtcbmV4cG9ydHMuQm91bmRpbmdCb3ggPSBCb3VuZGluZ0JveDtcbmV4cG9ydHMuQ0IxID0gQ0IxO1xuZXhwb3J0cy5DQjIgPSBDQjI7XG5leHBvcnRzLkNCMyA9IENCMztcbmV4cG9ydHMuQ0I0ID0gQ0I0O1xuZXhwb3J0cy5DYW52ZyA9IENhbnZnO1xuZXhwb3J0cy5DaXJjbGVFbGVtZW50ID0gQ2lyY2xlRWxlbWVudDtcbmV4cG9ydHMuQ2xpcFBhdGhFbGVtZW50ID0gQ2xpcFBhdGhFbGVtZW50O1xuZXhwb3J0cy5EZWZzRWxlbWVudCA9IERlZnNFbGVtZW50O1xuZXhwb3J0cy5EZXNjRWxlbWVudCA9IERlc2NFbGVtZW50O1xuZXhwb3J0cy5Eb2N1bWVudCA9IERvY3VtZW50O1xuZXhwb3J0cy5FbGVtZW50ID0gRWxlbWVudDtcbmV4cG9ydHMuRWxsaXBzZUVsZW1lbnQgPSBFbGxpcHNlRWxlbWVudDtcbmV4cG9ydHMuRmVDb2xvck1hdHJpeEVsZW1lbnQgPSBGZUNvbG9yTWF0cml4RWxlbWVudDtcbmV4cG9ydHMuRmVDb21wb3NpdGVFbGVtZW50ID0gRmVDb21wb3NpdGVFbGVtZW50O1xuZXhwb3J0cy5GZURyb3BTaGFkb3dFbGVtZW50ID0gRmVEcm9wU2hhZG93RWxlbWVudDtcbmV4cG9ydHMuRmVHYXVzc2lhbkJsdXJFbGVtZW50ID0gRmVHYXVzc2lhbkJsdXJFbGVtZW50O1xuZXhwb3J0cy5GZU1vcnBob2xvZ3lFbGVtZW50ID0gRmVNb3JwaG9sb2d5RWxlbWVudDtcbmV4cG9ydHMuRmlsdGVyRWxlbWVudCA9IEZpbHRlckVsZW1lbnQ7XG5leHBvcnRzLkZvbnQgPSBGb250O1xuZXhwb3J0cy5Gb250RWxlbWVudCA9IEZvbnRFbGVtZW50O1xuZXhwb3J0cy5Gb250RmFjZUVsZW1lbnQgPSBGb250RmFjZUVsZW1lbnQ7XG5leHBvcnRzLkdFbGVtZW50ID0gR0VsZW1lbnQ7XG5leHBvcnRzLkdseXBoRWxlbWVudCA9IEdseXBoRWxlbWVudDtcbmV4cG9ydHMuR3JhZGllbnRFbGVtZW50ID0gR3JhZGllbnRFbGVtZW50O1xuZXhwb3J0cy5JbWFnZUVsZW1lbnQgPSBJbWFnZUVsZW1lbnQ7XG5leHBvcnRzLkxpbmVFbGVtZW50ID0gTGluZUVsZW1lbnQ7XG5leHBvcnRzLkxpbmVhckdyYWRpZW50RWxlbWVudCA9IExpbmVhckdyYWRpZW50RWxlbWVudDtcbmV4cG9ydHMuTWFya2VyRWxlbWVudCA9IE1hcmtlckVsZW1lbnQ7XG5leHBvcnRzLk1hc2tFbGVtZW50ID0gTWFza0VsZW1lbnQ7XG5leHBvcnRzLk1hdHJpeCA9IE1hdHJpeDtcbmV4cG9ydHMuTWlzc2luZ0dseXBoRWxlbWVudCA9IE1pc3NpbmdHbHlwaEVsZW1lbnQ7XG5leHBvcnRzLk1vdXNlID0gTW91c2U7XG5leHBvcnRzLlBTRVVET19aRVJPID0gUFNFVURPX1pFUk87XG5leHBvcnRzLlBhcnNlciA9IFBhcnNlcjtcbmV4cG9ydHMuUGF0aEVsZW1lbnQgPSBQYXRoRWxlbWVudDtcbmV4cG9ydHMuUGF0aFBhcnNlciA9IFBhdGhQYXJzZXI7XG5leHBvcnRzLlBhdHRlcm5FbGVtZW50ID0gUGF0dGVybkVsZW1lbnQ7XG5leHBvcnRzLlBvaW50ID0gUG9pbnQ7XG5leHBvcnRzLlBvbHlnb25FbGVtZW50ID0gUG9seWdvbkVsZW1lbnQ7XG5leHBvcnRzLlBvbHlsaW5lRWxlbWVudCA9IFBvbHlsaW5lRWxlbWVudDtcbmV4cG9ydHMuUHJvcGVydHkgPSBQcm9wZXJ0eTtcbmV4cG9ydHMuUUIxID0gUUIxO1xuZXhwb3J0cy5RQjIgPSBRQjI7XG5leHBvcnRzLlFCMyA9IFFCMztcbmV4cG9ydHMuUmFkaWFsR3JhZGllbnRFbGVtZW50ID0gUmFkaWFsR3JhZGllbnRFbGVtZW50O1xuZXhwb3J0cy5SZWN0RWxlbWVudCA9IFJlY3RFbGVtZW50O1xuZXhwb3J0cy5SZW5kZXJlZEVsZW1lbnQgPSBSZW5kZXJlZEVsZW1lbnQ7XG5leHBvcnRzLlJvdGF0ZSA9IFJvdGF0ZTtcbmV4cG9ydHMuU1ZHRWxlbWVudCA9IFNWR0VsZW1lbnQ7XG5leHBvcnRzLlNWR0ZvbnRMb2FkZXIgPSBTVkdGb250TG9hZGVyO1xuZXhwb3J0cy5TY2FsZSA9IFNjYWxlO1xuZXhwb3J0cy5TY3JlZW4gPSBTY3JlZW47XG5leHBvcnRzLlNrZXcgPSBTa2V3O1xuZXhwb3J0cy5Ta2V3WCA9IFNrZXdYO1xuZXhwb3J0cy5Ta2V3WSA9IFNrZXdZO1xuZXhwb3J0cy5TdG9wRWxlbWVudCA9IFN0b3BFbGVtZW50O1xuZXhwb3J0cy5TdHlsZUVsZW1lbnQgPSBTdHlsZUVsZW1lbnQ7XG5leHBvcnRzLlN5bWJvbEVsZW1lbnQgPSBTeW1ib2xFbGVtZW50O1xuZXhwb3J0cy5UUmVmRWxlbWVudCA9IFRSZWZFbGVtZW50O1xuZXhwb3J0cy5UU3BhbkVsZW1lbnQgPSBUU3BhbkVsZW1lbnQ7XG5leHBvcnRzLlRleHRFbGVtZW50ID0gVGV4dEVsZW1lbnQ7XG5leHBvcnRzLlRleHRQYXRoRWxlbWVudCA9IFRleHRQYXRoRWxlbWVudDtcbmV4cG9ydHMuVGl0bGVFbGVtZW50ID0gVGl0bGVFbGVtZW50O1xuZXhwb3J0cy5UcmFuc2Zvcm0gPSBUcmFuc2Zvcm07XG5leHBvcnRzLlRyYW5zbGF0ZSA9IFRyYW5zbGF0ZTtcbmV4cG9ydHMuVW5rbm93bkVsZW1lbnQgPSBVbmtub3duRWxlbWVudDtcbmV4cG9ydHMuVXNlRWxlbWVudCA9IFVzZUVsZW1lbnQ7XG5leHBvcnRzLlZpZXdQb3J0ID0gVmlld1BvcnQ7XG5leHBvcnRzLmNvbXByZXNzU3BhY2VzID0gY29tcHJlc3NTcGFjZXM7XG5leHBvcnRzLmVsZW1lbnRzID0gZWxlbWVudHM7XG5leHBvcnRzLmdldFNlbGVjdG9yU3BlY2lmaWNpdHkgPSBnZXRTZWxlY3RvclNwZWNpZmljaXR5O1xuZXhwb3J0cy5ub3JtYWxpemVBdHRyaWJ1dGVOYW1lID0gbm9ybWFsaXplQXR0cmlidXRlTmFtZTtcbmV4cG9ydHMubm9ybWFsaXplQ29sb3IgPSBub3JtYWxpemVDb2xvcjtcbmV4cG9ydHMucGFyc2VFeHRlcm5hbFVybCA9IHBhcnNlRXh0ZXJuYWxVcmw7XG5leHBvcnRzLnByZXNldHMgPSBpbmRleDtcbmV4cG9ydHMudG9NYXRyaXhWYWx1ZSA9IHRvTWF0cml4VmFsdWU7XG5leHBvcnRzLnRvTnVtYmVycyA9IHRvTnVtYmVycztcbmV4cG9ydHMudHJpbUxlZnQgPSB0cmltTGVmdDtcbmV4cG9ydHMudHJpbVJpZ2h0ID0gdHJpbVJpZ2h0O1xuZXhwb3J0cy52ZWN0b3JNYWduaXR1ZGUgPSB2ZWN0b3JNYWduaXR1ZGU7XG5leHBvcnRzLnZlY3RvcnNBbmdsZSA9IHZlY3RvcnNBbmdsZTtcbmV4cG9ydHMudmVjdG9yc1JhdGlvID0gdmVjdG9yc1JhdGlvO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguY2pzLm1hcFxuIiwiIWZ1bmN0aW9uKHQscil7XCJvYmplY3RcIj09dHlwZW9mIGV4cG9ydHMmJlwidW5kZWZpbmVkXCIhPXR5cGVvZiBtb2R1bGU/cihleHBvcnRzKTpcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImV4cG9ydHNcIl0scik6cigodD1cInVuZGVmaW5lZFwiIT10eXBlb2YgZ2xvYmFsVGhpcz9nbG9iYWxUaGlzOnR8fHNlbGYpLnN2Z3BhdGhkYXRhPXt9KX0odGhpcywoZnVuY3Rpb24odCl7XCJ1c2Ugc3RyaWN0XCI7XG4vKiEgKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAgICBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cblxuICAgIFBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxuICAgIHB1cnBvc2Ugd2l0aCBvciB3aXRob3V0IGZlZSBpcyBoZXJlYnkgZ3JhbnRlZC5cblxuICAgIFRIRSBTT0ZUV0FSRSBJUyBQUk9WSURFRCBcIkFTIElTXCIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEhcbiAgICBSRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFlcbiAgICBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXG4gICAgSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NXG4gICAgTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1JcbiAgICBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXG4gICAgUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS5cbiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqL3ZhciByPWZ1bmN0aW9uKHQsZSl7cmV0dXJuKHI9T2JqZWN0LnNldFByb3RvdHlwZU9mfHx7X19wcm90b19fOltdfWluc3RhbmNlb2YgQXJyYXkmJmZ1bmN0aW9uKHQscil7dC5fX3Byb3RvX189cn18fGZ1bmN0aW9uKHQscil7Zm9yKHZhciBlIGluIHIpT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHIsZSkmJih0W2VdPXJbZV0pfSkodCxlKX07ZnVuY3Rpb24gZSh0LGUpe2lmKFwiZnVuY3Rpb25cIiE9dHlwZW9mIGUmJm51bGwhPT1lKXRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiK1N0cmluZyhlKStcIiBpcyBub3QgYSBjb25zdHJ1Y3RvciBvciBudWxsXCIpO2Z1bmN0aW9uIGEoKXt0aGlzLmNvbnN0cnVjdG9yPXR9cih0LGUpLHQucHJvdG90eXBlPW51bGw9PT1lP09iamVjdC5jcmVhdGUoZSk6KGEucHJvdG90eXBlPWUucHJvdG90eXBlLG5ldyBhKX12YXIgYT1cIiBcIjtmdW5jdGlvbiBpKHQpe3ZhciByPVwiXCI7QXJyYXkuaXNBcnJheSh0KXx8KHQ9W3RdKTtmb3IodmFyIGU9MDtlPHQubGVuZ3RoO2UrKyl7dmFyIGk9dFtlXTtpZihpLnR5cGU9PT1OLkNMT1NFX1BBVEgpcis9XCJ6XCI7ZWxzZSBpZihpLnR5cGU9PT1OLkhPUklaX0xJTkVfVE8pcis9KGkucmVsYXRpdmU/XCJoXCI6XCJIXCIpK2kueDtlbHNlIGlmKGkudHlwZT09PU4uVkVSVF9MSU5FX1RPKXIrPShpLnJlbGF0aXZlP1widlwiOlwiVlwiKStpLnk7ZWxzZSBpZihpLnR5cGU9PT1OLk1PVkVfVE8pcis9KGkucmVsYXRpdmU/XCJtXCI6XCJNXCIpK2kueCthK2kueTtlbHNlIGlmKGkudHlwZT09PU4uTElORV9UTylyKz0oaS5yZWxhdGl2ZT9cImxcIjpcIkxcIikraS54K2EraS55O2Vsc2UgaWYoaS50eXBlPT09Ti5DVVJWRV9UTylyKz0oaS5yZWxhdGl2ZT9cImNcIjpcIkNcIikraS54MSthK2kueTErYStpLngyK2EraS55MithK2kueCthK2kueTtlbHNlIGlmKGkudHlwZT09PU4uU01PT1RIX0NVUlZFX1RPKXIrPShpLnJlbGF0aXZlP1wic1wiOlwiU1wiKStpLngyK2EraS55MithK2kueCthK2kueTtlbHNlIGlmKGkudHlwZT09PU4uUVVBRF9UTylyKz0oaS5yZWxhdGl2ZT9cInFcIjpcIlFcIikraS54MSthK2kueTErYStpLngrYStpLnk7ZWxzZSBpZihpLnR5cGU9PT1OLlNNT09USF9RVUFEX1RPKXIrPShpLnJlbGF0aXZlP1widFwiOlwiVFwiKStpLngrYStpLnk7ZWxzZXtpZihpLnR5cGUhPT1OLkFSQyl0aHJvdyBuZXcgRXJyb3IoJ1VuZXhwZWN0ZWQgY29tbWFuZCB0eXBlIFwiJytpLnR5cGUrJ1wiIGF0IGluZGV4ICcrZStcIi5cIik7cis9KGkucmVsYXRpdmU/XCJhXCI6XCJBXCIpK2kuclgrYStpLnJZK2EraS54Um90K2ErICtpLmxBcmNGbGFnK2ErICtpLnN3ZWVwRmxhZythK2kueCthK2kueX19cmV0dXJuIHJ9ZnVuY3Rpb24gbih0LHIpe3ZhciBlPXRbMF0sYT10WzFdO3JldHVybltlKk1hdGguY29zKHIpLWEqTWF0aC5zaW4ociksZSpNYXRoLnNpbihyKSthKk1hdGguY29zKHIpXX1mdW5jdGlvbiBvKCl7Zm9yKHZhciB0PVtdLHI9MDtyPGFyZ3VtZW50cy5sZW5ndGg7cisrKXRbcl09YXJndW1lbnRzW3JdO2Zvcih2YXIgZT0wO2U8dC5sZW5ndGg7ZSsrKWlmKFwibnVtYmVyXCIhPXR5cGVvZiB0W2VdKXRocm93IG5ldyBFcnJvcihcImFzc2VydE51bWJlcnMgYXJndW1lbnRzW1wiK2UrXCJdIGlzIG5vdCBhIG51bWJlci4gXCIrdHlwZW9mIHRbZV0rXCIgPT0gdHlwZW9mIFwiK3RbZV0pO3JldHVybiEwfXZhciBzPU1hdGguUEk7ZnVuY3Rpb24gdSh0LHIsZSl7dC5sQXJjRmxhZz0wPT09dC5sQXJjRmxhZz8wOjEsdC5zd2VlcEZsYWc9MD09PXQuc3dlZXBGbGFnPzA6MTt2YXIgYT10LnJYLGk9dC5yWSxvPXQueCx1PXQueTthPU1hdGguYWJzKHQuclgpLGk9TWF0aC5hYnModC5yWSk7dmFyIGg9bihbKHItbykvMiwoZS11KS8yXSwtdC54Um90LzE4MCpzKSxjPWhbMF0sbT1oWzFdLHk9TWF0aC5wb3coYywyKS9NYXRoLnBvdyhhLDIpK01hdGgucG93KG0sMikvTWF0aC5wb3coaSwyKTsxPHkmJihhKj1NYXRoLnNxcnQoeSksaSo9TWF0aC5zcXJ0KHkpKSx0LnJYPWEsdC5yWT1pO3ZhciBwPU1hdGgucG93KGEsMikqTWF0aC5wb3cobSwyKStNYXRoLnBvdyhpLDIpKk1hdGgucG93KGMsMiksZj0odC5sQXJjRmxhZyE9PXQuc3dlZXBGbGFnPzE6LTEpKk1hdGguc3FydChNYXRoLm1heCgwLChNYXRoLnBvdyhhLDIpKk1hdGgucG93KGksMiktcCkvcCkpLFQ9YSptL2kqZixPPS1pKmMvYSpmLGw9bihbVCxPXSx0LnhSb3QvMTgwKnMpO3QuY1g9bFswXSsocitvKS8yLHQuY1k9bFsxXSsoZSt1KS8yLHQucGhpMT1NYXRoLmF0YW4yKChtLU8pL2ksKGMtVCkvYSksdC5waGkyPU1hdGguYXRhbjIoKC1tLU8pL2ksKC1jLVQpL2EpLDA9PT10LnN3ZWVwRmxhZyYmdC5waGkyPnQucGhpMSYmKHQucGhpMi09MipzKSwxPT09dC5zd2VlcEZsYWcmJnQucGhpMjx0LnBoaTEmJih0LnBoaTIrPTIqcyksdC5waGkxKj0xODAvcyx0LnBoaTIqPTE4MC9zfWZ1bmN0aW9uIGgodCxyLGUpe28odCxyLGUpO3ZhciBhPXQqdCtyKnItZSplO2lmKDA+YSlyZXR1cm5bXTtpZigwPT09YSlyZXR1cm5bW3QqZS8odCp0K3IqciksciplLyh0KnQrcipyKV1dO3ZhciBpPU1hdGguc3FydChhKTtyZXR1cm5bWyh0KmUrcippKS8odCp0K3IqciksKHIqZS10KmkpLyh0KnQrcipyKV0sWyh0KmUtcippKS8odCp0K3IqciksKHIqZSt0KmkpLyh0KnQrcipyKV1dfXZhciBjPU1hdGguUEkvMTgwO2Z1bmN0aW9uIG0odCxyLGUpe3JldHVybigxLWUpKnQrZSpyfWZ1bmN0aW9uIHkodCxyLGUsYSl7cmV0dXJuIHQrTWF0aC5jb3MoYS8xODAqcykqcitNYXRoLnNpbihhLzE4MCpzKSplfWZ1bmN0aW9uIHAodCxyLGUsYSl7dmFyIGk9MWUtNixuPXItdCxvPWUtcixzPTMqbiszKihhLWUpLTYqbyx1PTYqKG8tbiksaD0zKm47cmV0dXJuIE1hdGguYWJzKHMpPGk/Wy1oL3VdOmZ1bmN0aW9uKHQscixlKXt2b2lkIDA9PT1lJiYoZT0xZS02KTt2YXIgYT10KnQvNC1yO2lmKGE8LWUpcmV0dXJuW107aWYoYTw9ZSlyZXR1cm5bLXQvMl07dmFyIGk9TWF0aC5zcXJ0KGEpO3JldHVyblstdC8yLWksLXQvMitpXX0odS9zLGgvcyxpKX1mdW5jdGlvbiBmKHQscixlLGEsaSl7dmFyIG49MS1pO3JldHVybiB0KihuKm4qbikrciooMypuKm4qaSkrZSooMypuKmkqaSkrYSooaSppKmkpfXQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lcj12b2lkIDAsZnVuY3Rpb24odCl7ZnVuY3Rpb24gcigpe3JldHVybiBpKChmdW5jdGlvbih0LHIsZSl7cmV0dXJuIHQucmVsYXRpdmUmJih2b2lkIDAhPT10LngxJiYodC54MSs9ciksdm9pZCAwIT09dC55MSYmKHQueTErPWUpLHZvaWQgMCE9PXQueDImJih0LngyKz1yKSx2b2lkIDAhPT10LnkyJiYodC55Mis9ZSksdm9pZCAwIT09dC54JiYodC54Kz1yKSx2b2lkIDAhPT10LnkmJih0LnkrPWUpLHQucmVsYXRpdmU9ITEpLHR9KSl9ZnVuY3Rpb24gZSgpe3ZhciB0PU5hTixyPU5hTixlPU5hTixhPU5hTjtyZXR1cm4gaSgoZnVuY3Rpb24oaSxuLG8pe3JldHVybiBpLnR5cGUmTi5TTU9PVEhfQ1VSVkVfVE8mJihpLnR5cGU9Ti5DVVJWRV9UTyx0PWlzTmFOKHQpP246dCxyPWlzTmFOKHIpP286cixpLngxPWkucmVsYXRpdmU/bi10OjIqbi10LGkueTE9aS5yZWxhdGl2ZT9vLXI6MipvLXIpLGkudHlwZSZOLkNVUlZFX1RPPyh0PWkucmVsYXRpdmU/bitpLngyOmkueDIscj1pLnJlbGF0aXZlP28raS55MjppLnkyKToodD1OYU4scj1OYU4pLGkudHlwZSZOLlNNT09USF9RVUFEX1RPJiYoaS50eXBlPU4uUVVBRF9UTyxlPWlzTmFOKGUpP246ZSxhPWlzTmFOKGEpP286YSxpLngxPWkucmVsYXRpdmU/bi1lOjIqbi1lLGkueTE9aS5yZWxhdGl2ZT9vLWE6MipvLWEpLGkudHlwZSZOLlFVQURfVE8/KGU9aS5yZWxhdGl2ZT9uK2kueDE6aS54MSxhPWkucmVsYXRpdmU/bytpLnkxOmkueTEpOihlPU5hTixhPU5hTiksaX0pKX1mdW5jdGlvbiBhKCl7dmFyIHQ9TmFOLHI9TmFOO3JldHVybiBpKChmdW5jdGlvbihlLGEsaSl7aWYoZS50eXBlJk4uU01PT1RIX1FVQURfVE8mJihlLnR5cGU9Ti5RVUFEX1RPLHQ9aXNOYU4odCk/YTp0LHI9aXNOYU4ocik/aTpyLGUueDE9ZS5yZWxhdGl2ZT9hLXQ6MiphLXQsZS55MT1lLnJlbGF0aXZlP2ktcjoyKmktciksZS50eXBlJk4uUVVBRF9UTyl7dD1lLnJlbGF0aXZlP2ErZS54MTplLngxLHI9ZS5yZWxhdGl2ZT9pK2UueTE6ZS55MTt2YXIgbj1lLngxLG89ZS55MTtlLnR5cGU9Ti5DVVJWRV9UTyxlLngxPSgoZS5yZWxhdGl2ZT8wOmEpKzIqbikvMyxlLnkxPSgoZS5yZWxhdGl2ZT8wOmkpKzIqbykvMyxlLngyPShlLngrMipuKS8zLGUueTI9KGUueSsyKm8pLzN9ZWxzZSB0PU5hTixyPU5hTjtyZXR1cm4gZX0pKX1mdW5jdGlvbiBpKHQpe3ZhciByPTAsZT0wLGE9TmFOLGk9TmFOO3JldHVybiBmdW5jdGlvbihuKXtpZihpc05hTihhKSYmIShuLnR5cGUmTi5NT1ZFX1RPKSl0aHJvdyBuZXcgRXJyb3IoXCJwYXRoIG11c3Qgc3RhcnQgd2l0aCBtb3ZldG9cIik7dmFyIG89dChuLHIsZSxhLGkpO3JldHVybiBuLnR5cGUmTi5DTE9TRV9QQVRIJiYocj1hLGU9aSksdm9pZCAwIT09bi54JiYocj1uLnJlbGF0aXZlP3Irbi54Om4ueCksdm9pZCAwIT09bi55JiYoZT1uLnJlbGF0aXZlP2Urbi55Om4ueSksbi50eXBlJk4uTU9WRV9UTyYmKGE9cixpPWUpLG99fWZ1bmN0aW9uIHModCxyLGUsYSxuLHMpe3JldHVybiBvKHQscixlLGEsbixzKSxpKChmdW5jdGlvbihpLG8sdSxoKXt2YXIgYz1pLngxLG09aS54Mix5PWkucmVsYXRpdmUmJiFpc05hTihoKSxwPXZvaWQgMCE9PWkueD9pLng6eT8wOm8sZj12b2lkIDAhPT1pLnk/aS55Onk/MDp1O2Z1bmN0aW9uIFQodCl7cmV0dXJuIHQqdH1pLnR5cGUmTi5IT1JJWl9MSU5FX1RPJiYwIT09ciYmKGkudHlwZT1OLkxJTkVfVE8saS55PWkucmVsYXRpdmU/MDp1KSxpLnR5cGUmTi5WRVJUX0xJTkVfVE8mJjAhPT1lJiYoaS50eXBlPU4uTElORV9UTyxpLng9aS5yZWxhdGl2ZT8wOm8pLHZvaWQgMCE9PWkueCYmKGkueD1pLngqdCtmKmUrKHk/MDpuKSksdm9pZCAwIT09aS55JiYoaS55PXAqcitpLnkqYSsoeT8wOnMpKSx2b2lkIDAhPT1pLngxJiYoaS54MT1pLngxKnQraS55MSplKyh5PzA6bikpLHZvaWQgMCE9PWkueTEmJihpLnkxPWMqcitpLnkxKmErKHk/MDpzKSksdm9pZCAwIT09aS54MiYmKGkueDI9aS54Mip0K2kueTIqZSsoeT8wOm4pKSx2b2lkIDAhPT1pLnkyJiYoaS55Mj1tKnIraS55MiphKyh5PzA6cykpO3ZhciBPPXQqYS1yKmU7aWYodm9pZCAwIT09aS54Um90JiYoMSE9PXR8fDAhPT1yfHwwIT09ZXx8MSE9PWEpKWlmKDA9PT1PKWRlbGV0ZSBpLnJYLGRlbGV0ZSBpLnJZLGRlbGV0ZSBpLnhSb3QsZGVsZXRlIGkubEFyY0ZsYWcsZGVsZXRlIGkuc3dlZXBGbGFnLGkudHlwZT1OLkxJTkVfVE87ZWxzZXt2YXIgbD1pLnhSb3QqTWF0aC5QSS8xODAsdj1NYXRoLnNpbihsKSxfPU1hdGguY29zKGwpLGQ9MS9UKGkuclgpLHg9MS9UKGkuclkpLEE9VChfKSpkK1QodikqeCxFPTIqdipfKihkLXgpLEM9VCh2KSpkK1QoXykqeCxNPUEqYSphLUUqciphK0MqcipyLFI9RSoodCphK3IqZSktMiooQSplKmErQyp0KnIpLFM9QSplKmUtRSp0KmUrQyp0KnQsZz0oTWF0aC5hdGFuMihSLE0tUykrTWF0aC5QSSklTWF0aC5QSS8yLEk9TWF0aC5zaW4oZyksVj1NYXRoLmNvcyhnKTtpLnJYPU1hdGguYWJzKE8pL01hdGguc3FydChNKlQoVikrUipJKlYrUypUKEkpKSxpLnJZPU1hdGguYWJzKE8pL01hdGguc3FydChNKlQoSSktUipJKlYrUypUKFYpKSxpLnhSb3Q9MTgwKmcvTWF0aC5QSX1yZXR1cm4gdm9pZCAwIT09aS5zd2VlcEZsYWcmJjA+TyYmKGkuc3dlZXBGbGFnPSshaS5zd2VlcEZsYWcpLGl9KSl9ZnVuY3Rpb24gVCgpe3JldHVybiBmdW5jdGlvbih0KXt2YXIgcj17fTtmb3IodmFyIGUgaW4gdClyW2VdPXRbZV07cmV0dXJuIHJ9fXQuUk9VTkQ9ZnVuY3Rpb24odCl7ZnVuY3Rpb24gcihyKXtyZXR1cm4gTWF0aC5yb3VuZChyKnQpL3R9cmV0dXJuIHZvaWQgMD09PXQmJih0PTFlMTMpLG8odCksZnVuY3Rpb24odCl7cmV0dXJuIHZvaWQgMCE9PXQueDEmJih0LngxPXIodC54MSkpLHZvaWQgMCE9PXQueTEmJih0LnkxPXIodC55MSkpLHZvaWQgMCE9PXQueDImJih0LngyPXIodC54MikpLHZvaWQgMCE9PXQueTImJih0LnkyPXIodC55MikpLHZvaWQgMCE9PXQueCYmKHQueD1yKHQueCkpLHZvaWQgMCE9PXQueSYmKHQueT1yKHQueSkpLHZvaWQgMCE9PXQuclgmJih0LnJYPXIodC5yWCkpLHZvaWQgMCE9PXQuclkmJih0LnJZPXIodC5yWSkpLHR9fSx0LlRPX0FCUz1yLHQuVE9fUkVMPWZ1bmN0aW9uKCl7cmV0dXJuIGkoKGZ1bmN0aW9uKHQscixlKXtyZXR1cm4gdC5yZWxhdGl2ZXx8KHZvaWQgMCE9PXQueDEmJih0LngxLT1yKSx2b2lkIDAhPT10LnkxJiYodC55MS09ZSksdm9pZCAwIT09dC54MiYmKHQueDItPXIpLHZvaWQgMCE9PXQueTImJih0LnkyLT1lKSx2b2lkIDAhPT10LngmJih0LngtPXIpLHZvaWQgMCE9PXQueSYmKHQueS09ZSksdC5yZWxhdGl2ZT0hMCksdH0pKX0sdC5OT1JNQUxJWkVfSFZaPWZ1bmN0aW9uKHQscixlKXtyZXR1cm4gdm9pZCAwPT09dCYmKHQ9ITApLHZvaWQgMD09PXImJihyPSEwKSx2b2lkIDA9PT1lJiYoZT0hMCksaSgoZnVuY3Rpb24oYSxpLG4sbyxzKXtpZihpc05hTihvKSYmIShhLnR5cGUmTi5NT1ZFX1RPKSl0aHJvdyBuZXcgRXJyb3IoXCJwYXRoIG11c3Qgc3RhcnQgd2l0aCBtb3ZldG9cIik7cmV0dXJuIHImJmEudHlwZSZOLkhPUklaX0xJTkVfVE8mJihhLnR5cGU9Ti5MSU5FX1RPLGEueT1hLnJlbGF0aXZlPzA6biksZSYmYS50eXBlJk4uVkVSVF9MSU5FX1RPJiYoYS50eXBlPU4uTElORV9UTyxhLng9YS5yZWxhdGl2ZT8wOmkpLHQmJmEudHlwZSZOLkNMT1NFX1BBVEgmJihhLnR5cGU9Ti5MSU5FX1RPLGEueD1hLnJlbGF0aXZlP28taTpvLGEueT1hLnJlbGF0aXZlP3MtbjpzKSxhLnR5cGUmTi5BUkMmJigwPT09YS5yWHx8MD09PWEuclkpJiYoYS50eXBlPU4uTElORV9UTyxkZWxldGUgYS5yWCxkZWxldGUgYS5yWSxkZWxldGUgYS54Um90LGRlbGV0ZSBhLmxBcmNGbGFnLGRlbGV0ZSBhLnN3ZWVwRmxhZyksYX0pKX0sdC5OT1JNQUxJWkVfU1Q9ZSx0LlFUX1RPX0M9YSx0LklORk89aSx0LlNBTklUSVpFPWZ1bmN0aW9uKHQpe3ZvaWQgMD09PXQmJih0PTApLG8odCk7dmFyIHI9TmFOLGU9TmFOLGE9TmFOLG49TmFOO3JldHVybiBpKChmdW5jdGlvbihpLG8scyx1LGgpe3ZhciBjPU1hdGguYWJzLG09ITEseT0wLHA9MDtpZihpLnR5cGUmTi5TTU9PVEhfQ1VSVkVfVE8mJih5PWlzTmFOKHIpPzA6by1yLHA9aXNOYU4oZSk/MDpzLWUpLGkudHlwZSYoTi5DVVJWRV9UT3xOLlNNT09USF9DVVJWRV9UTyk/KHI9aS5yZWxhdGl2ZT9vK2kueDI6aS54MixlPWkucmVsYXRpdmU/cytpLnkyOmkueTIpOihyPU5hTixlPU5hTiksaS50eXBlJk4uU01PT1RIX1FVQURfVE8/KGE9aXNOYU4oYSk/bzoyKm8tYSxuPWlzTmFOKG4pP3M6MipzLW4pOmkudHlwZSZOLlFVQURfVE8/KGE9aS5yZWxhdGl2ZT9vK2kueDE6aS54MSxuPWkucmVsYXRpdmU/cytpLnkxOmkueTIpOihhPU5hTixuPU5hTiksaS50eXBlJk4uTElORV9DT01NQU5EU3x8aS50eXBlJk4uQVJDJiYoMD09PWkuclh8fDA9PT1pLnJZfHwhaS5sQXJjRmxhZyl8fGkudHlwZSZOLkNVUlZFX1RPfHxpLnR5cGUmTi5TTU9PVEhfQ1VSVkVfVE98fGkudHlwZSZOLlFVQURfVE98fGkudHlwZSZOLlNNT09USF9RVUFEX1RPKXt2YXIgZj12b2lkIDA9PT1pLng/MDppLnJlbGF0aXZlP2kueDppLngtbyxUPXZvaWQgMD09PWkueT8wOmkucmVsYXRpdmU/aS55OmkueS1zO3k9aXNOYU4oYSk/dm9pZCAwPT09aS54MT95OmkucmVsYXRpdmU/aS54OmkueDEtbzphLW8scD1pc05hTihuKT92b2lkIDA9PT1pLnkxP3A6aS5yZWxhdGl2ZT9pLnk6aS55MS1zOm4tczt2YXIgTz12b2lkIDA9PT1pLngyPzA6aS5yZWxhdGl2ZT9pLng6aS54Mi1vLGw9dm9pZCAwPT09aS55Mj8wOmkucmVsYXRpdmU/aS55OmkueTItcztjKGYpPD10JiZjKFQpPD10JiZjKHkpPD10JiZjKHApPD10JiZjKE8pPD10JiZjKGwpPD10JiYobT0hMCl9cmV0dXJuIGkudHlwZSZOLkNMT1NFX1BBVEgmJmMoby11KTw9dCYmYyhzLWgpPD10JiYobT0hMCksbT9bXTppfSkpfSx0Lk1BVFJJWD1zLHQuUk9UQVRFPWZ1bmN0aW9uKHQscixlKXt2b2lkIDA9PT1yJiYocj0wKSx2b2lkIDA9PT1lJiYoZT0wKSxvKHQscixlKTt2YXIgYT1NYXRoLnNpbih0KSxpPU1hdGguY29zKHQpO3JldHVybiBzKGksYSwtYSxpLHItcippK2UqYSxlLXIqYS1lKmkpfSx0LlRSQU5TTEFURT1mdW5jdGlvbih0LHIpe3JldHVybiB2b2lkIDA9PT1yJiYocj0wKSxvKHQscikscygxLDAsMCwxLHQscil9LHQuU0NBTEU9ZnVuY3Rpb24odCxyKXtyZXR1cm4gdm9pZCAwPT09ciYmKHI9dCksbyh0LHIpLHModCwwLDAsciwwLDApfSx0LlNLRVdfWD1mdW5jdGlvbih0KXtyZXR1cm4gbyh0KSxzKDEsMCxNYXRoLmF0YW4odCksMSwwLDApfSx0LlNLRVdfWT1mdW5jdGlvbih0KXtyZXR1cm4gbyh0KSxzKDEsTWF0aC5hdGFuKHQpLDAsMSwwLDApfSx0LlhfQVhJU19TWU1NRVRSWT1mdW5jdGlvbih0KXtyZXR1cm4gdm9pZCAwPT09dCYmKHQ9MCksbyh0KSxzKC0xLDAsMCwxLHQsMCl9LHQuWV9BWElTX1NZTU1FVFJZPWZ1bmN0aW9uKHQpe3JldHVybiB2b2lkIDA9PT10JiYodD0wKSxvKHQpLHMoMSwwLDAsLTEsMCx0KX0sdC5BX1RPX0M9ZnVuY3Rpb24oKXtyZXR1cm4gaSgoZnVuY3Rpb24odCxyLGUpe3JldHVybiBOLkFSQz09PXQudHlwZT9mdW5jdGlvbih0LHIsZSl7dmFyIGEsaSxvLHM7dC5jWHx8dSh0LHIsZSk7Zm9yKHZhciBoPU1hdGgubWluKHQucGhpMSx0LnBoaTIpLHk9TWF0aC5tYXgodC5waGkxLHQucGhpMiktaCxwPU1hdGguY2VpbCh5LzkwKSxmPW5ldyBBcnJheShwKSxUPXIsTz1lLGw9MDtsPHA7bCsrKXt2YXIgdj1tKHQucGhpMSx0LnBoaTIsbC9wKSxfPW0odC5waGkxLHQucGhpMiwobCsxKS9wKSxkPV8tdix4PTQvMypNYXRoLnRhbihkKmMvNCksQT1bTWF0aC5jb3ModipjKS14Kk1hdGguc2luKHYqYyksTWF0aC5zaW4odipjKSt4Kk1hdGguY29zKHYqYyldLEU9QVswXSxDPUFbMV0sTT1bTWF0aC5jb3MoXypjKSxNYXRoLnNpbihfKmMpXSxSPU1bMF0sUz1NWzFdLGc9W1IreCpNYXRoLnNpbihfKmMpLFMteCpNYXRoLmNvcyhfKmMpXSxJPWdbMF0sVj1nWzFdO2ZbbF09e3JlbGF0aXZlOnQucmVsYXRpdmUsdHlwZTpOLkNVUlZFX1RPfTt2YXIgRD1mdW5jdGlvbihyLGUpe3ZhciBhPW4oW3IqdC5yWCxlKnQuclldLHQueFJvdCksaT1hWzBdLG89YVsxXTtyZXR1cm5bdC5jWCtpLHQuY1krb119O2E9RChFLEMpLGZbbF0ueDE9YVswXSxmW2xdLnkxPWFbMV0saT1EKEksViksZltsXS54Mj1pWzBdLGZbbF0ueTI9aVsxXSxvPUQoUixTKSxmW2xdLng9b1swXSxmW2xdLnk9b1sxXSx0LnJlbGF0aXZlJiYoZltsXS54MS09VCxmW2xdLnkxLT1PLGZbbF0ueDItPVQsZltsXS55Mi09TyxmW2xdLngtPVQsZltsXS55LT1PKSxUPShzPVtmW2xdLngsZltsXS55XSlbMF0sTz1zWzFdfXJldHVybiBmfSh0LHQucmVsYXRpdmU/MDpyLHQucmVsYXRpdmU/MDplKTp0fSkpfSx0LkFOTk9UQVRFX0FSQ1M9ZnVuY3Rpb24oKXtyZXR1cm4gaSgoZnVuY3Rpb24odCxyLGUpe3JldHVybiB0LnJlbGF0aXZlJiYocj0wLGU9MCksTi5BUkM9PT10LnR5cGUmJnUodCxyLGUpLHR9KSl9LHQuQ0xPTkU9VCx0LkNBTENVTEFURV9CT1VORFM9ZnVuY3Rpb24oKXt2YXIgdD1mdW5jdGlvbih0KXt2YXIgcj17fTtmb3IodmFyIGUgaW4gdClyW2VdPXRbZV07cmV0dXJuIHJ9LG49cigpLG89YSgpLHM9ZSgpLGM9aSgoZnVuY3Rpb24ocixlLGEpe3ZhciBpPXMobyhuKHQocikpKSk7ZnVuY3Rpb24gbSh0KXt0PmMubWF4WCYmKGMubWF4WD10KSx0PGMubWluWCYmKGMubWluWD10KX1mdW5jdGlvbiBUKHQpe3Q+Yy5tYXhZJiYoYy5tYXhZPXQpLHQ8Yy5taW5ZJiYoYy5taW5ZPXQpfWlmKGkudHlwZSZOLkRSQVdJTkdfQ09NTUFORFMmJihtKGUpLFQoYSkpLGkudHlwZSZOLkhPUklaX0xJTkVfVE8mJm0oaS54KSxpLnR5cGUmTi5WRVJUX0xJTkVfVE8mJlQoaS55KSxpLnR5cGUmTi5MSU5FX1RPJiYobShpLngpLFQoaS55KSksaS50eXBlJk4uQ1VSVkVfVE8pe20oaS54KSxUKGkueSk7Zm9yKHZhciBPPTAsbD1wKGUsaS54MSxpLngyLGkueCk7TzxsLmxlbmd0aDtPKyspezA8KEg9bFtPXSkmJjE+SCYmbShmKGUsaS54MSxpLngyLGkueCxIKSl9Zm9yKHZhciB2PTAsXz1wKGEsaS55MSxpLnkyLGkueSk7djxfLmxlbmd0aDt2KyspezA8KEg9X1t2XSkmJjE+SCYmVChmKGEsaS55MSxpLnkyLGkueSxIKSl9fWlmKGkudHlwZSZOLkFSQyl7bShpLngpLFQoaS55KSx1KGksZSxhKTtmb3IodmFyIGQ9aS54Um90LzE4MCpNYXRoLlBJLHg9TWF0aC5jb3MoZCkqaS5yWCxBPU1hdGguc2luKGQpKmkuclgsRT0tTWF0aC5zaW4oZCkqaS5yWSxDPU1hdGguY29zKGQpKmkuclksTT1pLnBoaTE8aS5waGkyP1tpLnBoaTEsaS5waGkyXTotMTgwPmkucGhpMj9baS5waGkyKzM2MCxpLnBoaTErMzYwXTpbaS5waGkyLGkucGhpMV0sUj1NWzBdLFM9TVsxXSxnPWZ1bmN0aW9uKHQpe3ZhciByPXRbMF0sZT10WzFdLGE9MTgwKk1hdGguYXRhbjIoZSxyKS9NYXRoLlBJO3JldHVybiBhPFI/YSszNjA6YX0sST0wLFY9aChFLC14LDApLm1hcChnKTtJPFYubGVuZ3RoO0krKyl7KEg9VltJXSk+UiYmSDxTJiZtKHkoaS5jWCx4LEUsSCkpfWZvcih2YXIgRD0wLEw9aChDLC1BLDApLm1hcChnKTtEPEwubGVuZ3RoO0QrKyl7dmFyIEg7KEg9TFtEXSk+UiYmSDxTJiZUKHkoaS5jWSxBLEMsSCkpfX1yZXR1cm4gcn0pKTtyZXR1cm4gYy5taW5YPTEvMCxjLm1heFg9LTEvMCxjLm1pblk9MS8wLGMubWF4WT0tMS8wLGN9fSh0LlNWR1BhdGhEYXRhVHJhbnNmb3JtZXJ8fCh0LlNWR1BhdGhEYXRhVHJhbnNmb3JtZXI9e30pKTt2YXIgVCxPPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gcigpe31yZXR1cm4gci5wcm90b3R5cGUucm91bmQ9ZnVuY3Rpb24ocil7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5ST1VORChyKSl9LHIucHJvdG90eXBlLnRvQWJzPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5UT19BQlMoKSl9LHIucHJvdG90eXBlLnRvUmVsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5UT19SRUwoKSl9LHIucHJvdG90eXBlLm5vcm1hbGl6ZUhWWj1mdW5jdGlvbihyLGUsYSl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5OT1JNQUxJWkVfSFZaKHIsZSxhKSl9LHIucHJvdG90eXBlLm5vcm1hbGl6ZVNUPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5OT1JNQUxJWkVfU1QoKSl9LHIucHJvdG90eXBlLnF0VG9DPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5RVF9UT19DKCkpfSxyLnByb3RvdHlwZS5hVG9DPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5BX1RPX0MoKSl9LHIucHJvdG90eXBlLnNhbml0aXplPWZ1bmN0aW9uKHIpe3JldHVybiB0aGlzLnRyYW5zZm9ybSh0LlNWR1BhdGhEYXRhVHJhbnNmb3JtZXIuU0FOSVRJWkUocikpfSxyLnByb3RvdHlwZS50cmFuc2xhdGU9ZnVuY3Rpb24ocixlKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm0odC5TVkdQYXRoRGF0YVRyYW5zZm9ybWVyLlRSQU5TTEFURShyLGUpKX0sci5wcm90b3R5cGUuc2NhbGU9ZnVuY3Rpb24ocixlKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm0odC5TVkdQYXRoRGF0YVRyYW5zZm9ybWVyLlNDQUxFKHIsZSkpfSxyLnByb3RvdHlwZS5yb3RhdGU9ZnVuY3Rpb24ocixlLGEpe3JldHVybiB0aGlzLnRyYW5zZm9ybSh0LlNWR1BhdGhEYXRhVHJhbnNmb3JtZXIuUk9UQVRFKHIsZSxhKSl9LHIucHJvdG90eXBlLm1hdHJpeD1mdW5jdGlvbihyLGUsYSxpLG4sbyl7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5NQVRSSVgocixlLGEsaSxuLG8pKX0sci5wcm90b3R5cGUuc2tld1g9ZnVuY3Rpb24ocil7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5TS0VXX1gocikpfSxyLnByb3RvdHlwZS5za2V3WT1mdW5jdGlvbihyKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm0odC5TVkdQYXRoRGF0YVRyYW5zZm9ybWVyLlNLRVdfWShyKSl9LHIucHJvdG90eXBlLnhTeW1tZXRyeT1mdW5jdGlvbihyKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm0odC5TVkdQYXRoRGF0YVRyYW5zZm9ybWVyLlhfQVhJU19TWU1NRVRSWShyKSl9LHIucHJvdG90eXBlLnlTeW1tZXRyeT1mdW5jdGlvbihyKXtyZXR1cm4gdGhpcy50cmFuc2Zvcm0odC5TVkdQYXRoRGF0YVRyYW5zZm9ybWVyLllfQVhJU19TWU1NRVRSWShyKSl9LHIucHJvdG90eXBlLmFubm90YXRlQXJjcz1mdW5jdGlvbigpe3JldHVybiB0aGlzLnRyYW5zZm9ybSh0LlNWR1BhdGhEYXRhVHJhbnNmb3JtZXIuQU5OT1RBVEVfQVJDUygpKX0scn0oKSxsPWZ1bmN0aW9uKHQpe3JldHVyblwiIFwiPT09dHx8XCJcXHRcIj09PXR8fFwiXFxyXCI9PT10fHxcIlxcblwiPT09dH0sdj1mdW5jdGlvbih0KXtyZXR1cm5cIjBcIi5jaGFyQ29kZUF0KDApPD10LmNoYXJDb2RlQXQoMCkmJnQuY2hhckNvZGVBdCgwKTw9XCI5XCIuY2hhckNvZGVBdCgwKX0sXz1mdW5jdGlvbih0KXtmdW5jdGlvbiByKCl7dmFyIHI9dC5jYWxsKHRoaXMpfHx0aGlzO3JldHVybiByLmN1ck51bWJlcj1cIlwiLHIuY3VyQ29tbWFuZFR5cGU9LTEsci5jdXJDb21tYW5kUmVsYXRpdmU9ITEsci5jYW5QYXJzZUNvbW1hbmRPckNvbW1hPSEwLHIuY3VyTnVtYmVySGFzRXhwPSExLHIuY3VyTnVtYmVySGFzRXhwRGlnaXRzPSExLHIuY3VyTnVtYmVySGFzRGVjaW1hbD0hMSxyLmN1ckFyZ3M9W10scn1yZXR1cm4gZShyLHQpLHIucHJvdG90eXBlLmZpbmlzaD1mdW5jdGlvbih0KXtpZih2b2lkIDA9PT10JiYodD1bXSksdGhpcy5wYXJzZShcIiBcIix0KSwwIT09dGhpcy5jdXJBcmdzLmxlbmd0aHx8IXRoaXMuY2FuUGFyc2VDb21tYW5kT3JDb21tYSl0aHJvdyBuZXcgU3ludGF4RXJyb3IoXCJVbnRlcm1pbmF0ZWQgY29tbWFuZCBhdCB0aGUgcGF0aCBlbmQuXCIpO3JldHVybiB0fSxyLnByb3RvdHlwZS5wYXJzZT1mdW5jdGlvbih0LHIpe3ZhciBlPXRoaXM7dm9pZCAwPT09ciYmKHI9W10pO2Zvcih2YXIgYT1mdW5jdGlvbih0KXtyLnB1c2godCksZS5jdXJBcmdzLmxlbmd0aD0wLGUuY2FuUGFyc2VDb21tYW5kT3JDb21tYT0hMH0saT0wO2k8dC5sZW5ndGg7aSsrKXt2YXIgbj10W2ldLG89ISh0aGlzLmN1ckNvbW1hbmRUeXBlIT09Ti5BUkN8fDMhPT10aGlzLmN1ckFyZ3MubGVuZ3RoJiY0IT09dGhpcy5jdXJBcmdzLmxlbmd0aHx8MSE9PXRoaXMuY3VyTnVtYmVyLmxlbmd0aHx8XCIwXCIhPT10aGlzLmN1ck51bWJlciYmXCIxXCIhPT10aGlzLmN1ck51bWJlcikscz12KG4pJiYoXCIwXCI9PT10aGlzLmN1ck51bWJlciYmXCIwXCI9PT1ufHxvKTtpZighdihuKXx8cylpZihcImVcIiE9PW4mJlwiRVwiIT09bilpZihcIi1cIiE9PW4mJlwiK1wiIT09bnx8IXRoaXMuY3VyTnVtYmVySGFzRXhwfHx0aGlzLmN1ck51bWJlckhhc0V4cERpZ2l0cylpZihcIi5cIiE9PW58fHRoaXMuY3VyTnVtYmVySGFzRXhwfHx0aGlzLmN1ck51bWJlckhhc0RlY2ltYWx8fG8pe2lmKHRoaXMuY3VyTnVtYmVyJiYtMSE9PXRoaXMuY3VyQ29tbWFuZFR5cGUpe3ZhciB1PU51bWJlcih0aGlzLmN1ck51bWJlcik7aWYoaXNOYU4odSkpdGhyb3cgbmV3IFN5bnRheEVycm9yKFwiSW52YWxpZCBudW1iZXIgZW5kaW5nIGF0IFwiK2kpO2lmKHRoaXMuY3VyQ29tbWFuZFR5cGU9PT1OLkFSQylpZigwPT09dGhpcy5jdXJBcmdzLmxlbmd0aHx8MT09PXRoaXMuY3VyQXJncy5sZW5ndGgpe2lmKDA+dSl0aHJvdyBuZXcgU3ludGF4RXJyb3IoJ0V4cGVjdGVkIHBvc2l0aXZlIG51bWJlciwgZ290IFwiJyt1KydcIiBhdCBpbmRleCBcIicraSsnXCInKX1lbHNlIGlmKCgzPT09dGhpcy5jdXJBcmdzLmxlbmd0aHx8ND09PXRoaXMuY3VyQXJncy5sZW5ndGgpJiZcIjBcIiE9PXRoaXMuY3VyTnVtYmVyJiZcIjFcIiE9PXRoaXMuY3VyTnVtYmVyKXRocm93IG5ldyBTeW50YXhFcnJvcignRXhwZWN0ZWQgYSBmbGFnLCBnb3QgXCInK3RoaXMuY3VyTnVtYmVyKydcIiBhdCBpbmRleCBcIicraSsnXCInKTt0aGlzLmN1ckFyZ3MucHVzaCh1KSx0aGlzLmN1ckFyZ3MubGVuZ3RoPT09ZFt0aGlzLmN1ckNvbW1hbmRUeXBlXSYmKE4uSE9SSVpfTElORV9UTz09PXRoaXMuY3VyQ29tbWFuZFR5cGU/YSh7dHlwZTpOLkhPUklaX0xJTkVfVE8scmVsYXRpdmU6dGhpcy5jdXJDb21tYW5kUmVsYXRpdmUseDp1fSk6Ti5WRVJUX0xJTkVfVE89PT10aGlzLmN1ckNvbW1hbmRUeXBlP2Eoe3R5cGU6Ti5WRVJUX0xJTkVfVE8scmVsYXRpdmU6dGhpcy5jdXJDb21tYW5kUmVsYXRpdmUseTp1fSk6dGhpcy5jdXJDb21tYW5kVHlwZT09PU4uTU9WRV9UT3x8dGhpcy5jdXJDb21tYW5kVHlwZT09PU4uTElORV9UT3x8dGhpcy5jdXJDb21tYW5kVHlwZT09PU4uU01PT1RIX1FVQURfVE8/KGEoe3R5cGU6dGhpcy5jdXJDb21tYW5kVHlwZSxyZWxhdGl2ZTp0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZSx4OnRoaXMuY3VyQXJnc1swXSx5OnRoaXMuY3VyQXJnc1sxXX0pLE4uTU9WRV9UTz09PXRoaXMuY3VyQ29tbWFuZFR5cGUmJih0aGlzLmN1ckNvbW1hbmRUeXBlPU4uTElORV9UTykpOnRoaXMuY3VyQ29tbWFuZFR5cGU9PT1OLkNVUlZFX1RPP2Eoe3R5cGU6Ti5DVVJWRV9UTyxyZWxhdGl2ZTp0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZSx4MTp0aGlzLmN1ckFyZ3NbMF0seTE6dGhpcy5jdXJBcmdzWzFdLHgyOnRoaXMuY3VyQXJnc1syXSx5Mjp0aGlzLmN1ckFyZ3NbM10seDp0aGlzLmN1ckFyZ3NbNF0seTp0aGlzLmN1ckFyZ3NbNV19KTp0aGlzLmN1ckNvbW1hbmRUeXBlPT09Ti5TTU9PVEhfQ1VSVkVfVE8/YSh7dHlwZTpOLlNNT09USF9DVVJWRV9UTyxyZWxhdGl2ZTp0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZSx4Mjp0aGlzLmN1ckFyZ3NbMF0seTI6dGhpcy5jdXJBcmdzWzFdLHg6dGhpcy5jdXJBcmdzWzJdLHk6dGhpcy5jdXJBcmdzWzNdfSk6dGhpcy5jdXJDb21tYW5kVHlwZT09PU4uUVVBRF9UTz9hKHt0eXBlOk4uUVVBRF9UTyxyZWxhdGl2ZTp0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZSx4MTp0aGlzLmN1ckFyZ3NbMF0seTE6dGhpcy5jdXJBcmdzWzFdLHg6dGhpcy5jdXJBcmdzWzJdLHk6dGhpcy5jdXJBcmdzWzNdfSk6dGhpcy5jdXJDb21tYW5kVHlwZT09PU4uQVJDJiZhKHt0eXBlOk4uQVJDLHJlbGF0aXZlOnRoaXMuY3VyQ29tbWFuZFJlbGF0aXZlLHJYOnRoaXMuY3VyQXJnc1swXSxyWTp0aGlzLmN1ckFyZ3NbMV0seFJvdDp0aGlzLmN1ckFyZ3NbMl0sbEFyY0ZsYWc6dGhpcy5jdXJBcmdzWzNdLHN3ZWVwRmxhZzp0aGlzLmN1ckFyZ3NbNF0seDp0aGlzLmN1ckFyZ3NbNV0seTp0aGlzLmN1ckFyZ3NbNl19KSksdGhpcy5jdXJOdW1iZXI9XCJcIix0aGlzLmN1ck51bWJlckhhc0V4cERpZ2l0cz0hMSx0aGlzLmN1ck51bWJlckhhc0V4cD0hMSx0aGlzLmN1ck51bWJlckhhc0RlY2ltYWw9ITEsdGhpcy5jYW5QYXJzZUNvbW1hbmRPckNvbW1hPSEwfWlmKCFsKG4pKWlmKFwiLFwiPT09biYmdGhpcy5jYW5QYXJzZUNvbW1hbmRPckNvbW1hKXRoaXMuY2FuUGFyc2VDb21tYW5kT3JDb21tYT0hMTtlbHNlIGlmKFwiK1wiIT09biYmXCItXCIhPT1uJiZcIi5cIiE9PW4paWYocyl0aGlzLmN1ck51bWJlcj1uLHRoaXMuY3VyTnVtYmVySGFzRGVjaW1hbD0hMTtlbHNle2lmKDAhPT10aGlzLmN1ckFyZ3MubGVuZ3RoKXRocm93IG5ldyBTeW50YXhFcnJvcihcIlVudGVybWluYXRlZCBjb21tYW5kIGF0IGluZGV4IFwiK2krXCIuXCIpO2lmKCF0aGlzLmNhblBhcnNlQ29tbWFuZE9yQ29tbWEpdGhyb3cgbmV3IFN5bnRheEVycm9yKCdVbmV4cGVjdGVkIGNoYXJhY3RlciBcIicrbisnXCIgYXQgaW5kZXggJytpK1wiLiBDb21tYW5kIGNhbm5vdCBmb2xsb3cgY29tbWFcIik7aWYodGhpcy5jYW5QYXJzZUNvbW1hbmRPckNvbW1hPSExLFwielwiIT09biYmXCJaXCIhPT1uKWlmKFwiaFwiPT09bnx8XCJIXCI9PT1uKXRoaXMuY3VyQ29tbWFuZFR5cGU9Ti5IT1JJWl9MSU5FX1RPLHRoaXMuY3VyQ29tbWFuZFJlbGF0aXZlPVwiaFwiPT09bjtlbHNlIGlmKFwidlwiPT09bnx8XCJWXCI9PT1uKXRoaXMuY3VyQ29tbWFuZFR5cGU9Ti5WRVJUX0xJTkVfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJ2XCI9PT1uO2Vsc2UgaWYoXCJtXCI9PT1ufHxcIk1cIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1OLk1PVkVfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJtXCI9PT1uO2Vsc2UgaWYoXCJsXCI9PT1ufHxcIkxcIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1OLkxJTkVfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJsXCI9PT1uO2Vsc2UgaWYoXCJjXCI9PT1ufHxcIkNcIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1OLkNVUlZFX1RPLHRoaXMuY3VyQ29tbWFuZFJlbGF0aXZlPVwiY1wiPT09bjtlbHNlIGlmKFwic1wiPT09bnx8XCJTXCI9PT1uKXRoaXMuY3VyQ29tbWFuZFR5cGU9Ti5TTU9PVEhfQ1VSVkVfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJzXCI9PT1uO2Vsc2UgaWYoXCJxXCI9PT1ufHxcIlFcIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1OLlFVQURfVE8sdGhpcy5jdXJDb21tYW5kUmVsYXRpdmU9XCJxXCI9PT1uO2Vsc2UgaWYoXCJ0XCI9PT1ufHxcIlRcIj09PW4pdGhpcy5jdXJDb21tYW5kVHlwZT1OLlNNT09USF9RVUFEX1RPLHRoaXMuY3VyQ29tbWFuZFJlbGF0aXZlPVwidFwiPT09bjtlbHNle2lmKFwiYVwiIT09biYmXCJBXCIhPT1uKXRocm93IG5ldyBTeW50YXhFcnJvcignVW5leHBlY3RlZCBjaGFyYWN0ZXIgXCInK24rJ1wiIGF0IGluZGV4ICcraStcIi5cIik7dGhpcy5jdXJDb21tYW5kVHlwZT1OLkFSQyx0aGlzLmN1ckNvbW1hbmRSZWxhdGl2ZT1cImFcIj09PW59ZWxzZSByLnB1c2goe3R5cGU6Ti5DTE9TRV9QQVRIfSksdGhpcy5jYW5QYXJzZUNvbW1hbmRPckNvbW1hPSEwLHRoaXMuY3VyQ29tbWFuZFR5cGU9LTF9ZWxzZSB0aGlzLmN1ck51bWJlcj1uLHRoaXMuY3VyTnVtYmVySGFzRGVjaW1hbD1cIi5cIj09PW59ZWxzZSB0aGlzLmN1ck51bWJlcis9bix0aGlzLmN1ck51bWJlckhhc0RlY2ltYWw9ITA7ZWxzZSB0aGlzLmN1ck51bWJlcis9bjtlbHNlIHRoaXMuY3VyTnVtYmVyKz1uLHRoaXMuY3VyTnVtYmVySGFzRXhwPSEwO2Vsc2UgdGhpcy5jdXJOdW1iZXIrPW4sdGhpcy5jdXJOdW1iZXJIYXNFeHBEaWdpdHM9dGhpcy5jdXJOdW1iZXJIYXNFeHB9cmV0dXJuIHJ9LHIucHJvdG90eXBlLnRyYW5zZm9ybT1mdW5jdGlvbih0KXtyZXR1cm4gT2JqZWN0LmNyZWF0ZSh0aGlzLHtwYXJzZTp7dmFsdWU6ZnVuY3Rpb24ocixlKXt2b2lkIDA9PT1lJiYoZT1bXSk7Zm9yKHZhciBhPTAsaT1PYmplY3QuZ2V0UHJvdG90eXBlT2YodGhpcykucGFyc2UuY2FsbCh0aGlzLHIpO2E8aS5sZW5ndGg7YSsrKXt2YXIgbj1pW2FdLG89dChuKTtBcnJheS5pc0FycmF5KG8pP2UucHVzaC5hcHBseShlLG8pOmUucHVzaChvKX1yZXR1cm4gZX19fSl9LHJ9KE8pLE49ZnVuY3Rpb24ocil7ZnVuY3Rpb24gYSh0KXt2YXIgZT1yLmNhbGwodGhpcyl8fHRoaXM7cmV0dXJuIGUuY29tbWFuZHM9XCJzdHJpbmdcIj09dHlwZW9mIHQ/YS5wYXJzZSh0KTp0LGV9cmV0dXJuIGUoYSxyKSxhLnByb3RvdHlwZS5lbmNvZGU9ZnVuY3Rpb24oKXtyZXR1cm4gYS5lbmNvZGUodGhpcy5jb21tYW5kcyl9LGEucHJvdG90eXBlLmdldEJvdW5kcz1mdW5jdGlvbigpe3ZhciByPXQuU1ZHUGF0aERhdGFUcmFuc2Zvcm1lci5DQUxDVUxBVEVfQk9VTkRTKCk7cmV0dXJuIHRoaXMudHJhbnNmb3JtKHIpLHJ9LGEucHJvdG90eXBlLnRyYW5zZm9ybT1mdW5jdGlvbih0KXtmb3IodmFyIHI9W10sZT0wLGE9dGhpcy5jb21tYW5kcztlPGEubGVuZ3RoO2UrKyl7dmFyIGk9dChhW2VdKTtBcnJheS5pc0FycmF5KGkpP3IucHVzaC5hcHBseShyLGkpOnIucHVzaChpKX1yZXR1cm4gdGhpcy5jb21tYW5kcz1yLHRoaXN9LGEuZW5jb2RlPWZ1bmN0aW9uKHQpe3JldHVybiBpKHQpfSxhLnBhcnNlPWZ1bmN0aW9uKHQpe3ZhciByPW5ldyBfLGU9W107cmV0dXJuIHIucGFyc2UodCxlKSxyLmZpbmlzaChlKSxlfSxhLkNMT1NFX1BBVEg9MSxhLk1PVkVfVE89MixhLkhPUklaX0xJTkVfVE89NCxhLlZFUlRfTElORV9UTz04LGEuTElORV9UTz0xNixhLkNVUlZFX1RPPTMyLGEuU01PT1RIX0NVUlZFX1RPPTY0LGEuUVVBRF9UTz0xMjgsYS5TTU9PVEhfUVVBRF9UTz0yNTYsYS5BUkM9NTEyLGEuTElORV9DT01NQU5EUz1hLkxJTkVfVE98YS5IT1JJWl9MSU5FX1RPfGEuVkVSVF9MSU5FX1RPLGEuRFJBV0lOR19DT01NQU5EUz1hLkhPUklaX0xJTkVfVE98YS5WRVJUX0xJTkVfVE98YS5MSU5FX1RPfGEuQ1VSVkVfVE98YS5TTU9PVEhfQ1VSVkVfVE98YS5RVUFEX1RPfGEuU01PT1RIX1FVQURfVE98YS5BUkMsYX0oTyksZD0oKFQ9e30pW04uTU9WRV9UT109MixUW04uTElORV9UT109MixUW04uSE9SSVpfTElORV9UT109MSxUW04uVkVSVF9MSU5FX1RPXT0xLFRbTi5DTE9TRV9QQVRIXT0wLFRbTi5RVUFEX1RPXT00LFRbTi5TTU9PVEhfUVVBRF9UT109MixUW04uQ1VSVkVfVE9dPTYsVFtOLlNNT09USF9DVVJWRV9UT109NCxUW04uQVJDXT03LFQpO3QuQ09NTUFORF9BUkdfQ09VTlRTPWQsdC5TVkdQYXRoRGF0YT1OLHQuU1ZHUGF0aERhdGFQYXJzZXI9Xyx0LmVuY29kZVNWR1BhdGg9aSxPYmplY3QuZGVmaW5lUHJvcGVydHkodCxcIl9fZXNNb2R1bGVcIix7dmFsdWU6ITB9KX0pKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPVNWR1BhdGhEYXRhLmNqcy5tYXBcbiIsIi8vIFRoZSBtb2R1bGUgY2FjaGVcbnZhciBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX18gPSB7fTtcblxuLy8gVGhlIHJlcXVpcmUgZnVuY3Rpb25cbmZ1bmN0aW9uIF9fd2VicGFja19yZXF1aXJlX18obW9kdWxlSWQpIHtcblx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG5cdHZhciBjYWNoZWRNb2R1bGUgPSBfX3dlYnBhY2tfbW9kdWxlX2NhY2hlX19bbW9kdWxlSWRdO1xuXHRpZiAoY2FjaGVkTW9kdWxlICE9PSB1bmRlZmluZWQpIHtcblx0XHRyZXR1cm4gY2FjaGVkTW9kdWxlLmV4cG9ydHM7XG5cdH1cblx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcblx0dmFyIG1vZHVsZSA9IF9fd2VicGFja19tb2R1bGVfY2FjaGVfX1ttb2R1bGVJZF0gPSB7XG5cdFx0Ly8gbm8gbW9kdWxlLmlkIG5lZWRlZFxuXHRcdC8vIG5vIG1vZHVsZS5sb2FkZWQgbmVlZGVkXG5cdFx0ZXhwb3J0czoge31cblx0fTtcblxuXHQvLyBFeGVjdXRlIHRoZSBtb2R1bGUgZnVuY3Rpb25cblx0X193ZWJwYWNrX21vZHVsZXNfX1ttb2R1bGVJZF0uY2FsbChtb2R1bGUuZXhwb3J0cywgbW9kdWxlLCBtb2R1bGUuZXhwb3J0cywgX193ZWJwYWNrX3JlcXVpcmVfXyk7XG5cblx0Ly8gUmV0dXJuIHRoZSBleHBvcnRzIG9mIHRoZSBtb2R1bGVcblx0cmV0dXJuIG1vZHVsZS5leHBvcnRzO1xufVxuXG4iLCIvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9ucyBmb3IgaGFybW9ueSBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLmQgPSAoZXhwb3J0cywgZGVmaW5pdGlvbikgPT4ge1xuXHRmb3IodmFyIGtleSBpbiBkZWZpbml0aW9uKSB7XG5cdFx0aWYoX193ZWJwYWNrX3JlcXVpcmVfXy5vKGRlZmluaXRpb24sIGtleSkgJiYgIV9fd2VicGFja19yZXF1aXJlX18ubyhleHBvcnRzLCBrZXkpKSB7XG5cdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywga2V5LCB7IGVudW1lcmFibGU6IHRydWUsIGdldDogZGVmaW5pdGlvbltrZXldIH0pO1xuXHRcdH1cblx0fVxufTsiLCJfX3dlYnBhY2tfcmVxdWlyZV9fLmcgPSAoZnVuY3Rpb24oKSB7XG5cdGlmICh0eXBlb2YgZ2xvYmFsVGhpcyA9PT0gJ29iamVjdCcpIHJldHVybiBnbG9iYWxUaGlzO1xuXHR0cnkge1xuXHRcdHJldHVybiB0aGlzIHx8IG5ldyBGdW5jdGlvbigncmV0dXJuIHRoaXMnKSgpO1xuXHR9IGNhdGNoIChlKSB7XG5cdFx0aWYgKHR5cGVvZiB3aW5kb3cgPT09ICdvYmplY3QnKSByZXR1cm4gd2luZG93O1xuXHR9XG59KSgpOyIsIl9fd2VicGFja19yZXF1aXJlX18ubyA9IChvYmosIHByb3ApID0+IChPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqLCBwcm9wKSkiLCIvLyBkZWZpbmUgX19lc01vZHVsZSBvbiBleHBvcnRzXG5fX3dlYnBhY2tfcmVxdWlyZV9fLnIgPSAoZXhwb3J0cykgPT4ge1xuXHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcblx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcblx0fVxuXHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xufTsiLCIiLCIvLyBzdGFydHVwXG4vLyBMb2FkIGVudHJ5IG1vZHVsZSBhbmQgcmV0dXJuIGV4cG9ydHNcbi8vIFRoaXMgZW50cnkgbW9kdWxlIGlzIHJlZmVyZW5jZWQgYnkgb3RoZXIgbW9kdWxlcyBzbyBpdCBjYW4ndCBiZSBpbmxpbmVkXG52YXIgX193ZWJwYWNrX2V4cG9ydHNfXyA9IF9fd2VicGFja19yZXF1aXJlX18oXCIuL3NyYy9jbGllbnQvaW5kZXgudHNcIik7XG4iLCIiXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=