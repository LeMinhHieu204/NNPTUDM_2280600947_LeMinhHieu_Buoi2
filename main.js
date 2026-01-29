//HTTP request Get,post,put,delete
async function Load() {
    try {
        let res = await fetch('http://localhost:3000/posts')
        let data = await res.json();
        let body = document.getElementById("table-body");
        body.innerHTML = "";
        for (const post of data) {
            const rowClass = post.isDeleted ? "deleted-row" : "";
            body.innerHTML += `
            <tr class="${rowClass}">
                <td>${post.id}</td>
                <td>${post.title}</td>
                <td>${post.views}</td>
                <td>
                    <input value="Edit" type="submit" onclick="EditPost('${post.id}')" />
                    <input value="Delete" type="submit" onclick="Delete('${post.id}')" />
                </td>
            </tr>`
        }
    } catch (error) {

    }
}
async function Save() {
    let id = document.getElementById("id_txt").value.trim();
    let title = document.getElementById("title_txt").value;
    let views = document.getElementById("views_txt").value;
    let res;
    if (id) {
        let getID = await fetch('http://localhost:3000/posts/' + id);
        if (getID.ok) {
            const existing = await getID.json();
            res = await fetch('http://localhost:3000/posts/' + id, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        id: String(id),
                        title: title,
                        views: views,
                        isDeleted: existing.isDeleted === true
                    }
                )
            })
        }
    }
    if (!res) {
        const listRes = await fetch('http://localhost:3000/posts');
        const list = await listRes.json();
        const maxId = list.reduce((max, item) => {
            const val = Number(item.id);
            return Number.isFinite(val) && val > max ? val : max;
        }, 0);
        const newId = String(maxId + 1);
        res = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    id: newId,
                    title: title,
                    views: views,
                    isDeleted: false
                }
            )
        })
    }
    if (res.ok) {
        console.log("them thanh cong");
        Load();
    }
}
async function Delete(id) {
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: 'PATCH',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ isDeleted: true })
    });
    if (res.ok) {
        console.log("xoa thanh cong");
        Load();
    }
}
async function EditPost(id) {
    let res = await fetch('http://localhost:3000/posts/' + id);
    if (!res.ok) return;
    let post = await res.json();
    document.getElementById("id_txt").value = post.id ?? "";
    document.getElementById("title_txt").value = post.title ?? "";
    document.getElementById("views_txt").value = post.views ?? "";
}

async function LoadComments() {
    try {
        let res = await fetch('http://localhost:3000/comments')
        let data = await res.json();
        let body = document.getElementById("comment-body");
        body.innerHTML = "";
        for (const comment of data) {
            body.innerHTML += `
            <tr>
                <td>${comment.id}</td>
                <td>${comment.text}</td>
                <td>${comment.postId}</td>
                <td>
                    <input value="Edit" type="submit" onclick="EditComment('${comment.id}')" />
                    <input value="Delete" type="submit" onclick="DeleteComment('${comment.id}')" />
                </td>
            </tr>`
        }
    } catch (error) {

    }
}
async function SaveComment() {
    let id = document.getElementById("comment_id_txt").value.trim();
    let text = document.getElementById("comment_text_txt").value;
    let postId = document.getElementById("comment_postid_txt").value;
    let res;
    if (id) {
        let getID = await fetch('http://localhost:3000/comments/' + id);
        if (getID.ok) {
            res = await fetch('http://localhost:3000/comments/' + id, {
                method: 'PUT',
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        id: String(id),
                        text: text,
                        postId: postId
                    }
                )
            })
        }
    }
    if (!res) {
        const listRes = await fetch('http://localhost:3000/comments');
        const list = await listRes.json();
        const maxId = list.reduce((max, item) => {
            const val = Number(item.id);
            return Number.isFinite(val) && val > max ? val : max;
        }, 0);
        const newId = String(maxId + 1);
        res = await fetch('http://localhost:3000/comments', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(
                {
                    id: newId,
                    text: text,
                    postId: postId
                }
            )
        })
    }
    if (res.ok) {
        console.log("comment save thanh cong");
        LoadComments();
    }
}
async function DeleteComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id,
        {
            method: 'delete'
        }
    );
    if (res.ok) {
        console.log("comment xoa thanh cong");
        LoadComments();
    }
}
async function EditComment(id) {
    let res = await fetch('http://localhost:3000/comments/' + id);
    if (!res.ok) return;
    let comment = await res.json();
    document.getElementById("comment_id_txt").value = comment.id ?? "";
    document.getElementById("comment_text_txt").value = comment.text ?? "";
    document.getElementById("comment_postid_txt").value = comment.postId ?? "";
}
Load();
LoadComments();
