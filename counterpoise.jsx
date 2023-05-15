(function() {
  var scriptName = ".counterpoise";
  var dockedPanel = this;

  dockedPanel.scriptPanel = dockedPanel instanceof Panel ? dockedPanel : new Window("palette", scriptName, undefined, {resizeable: true});
  dockedPanel.scriptPanel.orientation = "column";
  dockedPanel.scriptPanel.alignChildren = "center";

  var panelTitle = dockedPanel.scriptPanel.add("statictext", undefined, scriptName);
  panelTitle.alignment = "center";
  panelTitle.alignment = "fill";
  panelTitle.text = scriptName;
  panelTitle.graphics.font = ScriptUI.newFont("Arial", "Bold", 20);

  //position selectors
  var positionSection = dockedPanel.scriptPanel.add("panel", undefined, "Position");
  positionSection.alignChildren = "left";

  var positionMoveAmountRow = positionSection.add("group");
  positionMoveAmountRow.orientation = "row";
  positionMoveAmountRow.add("statictext", undefined, "Move Amount (pixels):");
  var positionMoveAmountInput = positionMoveAmountRow.add("edittext", undefined, "400");
  positionMoveAmountInput.characters = 6;

  var positionCheckboxGroup = positionSection.add("group");
  positionCheckboxGroup.orientation = "row";
  positionCheckboxGroup.add("checkbox", undefined, "Add Keyframes at Start");
  positionCheckboxGroup.add("checkbox", undefined, "Add Keyframes at End");

  var positionButtonsRow = positionSection.add("group");
  positionButtonsRow.orientation = "row";
  positionButtonsRow.alignChildren = "center";

  var leftToRightButton = positionButtonsRow.add("button", undefined, "Left to Right");
  leftToRightButton.onClick = function() {
    addKeyframesWithEasing("Position", [-parseFloat(positionMoveAmountInput.text), 0]);
  };

  var rightToLeftButton = positionButtonsRow.add("button", undefined, "Right to Left");
  rightToLeftButton.onClick = function() {
    addKeyframesWithEasing("Position", [parseFloat(positionMoveAmountInput.text), 0]);
  };

  var topToBottomButton = positionButtonsRow.add("button", undefined, "Top to Bottom");
  topToBottomButton.onClick = function() {
    addKeyframesWithEasing("Position", [0, parseFloat(positionMoveAmountInput.text)]);
  };

  var bottomToTopButton = positionButtonsRow.add("button", undefined, "Bottom to Top");
  bottomToTopButton.onClick = function() {
    addKeyframesWithEasing("Position", [0, -parseFloat(positionMoveAmountInput.text)]);
  };

  // rotation selectors
  var rotationSection = dockedPanel.scriptPanel.add("panel", undefined, "Rotation");
  rotationSection.alignChildren = "left";

  var rotationMoveAmountRow = rotationSection.add("group");
  rotationMoveAmountRow.orientation = "row";
  rotationMoveAmountRow.add("statictext", undefined, "Rotate Amount (degrees):");
  var rotationMoveAmountInput = rotationMoveAmountRow.add("edittext", undefined, "90");
  rotationMoveAmountInput.characters = 6;

  var rotationButtonsRow = rotationSection.add("group");
  rotationButtonsRow.orientation = "row";
  rotationButtonsRow.alignChildren = "center";

  var rotateClockwiseButton = rotationButtonsRow.add("button", undefined, "Rotate Clockwise");
  rotateClockwiseButton.onClick = function() {
    addKeyframesWithEasing("Rotation", -parseFloat(rotationMoveAmountInput.text));
  };

  var rotateCounterClockwiseButton = rotationButtonsRow.add("button", undefined, "Rotate Counter-Clockwise");
  rotateCounterClockwiseButton.onClick = function() {
    addKeyframesWithEasing("Rotation", parseFloat(rotationMoveAmountInput.text));
  };

  // add keyframes
  function addKeyframesWithEasing(propertyType, offset) {
    if (app.project.activeItem instanceof CompItem && app.project.activeItem.selectedLayers.length > 0) {
      app.beginUndoGroup("Add Keyframes with Easing");

      var selectedLayer = app.project.activeItem.selectedLayers[0];
      var currentTime = app.project.activeItem.time;
      
      if (positionCheckboxGroup.children[0].value) {  // add keyframes at start
        var selectedLayerInPoint = selectedLayer.inPoint;

        var keyframeBeforeTime = selectedLayerInPoint - 20 / app.project.activeItem.frameRate;
        var keyframeAfterTime = selectedLayerInPoint + 20 / app.project.activeItem.frameRate;

        var property = selectedLayer.property(propertyType);
        var keyframeBefore = property.addKey(keyframeBeforeTime);
        var keyframeAfter = property.addKey(keyframeAfterTime);

        var startValue = property.valueAtTime(currentTime, true);
        var modifiedValue = startValue + offset;
        property.setValueAtTime(keyframeBeforeTime, modifiedValue);
        property.setValueAtTime(keyframeAfterTime, startValue);

        var easeIn = new KeyframeEase(0.5, 90);
        var easeOut = new KeyframeEase(0.5, 90);
        property.setTemporalEaseAtKey(keyframeBefore, [easeIn], [easeOut]);
        property.setTemporalEaseAtKey(keyframeAfter, [easeIn], [easeOut]);

        property.setSelectedAtKey(keyframeBefore, true);
        property.setSelectedAtKey(keyframeAfter, true);
      }

      if (positionCheckboxGroup.children[1].value) {  // add keyframes at end
        var layerOutPoint = selectedLayer.outPoint;

        var endKeyframeBeforeTime = layerOutPoint - 20 / app.project.activeItem.frameRate;
        var endKeyframeAfterTime = layerOutPoint + 20 / app.project.activeItem.frameRate;

        var property = selectedLayer.property(propertyType);
        var endKeyframeBefore = property.addKey(endKeyframeBeforeTime);
        var endKeyframeAfter = property.addKey(endKeyframeAfterTime);

        var startValue = property.valueAtTime(currentTime, true);
        var modifiedValue = startValue + offset;
        property.setValueAtTime(endKeyframeBeforeTime, startValue);
        property.setValueAtTime(endKeyframeAfterTime, modifiedValue);

        var easeIn = new KeyframeEase(0.5, 90);
        var easeOut = new KeyframeEase(0.5, 90);
        property.setTemporalEaseAtKey(endKeyframeBefore, [easeIn], [easeOut]);
        property.setTemporalEaseAtKey(endKeyframeAfter, [easeIn], [easeOut]);

        property.setSelectedAtKey(endKeyframeBefore, true);
        property.setSelectedAtKey(endKeyframeAfter, true);
      }

      if (!positionCheckboxGroup.children[0].value && !positionCheckboxGroup.children[1].value) {  // add keyframes at current time
        var keyframeBeforeTime = currentTime - 20 / app.project.activeItem.frameRate;
        var keyframeAfterTime = currentTime + 20 / app.project.activeItem.frameRate;

        var property = selectedLayer.property(propertyType);
        var keyframeBefore = property.addKey(keyframeBeforeTime);
        var keyframeAfter = property.addKey(keyframeAfterTime);

        var startValue = property.valueAtTime(currentTime, true);
        var modifiedValue = startValue + offset;
        property.setValueAtTime(keyframeBeforeTime, modifiedValue);
        property.setValueAtTime(keyframeAfterTime, startValue);

        var easeIn = new KeyframeEase(0.5, 90);
        var easeOut = new KeyframeEase(0.5, 90);
        property.setTemporalEaseAtKey(keyframeBefore, [easeIn], [easeOut]);
        property.setTemporalEaseAtKey(keyframeAfter, [easeIn], [easeOut]);

        property.setSelectedAtKey(keyframeBefore, true);
        property.setSelectedAtKey(keyframeAfter, true);
      }

      app.endUndoGroup();
    }
  }

  dockedPanel.scriptPanel.layout.layout(true);
  dockedPanel.scriptPanel.layout.resize();

  if (dockedPanel.scriptPanel instanceof Window) {
    dockedPanel.scriptPanel.show();
  }
})();
