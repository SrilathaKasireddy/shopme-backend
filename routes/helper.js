import { client } from "../index.js";
import { ObjectId } from "mongodb";

export async function createNewItems(data) {
    return await client
        .db("latestcloths")
        .collection("latestcloths").
        insertMany([data]);
}
export async function updateItemById(id, data) {
    return await client
        .db("latestcloths")
        .collection("latestcloths")
        .updateOne({ _id: ObjectId(id) }, { $set: data });
}
export async function deleteItemById(id) {
    return await client.db("latestcloths")
        .collection("latestcloths")
        .deleteOne({ _id: ObjectId(id) });
}
export async function getItemById(id) {
    return await client.db("latestcloths")
        .collection("latestcloths")
        .findOne({ _id: ObjectId(id) });
}
export async function getAllItems(request) {
    return await client.db("latestcloths")
        .collection("latestcloths")
        .find(request.query).toArray();
}

export async function getAllHomes(request) {
    return await client.db("users")
        .collection("users")
        .find(request.query)
}


export async function getUserByName(UserName) {
    //db.users.findOne({username: username });
    return await client.db("users").collection("users").findOne({ UserName: UserName });
}
export async function getUserById(id) {
    //db.users.findOne({_id: id });
    return await client.db("users").collection("users").findOne({ _id: ObjectId(id) });
}

export async function createUser(data) {
    //db.users.insertOne(data);
    return await client.db("users").collection("users").insertOne(data);
}

export async function getUserByEmail(Email) {
    //db.users.findOne({username: username });
    return await client.db("users").collection("users").findOne({ Email: Email });
}



// export async function createNewComments(data) {
//     return await client
//         .db("Comments")
//         .collection("Comments").
//         insertMany([data]);
// }
// export async function updateCommentById(id, data) {
//     return await client
//         .db("Comments")
//         .collection("Comments")
//         .updateOne({ _id: ObjectId(id) }, { $set: data });
// }
// export async function deleteCommentById(id) {
//     return await client.db("Comments")
//         .collection("Comments")
//         .deleteOne({ _id: ObjectId(id) });
// }
// export async function getCommentById(id) {
//     return await client.db("Comments")
//         .collection("Comments")
//         .findOne({ _id: ObjectId(id) });
// }
// export async function getAllComments(request) {
//     return await client.db("Comments")
//         .collection("Comments")
//         .find(request.query).toArray();
// }