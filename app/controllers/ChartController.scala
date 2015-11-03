package controllers

import play.api._
import play.api.mvc._
import com.mongodb.casbah.MongoClient
import com.mongodb.casbah.Imports._
import scala.collection.mutable.ListBuffer
import play.api.libs.json.JsValue
import play.api.libs.json.Json
import com.mongodb.casbah.Imports.ObjectId

object ChartController extends Controller {

  def chart_titles = Action {
    val mongoClient = MongoClient("localhost", 27017)
    val db = mongoClient("meta_ckan")
    val coll = db("dashboard_chart")
    val query = MongoDBObject.empty
    val fields = MongoDBObject("dataset_title" -> 1, "dataset_name" -> 1, "_id" -> 0)
    var results = new ListBuffer[JsValue]()
    for (x <- coll.find(query, fields)) {
      results += Json.parse(x.toString())
    }
    mongoClient.close
    Ok(Json.obj("status" -> "ok", "results" -> results))
  }

  def chartsFromName(name: String) = Action {
    val mongoClient = MongoClient("localhost", 27017)
    val db = mongoClient("meta_ckan")
    val coll = db("dashboard_chart")
    val datasets = coll.find("dataset_name" $eq name)
    var results = new ListBuffer[JsValue]()
    for (x <- datasets) {
      results += Json.parse(x.toString())
    }
    mongoClient.close
    Ok(Json.obj("status" -> "ok", "results" -> results))
  }
  
  def saveDashboard = Action { request =>
    val body: AnyContent = request.body
    val jsonBody: Option[JsValue] = body.asJson 
    val json: JsValue = jsonBody.get
    val string = Json.stringify(json)
    val document: DBObject = com.mongodb.util.JSON.parse(string).asInstanceOf[DBObject]
    val mongoClient = MongoClient("localhost", 27017)
    val db = mongoClient("meta_ckan")
    val coll = db("dashboard_saved")
    coll.insert(document)
    mongoClient.close
    val id: String = document.get("_id").toString()
    //val id = "debug"
    println(id)
      Ok(Json.obj("code" -> id))
    }
    
  def boardFromId(dashboard_id: String) = Action {
    val mongoClient = MongoClient("localhost", 27017)
    val db = mongoClient("meta_ckan")
    val coll = db("dashboard_saved")
    val id = new ObjectId(dashboard_id) 
    val board = coll.findOne("_id" $eq id)
    val results = Json.parse(board.get.toString())
    mongoClient.close
    Ok(Json.obj("status" -> "ok", "results" -> results\"data"))
  }
}