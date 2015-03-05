angular.module('starter.controllers', [])

.controller('UsachMovilCtrl', function($scope, $ionicSideMenuDelegate) {
  $scope.toggleLeft = function() {
    $ionicSideMenuDelegate.toggleLeft();
  };
})

.controller('BuscarSalaCtrl', function($scope, $http, $state, GETservice) {
	$scope.model = {};
  $scope.estado = "Esperando ingreso de sala...";
    $scope.getData = function() {
		$scope.estado = "";
		GETservice.fetchLugar($scope.model.lugar).then(function(dato){
      $scope.estado = "Buscando...";
      if (!dato) {
				$scope.estado = "ERROR: No se pudo hacer la consulta a la Base de Datos";
        //alert($scope.estado);
				return;
			}
			else {
        //console.log(dato.estado + " " + dato.valido);
        if (dato.valido === false) {
          $scope.estado = dato.estado;
          //alert($scope.estado);
          return;
        }
        else {
          $scope.estado = dato.estado;
          //alert($scope.estado);
          $state.go('salas.resultadosala', { nombre: dato.nombre });  
        }
			}
		});
	}
})

.controller('MostrarMapaCtrl', function($scope, $stateParams, $ionicLoading, $compile, GETservice) {
    $scope.init = function() {
      $scope.model = GETservice.getLugar();
      $scope.model.periodo = GETservice.getPeriodo();

        var myLatlng = new google.maps.LatLng(parseFloat($scope.model.latitud), parseFloat($scope.model.longitud));
        var Nombre = $scope.model.nombre;
        var mapOptions = {
          center: myLatlng,
          zoom: 17,
          mapTypeId: google.maps.MapTypeId.HYBRID,
          zoomControl:false,
          streetViewControl: false,
          panControl:false
        };
        var map = new google.maps.Map(document.getElementById("mapa"), mapOptions);

        //Marker + infowindow + angularjs compiled ng-click
        /*
        var contentString = "<div><a ng-click='clickTest()'>"+Nombre+"</a></div>";
        var compiled = $compile(contentString)($scope);

        var infowindow = new google.maps.InfoWindow({
          content: compiled[0]
        });
        */

        // Geolocalización
        navigator.geolocation.getCurrentPosition(function(pos) {
          var posicion = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
          var marker = new google.maps.Marker({
            position: posicion,
            map: map,
            title: "Tu Posición Actual",
            icon: "img/marker_youarehere.png"
          });
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });

        var SRoute = [];
        var LRoute = [];

        for (var i=0; i<$scope.model.rutaCorta.length; i++){
          var lat = $scope.model.rutaCorta[i].latitud;
          var ln = $scope.model.rutaCorta[i].longitud;
          SRoute[SRoute.length] = new google.maps.LatLng(lat,ln);
        }

        SRoute[SRoute.length] = myLatlng;

        for (var i=0; i<$scope.model.rutaLarga.length; i++){
          var lat = $scope.model.rutaLarga[i].latitud;
          var ln = $scope.model.rutaLarga[i].longitud;
          LRoute[LRoute.length] = new google.maps.LatLng(lat,ln);
        }
        //Se instancia un objeto del tipo google.maps.Polyline
        //al cual se pasa el arreglo de coordenadas.
        var SPath = new google.maps.Polyline({
          path: SRoute,
          strokeColor: '#05FF05',
          strokeOpacity: 1.0,
          strokeWeight: 3
        });

        var LPath = new google.maps.Polyline({
          path: LRoute,
          strokeColor: '#FF0000',
          strokeOpacity: 1.0,
          strokeWeight: 3
        });

        SPath.setMap(map);
        LPath.setMap(map);

        var marker = new google.maps.Marker({
          position: myLatlng,
          map: map,
          title: Nombre
        });

        // Experimento para obtener las coordenadas de cada ruta
        /*
        console.log("RUTA CORTA " + $scope.model.nombre);
        for (var i=0; i<$scope.model.rutaCorta.length; i++) {
          j = i+1;
          console.log(j + " " + $scope.model.rutaCorta[i].latitud + " " + $scope.model.rutaCorta[i].longitud);
        }
        console.log("RUTA LARGA " + $scope.model.nombre);
        for (var i=0; i<$scope.model.rutaLarga.length; i++) {
          j = i+1;
          console.log(j + " " + $scope.model.rutaLarga[i].latitud + " " + $scope.model.rutaLarga[i].longitud);
        }
        */

        // Experimento para obtener las distancias y tiempos desde el metro
        /*
        var distanciaCorta = distanciaEnMetros(SPath);
        var distanciaLarga = distanciaEnMetros(LPath);
        var tiempoCorto = tiempoCaminando(distanciaCorta);
        var tiempoLargo = tiempoCorriendo(distanciaCorta);
        console.log("ruta " + distanciaCorta + " " + distanciaLarga);
        console.log("tiempo " + formatearTiempo(tiempoCorto) + " " + formatearTiempo(tiempoLargo));
        */

        $scope.model.distancia = distanciaEnMetros(SPath);
        $scope.model.tiempoCorto = tiempoCaminando($scope.model.distancia);
        $scope.model.tiempoLargo = tiempoCorriendo($scope.model.distancia);

        document.querySelector('#infoNombre').innerHTML = "<b>Nombre del Lugar:</b></br>Sala " + $scope.model.nombre;
        document.querySelector('#infoPiso').innerHTML = "<b>Piso:</b></br>" + $scope.model.piso;
        document.querySelector('#infoMetro').innerHTML = "<b>Metro de Origen:</b></br>" + $scope.model.metroOrigen;
        document.querySelector('#infoDistancia').innerHTML = "<b>Distancia:</b></br>" + $scope.model.distancia + " mt";
        document.querySelector('#infoCamina').innerHTML = "<b>Tiempo Caminando (4 km/h):</b></br>" + formatearTiempo($scope.model.tiempoCorto);
        document.querySelector('#infoCorre').innerHTML = "<b>Tiempo Corriendo (12 km/h):</b></br>" + formatearTiempo($scope.model.tiempoLargo);

        if($scope.model.tipo === 2) {
          $scope.model.url = "https://registro.usach.cl/registrold/salas/listarsala.php?sala=" + $scope.model.nombre + "&periodo=" + $scope.model.periodo;
          $scope.model.enlace = "onclick=\"window.open(\'" + $scope.model.url + "\', '_system');\"";
          document.querySelector('#infoHorario').innerHTML = "<button class='button button-block button-positive'" + $scope.model.enlace + ">Carga Horaria Sala</button>";
        }

        /*
        google.maps.event.addListener(marker, 'click', function() {
          infowindow.open(map,marker);
        });
        */
        
        $scope.map = map;
    };

    // google.maps.event.addDomListener(window, 'load', initialize);

    // CÓDIGO DEPRECADO
    /*
    $scope.centerOnMe = function() {
        if(!$scope.map) {
            return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
          $scope.map.setCenter(new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude));
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
    };

    $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
    };
    
    $scope.toggleRight = function() {
        $ionicSideMenuDelegate.toggleRight();
    };
    */

    google.maps.LatLng.prototype.kmTo = function(a){ 
      var e = Math, ra = e.PI/180; 
      var b = this.lat() * ra, c = a.lat() * ra, d = b - c; 
      var g = this.lng() * ra - a.lng() * ra; 
      var f = 2 * e.asin(e.sqrt(e.pow(e.sin(d/2), 2) + e.cos(b) * e.cos 
      (c) * e.pow(e.sin(g/2), 2))); 
      return f * 6378.137; 
    };

    google.maps.Polyline.prototype.inKm = function(n){ 
      var a = this.getPath(n), len = a.getLength(), dist = 0; 
      for (var i=0; i < len-1; i++) { 
        dist += a.getAt(i).kmTo(a.getAt(i+1)); 
      }
      return dist;
    };

    distanciaEnMetros = function(ruta) {
        return Math.round(ruta.inKm()*1000);
    };

    tiempoCaminando = function(distancia) {
      var velocidad = 1.111111111; // 4 km/h
      return Math.round(distancia/velocidad);
    };

    tiempoCorriendo = function(distancia) {
      var velocidad = 3.333333333; // 12 km/h
      return Math.round(distancia/velocidad);
    };

    formatearTiempo = function(tiempo) {
      // Transforma un lote de segundos en segundos y minutos
      // Ej: 90s -> 1m30s
      var mins = Math.floor(tiempo/60);
      var secs = Math.round(tiempo%60);
      return mins + "m " + get2D(secs) + "s";
    };

    function get2D(num) {
      return ( num.toString().length < 2 ? "0"+num : num ).toString();
    }
})



