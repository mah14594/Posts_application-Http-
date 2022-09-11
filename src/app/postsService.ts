import { Injectable } from "@angular/core";
import { Post } from "./post.model";
import { HttpClient, HttpHeaders, HttpParams } from "@angular/common/http";
import { map } from "rxjs/operators";
import { Subject } from "rxjs";
@Injectable({ providedIn: "root" })
export class PostsService {
  constructor(private http: HttpClient) {}
  error = new Subject<string>();
  url = `https://postsproject-c792d-default-rtdb.firebaseio.com/posts.json`;
  sendPosts(postData: Post) {
    this.http
      .post<{ name: string }>(this.url, postData, {
        headers: new HttpHeaders({ "custom-header": "postHweader" }),
        observe: "response",
      })
      .subscribe(
        (data) => console.log(data),
        (error) => this.error.next(error.message)
      );
  }
  fetchPosts() {
    //here we are returning the observable in order to use the data returned from it in the component file :
    // because we want to use this data to update some properties in the component ,
    //and by returning the observable we can subscribe for it in the component
    return this.http
      .get<{ [key: string]: Post }>(this.url, {
        headers: new HttpHeaders({ "custom-headers": "myHeader" }),
      }) //indicates the type of the data
      .pipe(
        map((data) => {
          const postsArray: Post[] = [];
          //specifie the type of the recived data
          for (let key in data) {
            postsArray.push({ ...data[key], id: key });
          }
          return postsArray;
        })
      );
  }
  deletePosts(id = null) {
    const url = id
      ? `https://postsproject-c792d-default-rtdb.firebaseio.com/posts/${id}.json`
      : this.url;

    return this.http.delete(url, {
      params: new HttpParams().set("delete", "true"),
    });
  }
}
