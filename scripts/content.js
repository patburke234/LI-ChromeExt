//alert("I am on a profile page");

//global imports (avoid these)

/////////////// * ---- GLOBAL VARIABLES ---- * /////////////////
var url = "";

function shouldFetchData() {
  const lastRefresh = parseInt(
    localStorage.getItem("loop:lastDataRefresh") || "-1"
  );
  if (lastRefresh === -1) return true;

  const dateOfLastRefresh = new Date(lastRefresh);
  const currentDate = new Date();
  const diff = currentDate - dateOfLastRefresh;
  const diffInDays = diff / (1000 * 60 * 60 * 24);
  return diffInDays > 7; //only refresh every 7 days
}

async function getBase64ImageFromUrl(imageUrl) {
  var res = await fetch(imageUrl);
  var blob = await res.blob();

  return new Promise((resolve, reject) => {
    var reader = new FileReader();
    reader.addEventListener(
      "load",
      function () {
        resolve(reader.result);
      },
      false
    );

    reader.onerror = () => {
      return reject(this);
    };
    reader.readAsDataURL(blob);
  });
}

function getImageUrl(pictureObj) {
  return getBase64ImageFromUrl(
    pictureObj?.rootUrl +
      pictureObj?.artifacts[3]?.fileIdentifyingUrlPathSegment
  );
}

///////////// * GLOBAL VARIABLES ENDS HERES * /////////////////
async function getCsrfToken() {
  const htmlResp = await fetch(
    "https://www.linkedin.com/tscp-serving/dtag?sz=300x250&ti=1&p=1&c=1&z=profile&pk=d_flagship3_profile_view_base&pz=BR"
  );
  const html = await htmlResp.text();
  // Define a regular expression to match the csrfToken value
  const regex = /csrfToken=([^"]+)/;

  // Use the RegExp.exec method to find the match
  const match = regex.exec(html);

  console.log(match[1]);
  let csrfToken = match[1].split("&quot")[0];
  csrfToken = csrfToken.split('"')[0];
  csrfToken = csrfToken.replace("%3A", ":");
  return csrfToken;
}
async function getConnections(csrfToken) {
  let hasConnections = true;
  let start = 0;
  let connections = [];
  let take = 100;
  do {
    console.log(`connections: ${connections.length}, start: ${start}`);
    const batch = await fetch(
      `https://www.linkedin.com/voyager/api/relationships/dash/connections?decorationId=com.linkedin.voyager.dash.deco.web.mynetwork.ConnectionListWithProfile-16&count=${take}&q=search&sortType=RECENTLY_ADDED&start=${start}`,
      {
        headers: {
          accept: "application/vnd.linkedin.normalized+json+2.1",
          "accept-language": "en-US,en;q=0.9",
          "csrf-token": csrfToken,
          priority: "u=1, i",
          "sec-ch-ua":
            '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "x-li-lang": "en_US",
          "x-li-page-instance":
            "urn:li:page:d_flagship3_people_connections;/OwXqUWtR9u8Y8LbMc5jEg==",
          "x-li-track":
            '{"clientVersion":"1.13.17599","mpVersion":"1.13.17599","osName":"web","timezoneOffset":-7,"timezone":"America/Los_Angeles","deviceFormFactor":"DESKTOP","mpName":"voyager-web","displayDensity":1.5,"displayWidth":2496,"displayHeight":1665}',
          "x-restli-protocol-version": "2.0.0",
        },
        referrer:
          "https://www.linkedin.com/mynetwork/invite-connect/connections/",
        referrerPolicy: "strict-origin-when-cross-origin",
        body: null,
        method: "GET",
        mode: "cors",
        credentials: "include",
      }
    ).then((res) => res.json());

    const { included } = batch;
    const profiles = included.filter(
      (item) =>
        item.$type === "com.linkedin.voyager.dash.identity.profile.Profile"
    );
    console.log(profiles);
    connections.push(
      ...profiles.map((conn) => ({
        lastName: conn.lastName,
        firstName: conn.firstName,
        publicIdentifier: conn.publicIdentifier,
      }))
    );
    if (profiles.length > 0) {
      hasConnections = true;
      start += take;
    } else hasConnections = false;
  } while (hasConnections);
  return connections;
}
async function getProfile(csrfToken) {
  const profileInfo = await fetch(`https://www.linkedin.com/voyager/api/me`, {
    headers: {
      accept: "application/vnd.linkedin.normalized+json+2.1",
      "accept-language": "en-US,en;q=0.9",
      "csrf-token": csrfToken,
      priority: "u=1, i",
      "sec-ch-ua":
        '"Google Chrome";v="125", "Chromium";v="125", "Not.A/Brand";v="24"',
      "sec-ch-ua-mobile": "?0",
      "sec-ch-ua-platform": '"Windows"',
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "same-origin",
      "x-li-lang": "en_US",
      "x-li-page-instance":
        "urn:li:page:d_flagship3_people_connections;/OwXqUWtR9u8Y8LbMc5jEg==",
      "x-li-track":
        '{"clientVersion":"1.13.17599","mpVersion":"1.13.17599","osName":"web","timezoneOffset":-7,"timezone":"America/Los_Angeles","deviceFormFactor":"DESKTOP","mpName":"voyager-web","displayDensity":1.5,"displayWidth":2496,"displayHeight":1665}',
      "x-restli-protocol-version": "2.0.0",
    },
    referrer: "https://www.linkedin.com/mynetwork/invite-connect/connections/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
    credentials: "include",
  }).then((res) => res.json());

  return {
    firstName: profileInfo.included[0]?.firstName,
    lastName: profileInfo.included[0]?.lastName,
    occupation: profileInfo.included[0]?.occupation,
    publicIdentifier: profileInfo.included[0]?.publicIdentifier,
    picture: await getImageUrl(profileInfo.included[0]?.picture),
  };
}
// Create the button element
const button = document.createElement("button");
button.id = "openBtn";

const iconImg = document.createElement("img");
iconImg.src = chrome.runtime.getURL("loop-stacked.png");
iconImg.id = "openBtnIcon";
button.appendChild(iconImg);

// Add a click event listener to the button
button.addEventListener("click", () => {
  // Send a message to the popup.js script
  chrome.runtime.sendMessage({
    action: "toggleLoopPanel",
    profileData: localStorage.getItem("loop:data"),
  });
});

// Inject the button into the webpage
document.body.appendChild(button);

// Self-invocation async function
(async () => {
  if (shouldFetchData()) {
    const csrfToken = await getCsrfToken();
    const basicProfile = await getProfile(csrfToken);
    const connections = await getConnections(csrfToken);
    var data = {
      basicProfile,
      connections,
    };
    var stringData = JSON.stringify(data);
    localStorage.setItem("loop:lastDataRefresh", Date.now());
    localStorage.setItem("loop:data", stringData);

    // Send a message to the popup.js script
    chrome.runtime.sendMessage({
      action: "newData",
      profileData: stringData,
    });
  } else {
    console.log("Data is up to date");
  }
})().catch((err) => {
  console.error(err);
  throw err;
});
