// Gege query 

function $id(id) { return document.getElementById(id); }
function $(selector) { return document.querySelector(selector) };
function $$(selector) { return document.querySelectorAll(selector) };
function lget(item) { return localStorage.getItem(item) };
function lset(item, value) { localStorage.setItem(item, value) }

const msgPopup = $id("message-popup");
const msgText = $id("message-text");
const form = $id("add-form");
const text = $id("new-text");
const svg = $id("svg");
var canClick = true;
let canSpin = true;
let removeMode = false;

var OrigSectors = ["G", "A♭", "A", "B♭", "B", "C", "D♭", "D", "E♭", "E", "F", "F#"]
var origTemplates = {
  default: ["choice 1", "choice 2", "choice 3"],
  coin: ["heads", "tails"],
  "musical scales": ["G", "A♭", "A", "B♭", "B", "C", "D♭", "D", "E♭", "E", "F", "F#"],
}

var templateName = lget("template");
if (templateName == null) {
  templateName = "default"
}
let saved = lget("saved");
let current = lget("current");

if (saved == null) {
  saved = origTemplates;
} else {
  try {
    saved = JSON.parse(saved);
  } catch {
    saved = origTemplates;
    templateName = "default";
  }
}
if(current == null) {
  current = saved;
}else {
  try {
    current = JSON.parse(current);
  } catch {
    current = saved;
  }
}
$id("template-name").innerHTML = templateName;

var sectors = lget("sectors");
if (sectors == null) {
  sectors = saved["default"];
} else {
  try {
    sectors = JSON.parse(sectors);
  } catch {
    templateName = "default";
    sectors = saved["default"];
  }

}

function changeCurrent(key, value){
  current[key] = value;
  lset("current", JSON.stringify(current));
}

// var sectors;
// var templates = lget("templates");
// if(templates == null){
//   templates = origTemplates;
// }
// if(templateName == null) {
//   sectors = lget("butts");
//   if(sectors == null){
//     lset("butts", JSON.stringify(OrigSectors));
//     sectors = OrigSectors;
//   }else {
//     sectors = JSON.parse(sectors);
//   }
// }
// else {
//   sectors = templates[templateName];
// }


function setTemplates() {
  sectors = current[templateName];
  renderSectors();
  $id("template-name").innerHTML = templateName;
  lset("template", templateName);
  lset("current", JSON.stringify(current));
  $(".templates").innerHTML = "";
  for (const key in current) {
    $(".templates").innerHTML += `<div class="template" id="${key}"><button class="template-x" ${key == "default" ? "disabled" : ""} temp = "${key}">x</button><span class="template-name">${capitalizeWords(key)} Template</span></div>`
  }
  $$(".template").forEach(template => {
    template.addEventListener("click", (e) => {

      e.preventDefault();
      $id("sideMenu").style.width = '0px';
      $id("overlay").style.display = 'none';
      if (canClick) {
        lset("template", template.id);
        $id("template-name").innerHTML = template.id;
        templateName = template.id;
        sectors = current[template.id];
        renderSectors();
      }
    })
  })
  $$(".template-x").forEach(templateX => {
    templateX.addEventListener("click", (e) => {
      e.preventDefault();
      const temp = templateX.getAttribute("temp");
      if(temp != "default" && temp == templateName){
        msgPopup.style.display = "flex";
        msgText.innerText = "Deleted";
        setTimeout(() => msgPopup.style.display = "none", 2000);
        templateName = "default";
      }
      templateX.parentElement.remove();
      delete saved[temp];
      delete current[temp];
      lset("saved", JSON.stringify(saved));
      lset("current", JSON.stringify(current));
        setTemplates();      
      e.stopPropagation();

    });
  })
}
function hslToRgb(h, s, l) {
  let r, g, b;

  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;

    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }

  return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

function rgbToHex(r, g, b) {
  return "#" + [r, g, b].map(x => {
    const hex = x.toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  }).join('');
}
function genColors(n) {
  if (n == 1) {
    return ["#fcba03"]
  } else {
    const colors = [];
    for (let i = 0; i < n; i++) {
      const hue = Math.floor((i / n) * 360);
      const rgb = hslToRgb(hue / 360, 1, 0.4);
      const hex = rgbToHex(...rgb);
      colors.push(hex);
    }
    return colors;
  }


}
function renderSectors() {
  lset("sectors", JSON.stringify(sectors));
  let startAngle = 0;
  let angle = 360 / sectors.length;
  svg.innerHTML = "";
  let colors = genColors(sectors.length);
  let maxLength;
  if(sectors.length >= 44){
    maxLength = 1;
  }else {
    maxLength = Math.ceil((44 - sectors.length) / 10);
  }  
  for (let index = 0; index < sectors.length; index++) {
    let sectorText = sectors[index];
    
    createSector(startAngle, startAngle + angle, sectorText, colors[index], index, maxLength);
    startAngle += angle;
  }
}
renderSectors();

