#target photoshop

(function () {
  var SOURCE_ROOT = new Folder("C:/Users/Administrator/Desktop/场景图");
  var OUTPUT_ROOT = new Folder("D:/Documents/newMySiteV2/.catalog-optimized");
  var SUMMARY_FILE = new File(OUTPUT_ROOT.fsName + "/optimization-summary.json");
  var EXPECTED_COUNT = 404;
  var MAX_EDGE = 2560;
  var JPEG_QUALITY = 10; // Photoshop's 0-12 scale; approximately quality 82.

  function fail(message) {
    throw new Error(message);
  }

  function removeTree(folder) {
    if (!folder.exists) return;
    var children = folder.getFiles();
    for (var i = 0; i < children.length; i += 1) {
      if (children[i] instanceof Folder) removeTree(children[i]);
      else if (!children[i].remove()) fail("Could not remove " + children[i].fsName);
    }
    if (!folder.remove()) fail("Could not remove " + folder.fsName);
  }

  function ensureFolder(folder) {
    if (folder.exists) return;
    if (folder.parent && !folder.parent.exists) ensureFolder(folder.parent);
    if (!folder.create()) fail("Could not create " + folder.fsName);
  }

  function numberedFolders(folder) {
    var items = folder.getFiles(function (entry) {
      return entry instanceof Folder && /^\d+\./.test(entry.name) && entry.name.toLowerCase() !== "output";
    });
    items.sort(function (a, b) {
      return parseInt(a.name, 10) - parseInt(b.name, 10);
    });
    return items;
  }

  function pngFiles(folder) {
    var items = folder.getFiles(function (entry) {
      return entry instanceof File && /\.png$/i.test(entry.name);
    });
    items.sort(function (a, b) { return a.name < b.name ? -1 : a.name > b.name ? 1 : 0; });
    return items;
  }

  function whiteFlatten(document) {
    var white = new SolidColor();
    white.rgb.red = 255;
    white.rgb.green = 255;
    white.rgb.blue = 255;
    var previousBackground = app.backgroundColor;
    app.backgroundColor = white;
    try {
      document.flatten();
    } finally {
      app.backgroundColor = previousBackground;
    }
  }

  function optimize(sourceFile, destinationFile) {
    var document = app.open(sourceFile);
    try {
      try {
        document.convertProfile("sRGB IEC61966-2.1", Intent.RELATIVECOLORIMETRIC, true, false);
      } catch (profileError) {
        // Continue when a source document is already effectively sRGB or has no profile.
      }

      whiteFlatten(document);

      var width = document.width.as("px");
      var height = document.height.as("px");
      var longest = Math.max(width, height);
      if (longest > MAX_EDGE) {
        var scale = MAX_EDGE / longest;
        document.resizeImage(
          UnitValue(Math.round(width * scale), "px"),
          UnitValue(Math.round(height * scale), "px"),
          null,
          ResampleMethod.BICUBICSHARPER
        );
      }

      var options = new JPEGSaveOptions();
      options.embedColorProfile = true;
      options.formatOptions = FormatOptions.PROGRESSIVE;
      options.scans = 3;
      options.matte = MatteType.WHITE;
      options.quality = JPEG_QUALITY;
      document.saveAs(destinationFile, options, true, Extension.LOWERCASE);
    } finally {
      document.close(SaveOptions.DONOTSAVECHANGES);
    }
  }

  if (!SOURCE_ROOT.exists) fail("Source folder was not found: " + SOURCE_ROOT.fsName);
  if (OUTPUT_ROOT.fsName.indexOf("newMySiteV2") === -1 || OUTPUT_ROOT.name !== ".catalog-optimized") {
    fail("Refusing to clean an unexpected output folder.");
  }

  removeTree(OUTPUT_ROOT);
  ensureFolder(OUTPUT_ROOT);

  var processed = 0;
  var failures = [];
  var seriesFolders = numberedFolders(SOURCE_ROOT);
  for (var s = 0; s < seriesFolders.length; s += 1) {
    var typeFolders = numberedFolders(seriesFolders[s]);
    for (var t = 0; t < typeFolders.length; t += 1) {
      var files = pngFiles(typeFolders[t]);
      if (files.length === 0) continue;

      var destinationFolder = new Folder(
        OUTPUT_ROOT.fsName + "/" + seriesFolders[s].name + "/" + typeFolders[t].name
      );
      ensureFolder(destinationFolder);

      for (var f = 0; f < files.length; f += 1) {
        var outputName = files[f].name.replace(/\.png$/i, ".jpg");
        var destinationFile = new File(destinationFolder.fsName + "/" + outputName);
        try {
          optimize(files[f], destinationFile);
          processed += 1;
        } catch (error) {
          failures.push(files[f].fsName + ": " + error.message);
        }
      }
    }
  }

  SUMMARY_FILE.encoding = "UTF8";
  SUMMARY_FILE.open("w");
  var firstFailure = failures.length ? failures[0].replace(/\\/g, "\\\\").replace(/"/g, '\\"') : "";
  SUMMARY_FILE.write(
    '{"processed":' + processed + ',"expected":' + EXPECTED_COUNT + ',"failures":' + failures.length + ',"firstFailure":"' + firstFailure + '"}'
  );
  SUMMARY_FILE.close();

  if (processed !== EXPECTED_COUNT || failures.length > 0) {
    fail("Processed " + processed + " of " + EXPECTED_COUNT + " images.\n" + failures.join("\n"));
  }

})();