.controller('GETController', function($scope, $http, GETservice) {
	$scope.model = {};
    $scope.getData = function() {
		//funcion getData se puede llamar en cualquier controlador, pertenece al servicio GETservice el cual esta en services.js
		//al ejecutar la funcion se puede tomar el valor retornado usando ".then(function(valorRetornado)){ X codigo }"
		//tambien se puede usar de la siguiente forma : variable = GETservice.getData(sala);
		GETservice.getData($scope.model.code).then(function(dato){
			if(!dato){
				$scope.estado = "No existe lugar";
				$scope.latitud = "";
				$scope.longitud = "";
				$scope.piso = "";
				$scope.nombre = "";
				$scope.tipo = "";
				return;
			}
			$scope.estado = "Existe lugar";
			$scope.latitud = dato.latitud;
			$scope.longitud = dato.longitud;
			$scope.piso = dato.piso;
			$scope.nombre = dato.nombre;
			$scope.tipo = dato.tipo;

		});
	}
})

.controller('AccordionList', function($scope) {
  $scope.groups = [];
  $scope.groups[0] = {
    name: "Facultades, escuelas, departamentos...",
    items: ["Ingeniería","Humanidades","Tecnológica","Química y Biología","Administración y Economía","Depto. de Deportes","Departamento Física","Departamento de Matemáticas","Escuelas de Periodismo y Psicología","Bachillerato,Escuela de Arquitectura","Depto. de Filosofía y Educación","Ingeniería en Alimentos","Ingeniería Textil","LICAF","Pabellón de Anatomía"]
  };
  $scope.groups[1] = {
    name: "Laboratorios",
    items: ["Lab. Central - CECTA","Labs. de Física","Labs. de Ciencias Médicas","Labs. de Procesos Mecánicos"]
  };
  $scope.groups[2] = {
    name: "Lugares Administrativos",
    items: ["FEUSACH","Casa Central - Rectoría","SEGIC,Registro Académico","Registro Curricular Ingeniería","Depto. de Finanzas","Depto. Promoción de la Salud Psicológica","Patio de los Naranjos","Vicerrectoría de Gestión y Desarrollo Estudiantil","Bienestar Estudiantil - Ingeniería"]
  };
  $scope.groups[3] = {
    name: "Lugares Varios",
    items: ["Mall","Casino Central","Casino FAE","Cátedra UNESCO - PAIEP","Estadio Usach","Jardín Infantil","Aula Magna","Salón Bulnes","Salón Víctor Jara","Piscina","Gimnasio","Centro de Salud","Biblioteca Central","CITE-CAMP","CENI","Radio Usach","Sala Cuna","Paraninfo","Planetario","Foro Griego"]
  };
  
  /*
   * if given group is the selected group, deselect it
   * else, select the given group
   */
  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };
  
});