form.addEventListener("submit", (e) => {
  e.preventDefault();
  sectors.push(text.value);
  
  if (sectors.length === 1) {
    svg.innerHTML = '<text x="120" y="200" class="placeholder">Pick Another Option</text>';
  } else {
    canClick = true;
    canSpin = true;
    changeCurrent(templateName, sectors);
    renderSectors();
  }


})
function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
  var angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;

  return {
    x: centerX + (radius * Math.cos(angleInRadians)),
    y: centerY + (radius * Math.sin(angleInRadians))
  };
}

function createSector(start_angle, end_angle, id, color, order, maxLength) {
  maxLength++;
  if(id.length > maxLength){
    id = id.substring(0, maxLength);
    id = id.trim();
    id += "...";
  }

  
  const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');
  path.id = id;
  path.classList.add("sector");
  path.setAttribute("fill", color);
  path.setAttribute("stroke", "black");
  path.setAttribute("fill-rule", "evenodd");
  var opts = {
    cx: 200,
    cy: 200,
    radius: 200,
    start_angle,
    end_angle
  };
  if (end_angle - start_angle === 360) {
    // Handle full circle case
    var d = [
      "M", opts.cx, opts.cy,
      "m", -opts.radius, 0,
      "a", opts.radius, opts.radius, 0, 1, 0, opts.radius * 2, 0,
      "a", opts.radius, opts.radius, 0, 1, 0, -opts.radius * 2, 0,
      "Z"
    ].join(" ");
  } else {
    var start = polarToCartesian(opts.cx, opts.cy, opts.radius, opts.end_angle),
      end = polarToCartesian(opts.cx, opts.cy, opts.radius, opts.start_angle),
      largeArcFlag = opts.end_angle - opts.start_angle <= 180 ? "0" : "1";
    var d = [
      "M", start.x, start.y,
      "A", opts.radius, opts.radius, 0, largeArcFlag, 0, end.x, end.y,
      "L", opts.cx, opts.cy,
      "Z"
    ].join(" ");
  }


  path.setAttribute("d", d);

  path.addEventListener("click", () => {
    if (removeMode) {
      msgText.innerText = "Removed Element";
      sectors.splice(order, 1);
      changeCurrent(templateName, sectors);
      renderSectors();
    }
  })
  svg.appendChild(path);

  // svg text

  const sectorSize = end_angle-start_angle;
  const fontSize = Math.min(opts.radius / 5, sectorSize / 3);

  
  const svgText = document.createElementNS("http://www.w3.org/2000/svg", 'text');
  const { x, y } = polarToCartesian(200, 200, 150, (order + 0.5) * (360 / sectors.length));

  
  // trim text
  // 1 character: 44
  // 2 character: 34
  // 3 character: 25
  svgText.setAttribute("x", x);
  svgText.setAttribute("y", y);
  svgText.setAttribute("text-anchor", "middle");
  svgText.setAttribute("dominant-baseline", "middle");
  svgText.classList.add("sector-label");
  svgText.setAttribute("font-size", `${fontSize}px`);
  svgText.innerHTML = id;

  svg.append(svgText);
}
svg.addEventListener("click", (e) => {
  if (!removeMode && canClick === true && canSpin) {
    canClick = false;
    let degrees = 0;
    svg.style.transform = `rotate(${degrees}deg)`;
    let level1 = Math.round(Math.random() * 500) * 2;
    let level2 = Math.round(Math.random() * 200)
    let level3 = Math.round(Math.random() * 50);
    const totalDegrees = level1 * 2 + level2 + level3 * 0.5;
    const index = Math.floor((totalDegrees % 360) / (360 / sectors.length));
    const choiceIndex = sectors.length - 1 - index
    const choice = sectors[choiceIndex];
    const interval1 = setInterval(() => {
      degrees += 2;
      level1--;
      svg.style.transform = `rotate(${degrees}deg)`;
      if (level1 === 0) {
        clearInterval(interval1);
        const interval2 = setInterval(() => {
          degrees += 1;
          level2--;
          svg.style.transform = `rotate(${degrees}deg)`;
          if (level2 === 0) {
            clearInterval(interval2);
            const interval3 = setInterval(() => {
              degrees += 0.5;
              svg.style.transform = `rotate(${degrees}deg)`;
              level3--;
              if (level3 === 0) {
                setTimeout(() => {
                  const modal = $(".modal");
                  modal.style.display = "block";
                  $id("the-choice").innerHTML = choice;

                  $id("remove").onclick = () => {
                    modal.style.display = "none";
                    sectors.splice(choiceIndex, 1);
                    if (sectors.length <= 1) {
                      canSpin = false;
                      //canClick = false;
                    }
                    renderSectors();

                  };
                  $id("dont-remove").onclick = () => modal.style.display = "none";
                  canClick = true;
                }, 1000)
                clearInterval(interval3);
              }
            }, 1)
          }
        }, 1)
      }
    }, 1)




  }

})

