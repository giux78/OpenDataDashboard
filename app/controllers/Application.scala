package controllers

import play.api._
import play.api.mvc._

object Application extends Controller {

  def index = Action {
    Ok(views.html.index("Your new application is ready."))
  }

  def home = Action {
    Ok(views.html.home("OpenData Dashboard"))
  }

  def home2 = Action {
    Ok(views.html.home2("OpenData Dashboard"))
  }

    def chart(chartName :String) = Action {
    Ok(views.html.dashboard_chart(chartName))
  }
  
   def create_dashboard = Action {
    Ok(views.html.base("Crea la tua Dashboard")("create_dashboard"))
  }
  
   def view_dashboard = Action {
    Ok(views.html.base("Usa la tua Dashboard")("view_dashboard"))
  }
  
  def show_dashboard(dashboard_id :String) = Action {
      //for now, dash_id is useless
    Ok(views.html.base("Usa la tua Dashboard")("show_dashboard"))
  }
  
  def start = Action {
    Ok(views.html.base("Benvenuti")("start"))
  }
}