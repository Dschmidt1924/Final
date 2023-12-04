function createElemWithText(
  HTMLelement = "p",
  textContent = "",
  className = ""
) {
  var elem = document.createElement(HTMLelement);
  elem.innerText = textContent;
  elem.className = className;
  return elem;
}

function createSelectOptions(users) {
  if (!users) {
    return undefined;
  }

  const options = [];

  for (const user of users) {
    const option = document.createElement("option");
    option.value = user.id;
    option.textContent = user.name;
    options.push(option);
  }

  return options;
}

function toggleCommentSection(postId) {
  if (!postId) {
    return undefined;
  }

  let section = document.querySelector(`section[data-post-id="${postId}"]`);
  if (section) {
    section.classList.toggle("hide");
  }
  return section;
}

function deleteChildElements(parentElement) {
  if (!(parentElement instanceof HTMLElement)) {
    return undefined;
  }

  let child = parentElement.lastElementChild;
  while (child) {
    parentElement.removeChild(child);
    child = parentElement.lastElementChild;
  }
  return parentElement;
}

function toggleCommentButton(postID) {
  if (!postID) {
    return;
  }

  const btnSelectedEl = document.querySelector(
    `button[data-post-id="${postID}"]`
  );

  if (btnSelectedEl != null) {
    btnSelectedEl.textContent === "Show Comments"
      ? (btnSelectedEl.textContent = "Hide Comments")
      : (btnSelectedEl.textContent = "Show Comments");
  }

  return btnSelectedEl;
}

function addButtonListeners() {
  const buttons = document.querySelectorAll("main button");

  if (buttons.length) {
    for (const button of buttons) {
      const postId = button.dataset.postId;

      button.addEventListener("click", (event) => {
        toggleComments(event, postId);
      });
    }
  }

  return buttons;
}

function removeButtonListeners() {
  const buttons = document.querySelectorAll("main button");

  for (const button of buttons) {
    button.removeEventListener("click", toggleComments);
  }

  return buttons;
}

function createComments(comments) {
  if (!comments) {
    return undefined;
  }

  let fragment = document.createDocumentFragment();

  comments.forEach((comment) => {
    let article = document.createElement("article");

    let nameElement = document.createElement("h3");
    nameElement.textContent = comment.name;
    article.appendChild(nameElement);

    let bodyElement = document.createElement("p");
    bodyElement.textContent = comment.body;
    article.appendChild(bodyElement);

    let emailElement = document.createElement("p");
    emailElement.textContent = `From: ${comment.email}`;
    article.appendChild(emailElement);

    fragment.appendChild(article);
  });

  return fragment;
}

function populateSelectMenu(usersData) {
  if (!usersData || !Array.isArray(usersData) || usersData.length === 0) {
    return undefined;
  }

  const selectMenu = document.getElementById("selectMenu");
  const options = createSelectOptions(usersData);

  options.forEach((option) => {
    selectMenu.appendChild(option);
  });

  return selectMenu;
}

async function getUsers() {
  try {
    const response = await fetch("https://jsonplaceholder.typicode.com/users");
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
  }
}

async function getUserPosts(id) {
  if (!id) {
    console.error("No user ID provided");
    return undefined;
  }

  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/posts?userId=${id}`
    );
    const data = await response.json();
    return data;
  } catch (err) {
    console.error(err);
    return undefined;
  }
}

async function getUser(userId) {
  if (!userId) {
    return undefined;
  }

  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/users/${userId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    const userData = await response.json();
    return userData;
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
}

async function getPostComments(postId) {
  if (!postId) {
    return undefined;
  }

  try {
    const response = await fetch(
      `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch post comments");
    }
    const commentsData = await response.json();
    return commentsData;
  } catch (error) {
    console.error("Error fetching post comments:", error);
    throw error;
  }
}

async function displayComments(postId) {
  if (!postId) {
    return undefined;
  }
  const section = document.createElement("section");
  section.dataset.postId = postId;
  section.classList.add("comments", "hide");
  const comments = await getPostComments(postId);
  const fragment = createComments(comments);
  section.appendChild(fragment);
  return section;
}

async function createPosts(posts) {
  if (!posts) {
    return undefined;
  }
  const fragment = document.createDocumentFragment();
  for (const post of posts) {
    const article = document.createElement("article");
    const h2 = document.createElement("h2");
    h2.textContent = post.title;
    const p1 = document.createElement("p");
    p1.textContent = post.body;
    const p2 = document.createElement("p");
    p2.textContent = `Post ID: ${post.id}`;
    const author = await getUser(post.userId);
    const p3 = document.createElement("p");
    p3.textContent = `Author: ${author.name} with ${author.company.name}`;
    const p4 = document.createElement("p");
    p4.textContent = author.company.catchPhrase;
    const button = document.createElement("button");
    button.textContent = "Show Comments";
    button.dataset.postId = post.id;
    article.append(h2, p1, p2, p3, p4, button);
    const section = await displayComments(post.id);
    article.append(section);
    fragment.append(article);
  }
  return fragment;
}

const displayPosts = async (posts) => {
  let myMain = document.querySelector("main");
  let element = posts
    ? await createPosts(posts)
    : document.querySelector("main p");
  myMain.append(element);
  return element;
};

function toggleComments(event, postId) {
  if (!event || !postId) {
    return undefined;
  }
  event.target.listener = true;
  let section = toggleCommentSection(postId);
  let button = toggleCommentButton(postId);
  return [section, button];
}

const refreshPosts = async (posts) => {
  if (!posts) {
    return undefined;
  }
  let buttons = removeButtonListeners();
  let myMain = deleteChildElements(document.querySelector("main"));
  let fragment = await displayPosts(posts);
  let button = addButtonListeners();
  return [buttons, myMain, fragment, button];
};

const selectMenuChangeEventHandler = async (e) => {
  if (!e) {
    return undefined;
  }
  try {
    let userId = e?.target?.value || 1;
    let posts = await getUserPosts(userId);
    let refreshPostsArray = await refreshPosts(posts);
    return [userId, posts, refreshPostsArray];
  } catch (error) {
    console.error("An error occurred in selectMenuChangeEventHandler: ", error);
    return null;
  }
};

const initPage = async () => {
  try {
    let users = await getUsers();
    let select = populateSelectMenu(users);
    return [users, select];
  } catch (error) {
    console.error("An error occurred in initPage: ", error);
    return null;
  }
};

function initApp() {
  initPage().then(([users, select]) => {
    let selectMenu = document.getElementById("selectMenu");
    if (selectMenu) {
      selectMenu.appendChild(select);
      selectMenu.addEventListener(
        "change",
        selectMenuChangeEventHandler,
        false
      );
    }
  });
}

document.addEventListener("DOMContentLoaded", initApp, false);
