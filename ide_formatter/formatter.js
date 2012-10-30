/*
 * Formater for Nerrvana - using Junit and Selenium RC
 * Version 0.5 - 12 Oct 2012
 * contact@nerrvana.com
 */

var subScriptLoader = Components.classes["@mozilla.org/moz/jssubscript-loader;1"].getService(Components.interfaces.mozIJSSubScriptLoader);
subScriptLoader.loadSubScript('chrome://selenium-ide/content/formats/remoteControl.js', this);

this.name = "java-rc-junit4-nerrvana";

function useSeparateEqualsForArray() {
	return true;
}

function testMethodName(testName) {
	return "test" + capitalize(testName);
}

function assertTrue(expression) {
    var str_expr = expression.toString();
    var str_expr_escaped = str_expr.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
	return "assertTrue(\"Expression is false: [" + str_expr_escaped + "]\", " + str_expr + ");";
}

function verifyTrue(expression) {
    var str_expr = expression.toString();
    var str_expr_escaped = str_expr.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
    return "verifyTrue(" + str_expr + ", \"[" + str_expr_escaped + "]\");";
}

function assertFalse(expression) {
    var str_expr = expression.toString();
    var str_expr_escaped = str_expr.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
    return "assertFalse(\"Expression is true: [" + str_expr_escaped + "]\", " + str_expr + ");";
}

function verifyFalse(expression) {
    var str_expr = expression.toString();
    var str_expr_escaped = str_expr.replace(/\\/g, "\\\\").replace(/\"/g, "\\\"");
    return "verifyFalse(" + str_expr + ", \"[" + str_expr_escaped + "]\");";
}

function assignToVariable(type, variable, expression) {
	return type + " " + variable + " = " + expression.toString();
}

function ifCondition(expression, callback) {
    return "if (" + expression.toString() + ") {\n" + callback() + "}";
}

function joinExpression(expression) {
    return "join(" + expression.toString() + ", ',')";
}

function waitFor(expression) {
	return "for (int second = 0;; second++) {\n" +
		"\tif (second >= 60) fail(\"timeout\");\n" +
		"\ttry { " + (expression.setup ? expression.setup() + " " : "") +
		"if (" + expression.toString() + ") break; } catch (Exception e) {}\n" +
		"\tThread.sleep(1000);\n" +
		"}\n";
	//return "while (" + not(expression).toString() + ") { Thread.sleep(1000); }";
}

function assertOrVerifyFailure(line, isAssert) {
	var message = '"expected failure"';
    var failStatement = "fail(" + message + ");";
	return "try { " + line + " " + failStatement + " } catch (Throwable e) {}";
}

Equals.prototype.toString = function() {
    if (this.e1.toString().match(/^\d+$/)) {
        // int
	    return this.e1.toString() + " == " + this.e2.toString();
    } else {
        // string
	    return this.e1.toString() + ".equals(" + this.e2.toString() + ")";
    }
};