$id("reset").addEventListener("click", () => {
  if (canClick && !removeMode) {
    msgPopup.style.display = "flex";
    msgText.innerText = "Resetted";
    setTimeout(() => msgPopup.style.display = "none", 2000);
    sectors = saved[templateName];
    changeCurrent(templateName, sectors);
    renderSectors();
  }
})



// Menu
var menu = $id("sideMenu");

$id("menu-button").onclick = function() {
  openSideMenu();
};

$id("menu-x").onclick = function() {
  closeSideMenu();
};
$id("overlay").onclick = function() {
    closeSideMenu();
  };
function capitalizeWords(string) {
  return string.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}
let open = false;
function openSideMenu() {
  open = true;  
  $id("sideMenu").style.width =  Math.min(500, window.innerWidth) + "px";
  $id("overlay").style.display = 'block';
}
window.addEventListener("resize", () => {
  if(open) $id("sideMenu").style.width =  Math.min(500, window.innerWidth) + "px";
})
function closeSideMenu() {
  open = false;
  $id("sideMenu").style.width = '0px';
  $id("overlay").style.display = 'none';
}




setTemplates();
$id("update-spinner").addEventListener("click", () => {
  if (canClick && !removeMode) {
    saved[templateName] = sectors;
    lset("saved", JSON.stringify(saved));
    msgPopup.style.display = "flex";
    msgText.innerText = "Updated";
    setTimeout(() => msgPopup.style.display = "none", 2000);
  }
})
$id("delete-spinner").addEventListener("click", () => {
  if (canClick && !removeMode) {
    if (templateName == "default") {
      msgPopup.style.display = "flex";
      msgText.innerText = "Cannot delete default";
      setTimeout(() => msgPopup.style.display = "none", 2000);
    } else {
      msgPopup.style.display = "flex";
      msgText.innerText = "Deleted";
      setTimeout(() => msgPopup.style.display = "none", 2000);
      delete current[templateName];
      delete saved[templateName];
      lset("saved", JSON.stringify(saved));
      templateName = "default";
      setTemplates();
    }
  }
});
$id("save-form").addEventListener("submit", e => {
  e.preventDefault();
  if (canClick && !removeMode) {
    msgPopup.style.display = "flex";
    msgText.innerText = "Saved as new spinner";
    setTimeout(() => msgPopup.style.display = "none", 2000);
    templateName = $id("save-name").value;
    console.log("SAVE FORM CHANGING...")
    saved[templateName] = sectors
    current[templateName] = sectors;
    lset("saved", JSON.stringify(saved));
    setTemplates();
  }
})


const removeButton = $id("removal");
removeButton.addEventListener("click", () => {
  if (canClick) {
    if (removeMode) {
      document.querySelectorAll("button").forEach(button => button.disabled = false);
      msgPopup.style.display = "none";
      removeButton.innerHTML = "Remove Elements";
      removeButton.classList.remove("remove-mode");
    } else {
      document.querySelectorAll("button").forEach(button => button.disabled = true);
      removeButton.disabled = false;
      msgPopup.style.display = "flex";
      msgText.innerText = "Removing elements..."
      removeButton.innerHTML = "Stop removing";
      removeButton.classList.add("remove-mode");
    }
    removeMode = !removeMode;
  }

})