package controllers

import play.api._
import play.api.mvc._
import com.mongodb.casbah.MongoClient
import com.mongodb.casbah.Imports._
//import scala.collection.mutable.ListBuffer
import play.api.libs.json.JsValue
import play.api.libs.json.Json
//import com.mongodb.casbah.Imports.ObjectId

object RealtimeController extends Controller {

    def viewRealtimeData(label_type: String) = Action {
        //Changing label -> need to change html
        if(label_type=="bike") {
            Ok(views.html.base("e-Motion Bikesharing")(label_type))
        }
        else if(label_type.equals("campodenno")) {
            Ok(views.html.base("Dati dai sensori di Campodenno")(label_type))
        }
        else if(label_type.equals("fotovoltaico")) {
            Ok(views.html.base("PAT: dati sul fotovoltaico")(label_type))
        }
        else {
            Ok(views.html.base("Trentino OpenData DashBoard")("home"));
        }
    }
  
}