Equals.prototype.assert = function() {
	return "assertEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

Equals.prototype.verify = function() {
	return "verifyEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

NotEquals.prototype.toString = function() {
	return "!" + this.e1.toString() + ".equals(" + this.e2.toString() + ")";
};

NotEquals.prototype.assert = function() {
	return "assertNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

NotEquals.prototype.verify = function() {
	return "verifyNotEquals(" + this.e1.toString() + ", " + this.e2.toString() + ");";
};

RegexpMatch.prototype.toString = function() {
	if (this.pattern.match(/^\^/) && this.pattern.match(/\$$/)) {
		return this.expression + ".matches(" + string(this.pattern) + ")";
	} else {
		return "Pattern.compile(" + string(this.pattern) + ").matcher(" + this.expression + ").find()";
	}
};

function pause(milliseconds) {
	return "Thread.sleep(" + parseInt(milliseconds, 10) + ");";
}

function echo(message) {
	return "System.out.println(" + xlateArgument(message) + ");";
}

function statement(expression) {
	return expression.toString() + ';';
}

function array(value) {
	var str = 'new String[] {';
	for (var i = 0; i < value.length; i++) {
		str += string(value[i]);
		if (i < value.length - 1) str += ", ";
	}
	str += '}';
	return str;
}

function nonBreakingSpace() {
    return "\"\\u00a0\"";
}

CallSelenium.prototype.toString = function() {
	var result = '';
	if (this.negative) {
		result += '!';
	}
	if (options.receiver) {
		result += options.receiver + '.';
	}
	result += this.message;
	result += '(';
	for (var i = 0; i < this.args.length; i++) {
		result += this.args[i];
		if (i < this.args.length - 1) {
			result += ', ';
		}
	}
	result += ')';
	return result;
};

function formatComment(comment) {
	return comment.comment.replace(/.+/mg, function(str) {
			return "// " + str;
		});
}

/**
 * Returns a string representing the suite for this formatter language.
 *
 * @param testSuite  the suite to format
 * @param filename   the file the formatted suite will be saved as
 */
function formatSuite(testSuite, filename) {
    var suiteClass = /^(\w+)/.exec(filename)[1];
    suiteClass = suiteClass[0].toUpperCase() + suiteClass.substring(1);

    var formattedSuite = "import org.junit.*;\n"
        + "\n"
        + "public class " + suiteClass + " {\n"
        + "\n"
        + indents(1) + "public static void main(String[] args) {\n"
        + indents(2) + "Class[] testClasses = {\n";

    for (var i = 0; i < testSuite.tests.length; ++i) {
        var testClass = testSuite.tests[i].getTitle();
        formattedSuite += indents(3) + testClass + ".class";
        if (i < testSuite.tests.length-1) {
            formattedSuite += ",";
        }
        formattedSuite += "\n";
    }
    formattedSuite += indents(2) + "};\n";

    formattedSuite += indents(2) + "org.junit.runner.JUnitCore.runClasses(testClasses);\n"
        + indents(1) + "}\n"
        + "}\n";

    return formattedSuite;
}

function defaultExtension() {
  return this.options.defaultExtension;
}

this.options = {
	receiver: "selenium",
	environment: "*firefox",
	packageName: "",
    indent:	'tab',
    initialIndents:	'2',
    defaultExtension: "java"
};


options.header =
"import java.io.*;\n" +
"import java.util.regex.Pattern;\n" +
"import com.thoughtworks.selenium.*;\n" +
"import org.apache.commons.codec.binary.Base64;\n" +
"import org.junit.*;\n" +
"import static org.junit.Assert.*;\n" +
"import org.junit.rules.TestRule;\n" +
"import org.junit.rules.TestWatcher;\n" +
"import org.junit.runner.Description;\n" +
"\n" +
"public class ${className} {\n" +
"\tString baseUrl = \"${baseURL}\";\n" +
"\tpublic static void main(String args[]) {\n" +
"\t\torg.junit.runner.JUnitCore.main(\"${className}\");\n" +
"\t}\n" +
"\n" +
"\t// tests itself\n" +
"\t@Test\n" +
"\tpublic void ${methodName}() throws Exception {   \n";

options.footer =
	"\t}\n" +
    "\n" +
    "\t// starting definitions which are not tests itself\n" +
    "\tDefaultSelenium selenium;\n" +
    "\n" +
    "\tprotected void notifyNerrvana(String message, int level) {\n" +
    "\t\tif (selenium==null) return;\n" +
    "\n" +
    "\t\tString sysmsg = String.format(\"SYS_NOTE@%d@%s\", level, message);\n" +
    "\t\ttry {\n" +
    "\t\t\tselenium.setContext(sysmsg);\n" +
    "\t\t} catch (Exception e) {\n" +
    "\t\t\tSystem.out.println(\"Problems when trying to notify Nerrvana, exception message is: \" + e.toString());\n" +
    "\t\t}\n" +
    "\t}\n" +
    "\n" +
    "\tpublic void logMessage(String msg, int level) {\n" +
    "\t\tSystem.out.println(msg);\n" +
    "\t\tnotifyNerrvana(msg, level);\n" +
    "\t}\n" +
    "\n" +
    "\tpublic void verifyTrue(boolean b, String expression) {\n" +
    "\t\tif (!b) logMessage(\"WARN - expression is false: \" + expression, 4);\n" +
    "\t}\n" +
    "\n" +
    "\tpublic void verifyFalse(boolean b, String expression) {\n" +
    "\t\tif (b) logMessage(\"WARN - expression is true: \" + expression, 4);\n" +
    "\t}\n" +
    "\n" +
    "\tpublic void writeScreenshotFromString(String screen, String filename) {\n" +
    "\t\tif (screen == null) return;\n" +
    "\t\tOutputStream out;\n" +
    "\t\tBase64 decoder = new Base64();\n" +
    "\t\ttry {\n" +
    "\t\t\tout = new FileOutputStream(filename);\n" +
    "\t\t\tout.write(decoder.decodeBase64(screen));\n" +
    "\t\t\tout.close();\n" +
    "\t\t\tSystem.out.println(\"Screenshot from string saved, filename = \" + filename);\n" +
    "\t\t} catch (Exception E) {\n" +
    "\t\t\tlogMessage(\"Problems when saving screenshot from string, filename=\" + filename +\". Exception: \" + E.toString(), 3);\n" +
    "\t\t}\n" +
    "\t}\n" +
    "\n" +
    "\tpublic void saveScreenshotToString(String filename) {\n" +
    "\t\tif (selenium==null) return;\n" +
    "\t\tString screen = \"\";\n" +
    "\t\ttry {\n" +
    "\t\t\tscreen = selenium.captureScreenshotToString();\n" +
    "\t\t} catch (Exception E) {\n" +
    "\t\t\tlogMessage(\"Problems when getting usual screenshot string from Selenium. Exception: \" + E.toString(), 3);\n" +
    "\t\t}\n" +
    "\t\twriteScreenshotFromString(screen, filename);\n" +
    "\t}\n" +
    "\n" +
    "	@Rule\n" +
    "\tpublic TestRule watchman = new TestWatcher() {\n" +
    "\t\t// Selenium start and stop calls moved to watchman to\n" +
    "\t\t// provide access to selenium object in succeeded() and failed() handlers to do screenshots and notify Nerrvana\n" +
    "\t\t@Override\n" +
    "\t\tpublic void finished(Description desc) {\n" +
    "\t\t\tselenium.stop();\n" +
    "\t\t}\n" +
    "\n" +
    "\t\t@Override\n" +
    "\t\tpublic void starting(Description desc) {\n" +
    "\t\t\tselenium = new DefaultSelenium(\"localhost\", 4444, \"*firefox\", baseUrl);\n" +
    "\t\t\tselenium.start();\n" +
    "\t\t\tselenium.windowMaximize();\n" +
    "\t\t}\n" +
    "\n" +
    "\t\t@Override\n" +
    "\t\tprotected void succeeded(Description desc) {\n" +
    "\t\t\tlogMessage(\"OK - \" + desc, 2);\n" +
    "\t\t}\n" +
    "\n" +
    "\t\t@Override\n" +
    "\t\tpublic void failed(Throwable e, Description desc) {\n" +
    "\t\t\tString msg = \"ERROR - \" + e.getClass().getSimpleName() + \" at \" + desc;\n" +
    "\t\t\tif (e.getMessage()!=null) {\n" +
    "\t\t\t\tmsg+=\" (\" + e.getMessage() + \") \";\n" +
    "\t\t\t}\n" +
    "\t\t\tlogMessage(msg, 6);\n" +
    "\t\t\tsaveScreenshotToString(\"error_\"+System.currentTimeMillis()+\".png\");\n" +
    "\t\t}\n" +
    "\t};\n" +
	"}\n";

this.configForm =
	'<description>Variable for Selenium instance</description>' +
	'<textbox id="options_receiver" />' +
	'<description>Environment</description>' +
	'<textbox id="options_environment" />' +
	'<description>Package</description>' +
	'<textbox id="options_packageName" />' +
	'<description>Use own Selenium Instanse for each test in case (yes/no)</description>' +
	'<textbox id="options_own_selenium" />';