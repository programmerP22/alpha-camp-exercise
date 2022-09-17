const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";
const dataPanel = document.querySelector("#data-panel");

const userList = [];
const USERS_PER_PAGE = 12
let filteredUsers = []
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const paginator = document.querySelector('.pagination')

function renderUserList(data) {
  let rawHTML = "";
  data.forEach((item) => {
    rawHTML += `
       <div class='col-sm-3'>
        <div class='card'>
          <img src=${item.avatar} alt="user-photo" class='user-img' data-bs-toggle="modal" data-bs-target="#user-modal" data-id="${item.id}">
          <div class="card-body">
            <h6 class="card-title mb-0">${item.name} ${item.surname}</h6>
          </div>
          <div class="button text-end m-2 mt-0">
          <a href="#" class="btn  btn-outline-danger mt-2 btn-sm btn-add-favorite" data-id="${item.id}">add to favorite</a>
          </div>
          </div>
       </div>
  `;
  });
  dataPanel.innerHTML = rawHTML;
}

function showUserModal(id) {
  const userName = document.querySelector("#user-modal-name");
  const userImage = document.querySelector("#user-modal-image");
  const userInfo = document.querySelector("#user-modal-info");

  userName.innerText = "";
  userImage.src = "";
  userInfo.innerHTML = "";

  axios
    .get(INDEX_URL + id)
    .then(function (response) {
      const user = response.data;

      userName.innerText = user.name + " " + user.surname;
      userImage.src = user.avatar;
      userInfo.innerHTML = `
      <li>email: ${user.email}</li>
      <li>gender: ${user.gender}</li>
      <li>age: ${user.age}</li>
      <li>region: ${user.region}</li>
      <li>birthday: ${user.birthday}</li>
    `;
    })
    .catch(function (error) {
      console.log(error);
    });
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoriteUser')) || []
  const user = userList.find((user) => user.id === id)
  if (list.some((user) => user.id === id)) {
    return alert('此用戶已經加入最愛！')
  }
  list.push(user)
  localStorage.setItem('favoriteUser', JSON.stringify(list))
  console.log(list)
}


function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / USERS_PER_PAGE)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`
  }
  paginator.innerHTML = rawHTML

}

function getUserByPage(page) {
  const data = filteredUsers.length ? filteredUsers : userList
  const startIndex = (page - 1) * USERS_PER_PAGE
  return data.slice(startIndex, startIndex + USERS_PER_PAGE)
}


searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()

  filteredUsers = userList.filter(user => user.name.toLowerCase().includes(keyword) || user.surname.toLowerCase().includes(keyword))

  if (!filteredUsers.length) {
    return alert('cannot find user with keyword: ' + keyword)
  }

  renderPaginator(filteredUsers.length)
  renderUserList(getUserByPage(1))
})


dataPanel.addEventListener("click", function onPanelClicked(event) {
  const target = event.target 
  if (target.matches(".user-img")) {
    showUserModal(target.dataset.id);
  }
  if (target.matches('.btn-add-favorite')) {
    addToFavorite(Number(target.dataset.id))
  } 
});

paginator.addEventListener('click', function onPaginatorClicker(event) {
  if (event.target.tagName !== 'A') return
  const page = Number(event.target.dataset.page)
  renderUserList(getUserByPage(page))
})



axios
  .get(INDEX_URL)
  .then(function (response) {
    userList.push(...response.data.results);
    renderPaginator(userList.length)
    renderUserList(getUserByPage(1));
  })
  .catch(function (error) {
    console.log(error);
  });