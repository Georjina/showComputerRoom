'use strict';

		let container, stats, controls;

		let camera, scene, renderer, light;

		let nameArray = [];

		let posArray = [];

		let model;

		let clock = new THREE.Clock(),
			Bplace = [],
			titlePlane, sprite, r;

		let boxs, boxs1;

		let boliName
		let alarm;
		let timer;
		let isLook = true; //点击动画执行一次
		let alarmAllName = []
		let poTargets = [] //抽屉名称
		let lineTargets = [] //电线名称
		let copperRows = ['N_SPTP_01'] //'铜板名称'
		let panels = ['WD_01', 'WD_02', 'WD_03', 'SQ_01', 'SQ_02'] //温控面板
		let deltas = 1 //闪烁值
		let direction = 1 //闪烁方向
		let alarmIndex = 0 //警示设备顺序

		let titleInfo; //信息面板
		let loosenInfo; //松动gif
		//---------

		let errorModelIndex = [29, 6, 8, 10, 24]//所有异常设备的属性索引
		let boards = [3, 4, 1] //温控面板名称索引
		let testDatas = ['温度过高$', '线路闭合', '开关松动', '高温预警$'] // $"代表松动gif"
		let testName = ['报警编号:1', '抽屉1', '抽屉2', '铜板'] // $"代表松动gif"

		let showHideArray = []
		let windArray = []
		let errors = [].concat(errorModelIndex, boards).length == 0 ? false : true

		var dings = null
		let hideWind = false
		let topPos = [0, 850, 0]
		let fontPos = [49, 99, 6]
		let leftPos = [36, 238, 170]
		let rightPos = [27, 231, -153]
		let rightPosx = [0, 530, 568]
		let [isR, speed, isH] = [false, 0.01, false]
		let groupsLight = new THREE.Group()
		let Rs = 800
		let RsH = 1000


		const inCabinet = function() {
			console.log('观察机柜')
		}
		const inHouse = function() {
			console.log('观察机房')

		}
		let delIndex = 0
		const moveDom = function() {
			$("#topPos").on('click', function() {
				moveCamera('target', topPos, [0, 0, 0])
			})
			$("#fontPos").on('click', function() {
				moveCamera('target', fontPos, [286, 83, 0])
			})
			$("#leftPos").on('click', function() {
				moveCamera('target', leftPos, [-116, 59, -59])
			})
			$("#rightPos").on('click', function() {
				moveCamera('target', rightPos, [-116, 59, 59])
			})
			$("#restPos").on('click', function() {
				moveCamera('target', [0, 530, 568], [0, 59, 0])
			})
			$("#isRotation").on('click', function() {
				isR = !isR
			})
			$("#restHide").on('click', function() {
				isH = !isH
			})
			$("#addP").on('click', function() {
				if (showHideArray[delIndex]) showHideArray[delIndex].visible = true
				if (delIndex >= 10) {
					delIndex = 10
				} else {
					delIndex++
				}
			})
			$("#delP").on('click', function() {
				delIndex--
				showHideArray[delIndex].visible ? showHideArray[delIndex].visible = false : 0
			})
			$("#wind").on('click', function() {
				hideWind = !hideWind
			})
			$('body').keypress(function(e) {
				if (e.keyCode == 119) {
					camera.position.y += 1
				}
				if (e.keyCode == 115) {
					camera.position.y -= 1
				}
			})

			$("button").on('click', () => {
				var ppos = scene.getObjectByName($("input").val())
				if (ppos) {
					ppos.visible = true
				}
			})
			$('body').on('keydown', () => {
				var ppos = scene.getObjectByName($("input").val())
				if (ppos) {
					ppos.visible = true
				}

			})
		}

		init()

		function init() {

			//场景渲染器
			renderer = new THREE.WebGLRenderer({
				antialias: true,
				canvas: document.querySelector("#cc")
			});
			renderer.setPixelRatio(window.devicePixelRatio);
			renderer.setSize($("#cc").width(), $("#cc").height());
			renderer.shadowMap.enabled = true; //渲染器接收阴影渲染
			renderer.toneMappingExposure = 1.05//渲染曝光强度
			window.addEventListener('resize', onWindowResize, false); //窗口大小变化后，针对当前窗口大小比例渲染

			// stats
			stats = new Stats();
			$('body').append(stats.dom); //添加一个fps测速器

			camera = new THREE.PerspectiveCamera(45, $("#cc").width() / $("#cc").height(), 1, 20000);
			camera.position.set(0, 530, 568); //相机位置

			controls = new THREE.OrbitControls(camera, document.querySelector("#cc")); //添加控制器
			controls.target.set(0, 100, 0);
			controls.update();

			scene = new THREE.Scene(); //创建场景
			scene.background = new THREE.Color(0x383634);
			scene.fog = new THREE.Fog(0xa0a0a0, 600, 5000); //场景加入雾化，200 - 1000的距离衰变雾化

			light = new THREE.HemisphereLight(0xffffff, 0x888888, .3); //半球光源，颜色从天空颜色渐变为地面颜色。
			light.position.set(0, 400, 0);
			scene.add(light); //				这光不能用于投射阴影。

			light = new THREE.AmbientLight(0xffffff, 1); // soft white light
			scene.add(light);

			boxs = new THREE.Mesh(new THREE.CubeGeometry(20, 20, 20), new THREE.MeshLambertMaterial({
				wireframe: true
			}))
			boxs.position.set(-113, 100, -110)
			boxs1 = boxs.clone()

			boxs1.position.z += 250
			//距离监听
			//scene.add(boxs1)//改变设备外壳透明度
			//scene.add(boxs)	//隐藏墙体
			
			//提示面板
			titleInfo = new THREE.Sprite(new THREE.SpriteMaterial({
				map: createCanvasTexture(testDatas[0], testName[0]),
				transparent: true,
				opacity: 1,
				side: THREE.DoubleSide
			}))

			titleInfo.scale.set(60, 40, 1)
			titleInfo.position.copy(boxs.position)
			titleInfo.position.y += 50
			titleInfo.position.x += 20
			titleInfo.name = 'info'
			titleInfo.visible = errorModelIndex.length ? true : false
			Bplace.push(titleInfo)//放入拾取数组

			loosenInfo = new THREE.Sprite(new THREE.SpriteMaterial({
				transparent: true,
				opacity: 1,
				side: THREE.DoubleSide
			}))//螺丝松动gif
			loosenInfo.position.copy(titleInfo.position)
			loosenInfo.scale.set(15, 10, 1)
			loosenInfo.position.x += 40
			loosenInfo.visible = false
			
			groupsLight.add(loosenInfo)
			groupsLight.add(titleInfo)



			for (let i = 0; i < 3; i++) {
				for (let q = 0; q < 3; q++) {
					light = new THREE.PointLight(0xffffff, 1.58, 240);

					light.position.set(-330 + i * 300, 155, -150 + q * 160);

					groupsLight.add(light);

					let sphereSize = 1;
					//					let pointLightHelper = new THREE.PointLightHelper(light, sphereSize);//场景灯光辅助器，判断当前灯光情况
					//					scene.add(pointLightHelper);
				}
			}
			scene.add(groupsLight)
			// 创建地面

			loadModel()

			function onWindowResize() {

				camera.aspect = $("#cc").width() / $("#cc").height(); //相机视锥体的长宽比
				camera.updateProjectionMatrix(); //更新相机投影矩阵

				renderer.setSize($("#cc").width(), $("#cc").height()); //渲染器大小

			}
		}
		//
		var des = 0.5//相机旋转速度
		var sks = 0.1//吹风渲染速度

		function animate() {
			//controls.update();
			requestAnimationFrame(animate);

			renderer.render(scene, camera);

			stats.update(); //fps插件更新s

			if (alarmAllName) alarmColor(alarmAllName, 1.5) //物体闪烁警示渲染

			TWEEN.update();

			if (!isLook) toggleWall(camera.position.distanceTo(boxs.position))//判断是否点击过提示框，点击过，则让墙体隐藏。

			if (camera.position.distanceTo(boxs1.position) < 160) {//判断是否近距离浏览机柜，是则透明箱体外壳
				hideComputer('hide')
			} else if (isLook) {
				hideComputer('show')
			}

			if (isR) {//是否需要旋转动画处理---通过旋转相机，产生观看视觉的环绕观看物体
				des++
				camera.position.x = Math.cos(Math.PI / 180 * des) * Rs
				camera.position.z = Math.sin(Math.PI / 180 * des) * Rs
				camera.position.y = RsH
				camera.lookAt(0, 100, 0)
				//				model.rotation.y+=speed
				//				groupsLight.rotation.y+=speed

			}
			if (windArray.length) {//送风动画处理

				sks += 0.02
				windArray.map((e) => {
					e.visible = !hideWind
					e.material.map.offset.set(-sks, 1);
				})
				if (sks >= 1) sks = -0.1
			}

			dings.visible = !isH//控制顶部墙体的开关


		}

		function loadModel() {
			let onProgress = function(xhr) {

				if (xhr.lengthComputable) {

					let percentComplete = xhr.loaded / xhr.total * 100;
					console.log(Math.round(percentComplete, 2) + '% downloaded');

				}

			};

			let onError = function(xhr) {};

			THREE.Loader.Handlers.add(/\.dds$/i, new THREE.DDSLoader());//dds贴图加载，如果有dds则加载dds图片
			//玻璃的名称
			boliName = ['transformer_room_05', 'transformer_room_03', 'transformer_room_06', 'transformer_room_01',
				'transformer_room_04',
				'transformer_room_02', 'WD_01', 'WD_02', 'WD_03', 'FS', 'SXT', 'SQ_01', 'SQ_02', 'QiaoJia_1', 'QiaoJia_2'
			]
			//线名称
			for (let i = 1; i < 19; i++) {
				let srtings;
				if (i < 10) {
					srtings = 'N_xian0' + i
				} else {
					srtings = 'N_xian' + i
				}

				lineTargets.push(srtings)//控制所有线条
			}
			//抽屉名称
			for (let i = 1; i < 13; i++) {

				let srtings = 'AA5_CT' + i + '_1'

				poTargets.push(srtings)//控制所有抽屉
			}
			//加载模型
			new THREE.MTLLoader()
				.setPath('./ZoomX3/')
				.load('JF.mtl', function(materials) {
					materials.preload();
					new THREE.OBJLoader()
						.setMaterials(materials)
						.setPath('./ZoomX3/')
						.load('JF.obj', function(object) {
							
							setModel(object)//模型分发处理，初始化数据绑定。
							
							rayBreathing()//模型点击事件分发处理。
							
							animate()//动画渲染
							
							moveDom()//初始化dom事件
							
						}, onProgress, onError);

				});
		}
		function setModel(object){
			let sc = 50
			object.updateMatrixWorld(true)
			object.traverse(function(child) {
				if (child.isMesh) {
					child.toggle = 1;
					child.Prevent = true;
			
					child.scale.set(sc, sc, sc)
					if (child.name[0] == 'P') {//机柜模型
						showHideArray.push(child)
						child.visible = false
					}
					if (child.name[0] == 'k') {//送风模型
						var maps = new THREE.TextureLoader().load('img/13.png')
						windArray.push(child)
						child.material.map = maps
						child.material.side = THREE.DoubleSide
						child.material.transparent = true
						child.material.color = new THREE.Color(0xff0000)
						child.visible = true
					}
					if (child.name[0] == 'M') {
						var cred = redBox(child.geometry, false)//几何体外壳渲染--颜色处理
						cred.children[0].visible = false
						cred.children[0].name = child.name
					}
					if (lineTargets.includes(child.name)) {//后台传入---异常线条名称
						child.indexs = alarmIndex//电线模型索引属性
			
						alarmAllName.push(child)//纳入报警设备数组中
			
						child.material.cp = child.material[0].color.g//存储颜色
						child.material[2] = new THREE.MeshPhongMaterial({
							color: 0xff0000,
							visible: false
						})//提示框牵引线红色默认隐藏，对应问题点发生则显示。
						
						//child.material[2].visible = false
			
						alarmIndex++
					}
					if (copperRows.includes(child.name)) {//后台传入---异常铜板名称
						child.indexs = alarmIndex//模型警报属性索引
			
						alarmAllName.push(child)
						child.material[1] = new THREE.MeshPhongMaterial({
							color: 0xff0000,
							visible: false
						})//提示框牵引线红色默认隐藏，对应问题点发生则显示。
						//child.material.cp = child.material.color.g
			
						alarmIndex++
					}
					if (child.name == '205_1' && errorModelIndex.length) redBox(child.geometry, false) //机箱红体
			
					if (child.name == 'ding_x') {
						dings = child
					}
			
					if (panels.includes(child.name)) {//墙体模型开关渲染状态
			
						boards.map((e) => {//boards索引控制哪些模型属于异常，进行渲染，红色警报
							if (child.name == panels[e]) {
			
								//redBox(child.geometry, true)
								child.material.color.r = 60
			
							}
						})
					}
			
					if (poTargets.includes(child.name)) {//抽屉设备模型初始化
						alarmAllName.push(child)
						child.indexs = alarmIndex//模型警报属性索引
						child.material.map((e) => {
							e.cp = e.color.r
						})
						alarmIndex++
					}
			
					Bplace.push(child)//添加入拾取数组

			
				}
			
			}); //模型光照处理
			model = object
			console.log(alarmAllName)
			alarmAllName = alarmAllName.filter((e) => {//后台传入---获取异常需要警示模型集合
				return errorModelIndex.includes(e.indexs)
			})
			
			//异常信息录入
			alarmAllName.map((e, i) => {//后台传入---给异常模型对象添加，警示数据信息。
				e.errorData = testDatas[i]
				e.nameInfo = testName[i]
			})
			
			alarmAllName.map(e => {//处理异常模型里面的线条包壳。透明一下
				if (lineTargets.includes(e.name)) {
					e.material[1] = new THREE.MeshPhongMaterial({
						color: 0xff0000,
						transparent: true,
						opacity: 0.5
					})
				}
			})
			scene.add(model);
		}
		function rayBreathing() {

			document.querySelector("canvas").addEventListener('click', ray);
			function ray() {

				let Sx = event.clientX; //鼠标单击位置横坐标
				let Sy = event.clientY; //鼠标单击位置纵坐标
				//屏幕坐标转标准设备坐标

				let x = (Sx / $("#cc").width()) * 2 - 1; //标准设备横坐标
				let y = -(Sy / $("#cc").height()) * 2 + 1; //标准设备纵坐标
				let standardVector = new THREE.Vector3(x, y, 0.5); //标准设备坐标
				//标准设备坐标转世界坐标
				let worldVector = standardVector.unproject(camera);
				//射线投射方向单位向量(worldVector坐标减相机位置坐标)
				let ray = worldVector.sub(camera.position).normalize();
				//创建射线投射器对象
				let raycaster = new THREE.Raycaster(camera.position, ray);
				//返回射线选中的对象
				let intersects = raycaster.intersectObjects(Bplace); //Bplace

				let names = []//所有异常模型的名称集合
				for (let i of alarmAllName) {
					names.push(i.name)
				}
				let backDeg = ['info']//提示面板
				if (intersects.length > 0) {
					let rayObjct = intersects[0].object
					console.log(intersects[0].point)
					sensor([intersects[0].object.name])

					if (names.includes(intersects[0].object.name)) hideLine(intersects[0].object.name)
					let aimX, aimY, aimZ;
					if ([3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 28].includes(errorModelIndex[0])) {//判断异常设备的第一个是否为机柜抽屉，如果是采用另外一组镜头坐标。
						[aimX, aimY, aimZ] = [-113, 192, 139]//正面观看镜头
					} else {
						[aimX, aimY, aimZ] = [-113, 116, -310]//背后观看镜头
					}
					if (backDeg.includes(rayObjct.name) && isLook) {//判断是否点击提示面板--是则触发近距离观看情况
						new TWEEN.Tween(camera.position).to({
								x: aimX,
								y: aimY, //192
								z: aimZ //139
							}, 2000)
							.easing(TWEEN.Easing.Linear.None).start().onUpdate(tweenHandler).onComplete(() => {
								isLook = false
								boliName.map((e) => {
									if (scene.getObjectByName(e)) {
										scene.getObjectByName(e).visible = false
									}
								})
								hideComputer('hide')
								//inCabinet()
							})

						function tweenHandler() {
							camera.lookAt(boxs.position)

							scene.getObjectByName('205_1').visible = false
							scene.getObjectByName('205_2').visible = false

							controls.target.copy(boxs.position)
							controls.target.y = 100

							boliName.map((e) => {

								if (scene.getObjectByName(e)) {
									if (scene.getObjectByName(e).material instanceof Array) {
										scene.getObjectByName(e).material.map((e) => {
											e.transparent = true
											e.opacity -= 0.1
										})
									}
									scene.getObjectByName(e).material.transparent = true
									scene.getObjectByName(e).material.opacity -= 0.01
								}

							})
						}
					}
					console.log(rayObjct.name)
					//抽屉拉动动画
					if (poTargets.includes(rayObjct.name)) moveDirection(rayObjct)
					////清除警报					
					clearAlarm(rayObjct.name, names) //点击物体清除

				}
			}
		}

		function alarmColor(object, speed) {
			if (deltas >= 60) {
				direction = -1
			} else if (deltas <= 0) {
				direction = 1
			}
			deltas += (direction) * speed

			if (object.length) {
				if (object instanceof Array) {

					object.map((e) => {
						if (e.material instanceof Array) {
							e.material.map(ee => {

								ee.color.r = Math.cos(Math.PI / 180 * deltas)

							})
						} else {
							e.material.color.g = Math.cos(Math.PI / 180 * deltas)
						}
					})

				} else {
					object.material.color.r = Math.cos(Math.PI / 180 * deltas)
					object.material.color.g = 0
					object.material.color.b = 0
				}
			}

		}

		function moveDirection(target) {

			let nameRed = target.name.split("_")[0] + '_' + target.name.split("_")[1] + '_L2';

			let nameGreen = target.name.split("_")[0] + '_' + target.name.split("_")[1] + '_L1';

			let nameGate = target.name.split("_")[0] + '_' + target.name.split("_")[1] + '_2';
			//console.log(nameRed)
			let redLamp = scene.getObjectByName(nameRed)
			let greenLamp = scene.getObjectByName(nameGreen)
			let gate = scene.getObjectByName(nameGate)

			const tweenHandler = function() {
				if (redLamp && greenLamp && gate) {
					redLamp.position.z = target.position.z
					greenLamp.position.z = target.position.z
					gate.position.z = target.position.z
				}
			}
			const moveInOut = function(prevent, toggle, distance, time) {
				target.Prevent = false
				new TWEEN.Tween(target.position).to({
						x: target.position.x,
						y: target.position.y,
						z: target.position.z + distance
					}, time)

					.easing(TWEEN.Easing.Linear.None).start().onUpdate(tweenHandler).onComplete(() => {

						target.toggle = toggle == 0 ? 1 : 0
						target.Prevent = true

					})
			}

			if (target.toggle == 1 && target.Prevent) {

				moveInOut(target.Prevent, target.toggle, 20, 1000)

			} else if (target.toggle == 0 && target.Prevent) {

				moveInOut(target.Prevent, target.toggle, -20, 1000)

			}

		}

		function clearAlarm(aimName, names) {

			if (alarmAllName.length == 0) {

				titleInfo.visible = false

			}

			if (names.includes(aimName)) {

				let typeData = alarmAllName[names.indexOf(aimName)].errorData
				let name = alarmAllName[names.indexOf(aimName)].nameInfo

				titleInfo.material.map = createCanvasTexture(typeData, name)

				if (copperRows.includes(aimName)) {
					
					let typeData = alarmAllName[names.indexOf(aimName)].errorData

					if (typeData[typeData.length - 1] == '$') {
						window.clearTimeout(timer)
						repeatGif(true, './images/flex.png')
					}

				} else if (lineTargets.includes(aimName)) {
					let typeData = alarmAllName[names.indexOf(aimName)].errorData

					if (typeData[typeData.length - 1] == '$') {
						window.clearTimeout(timer)
						repeatGif(true, './images/xian.png')
					}

				} else {
					window.clearTimeout(timer)
					repeatGif(false)
				}

			}
		}

		function createCanvasTexture(dataContent = "this is a test", ctxName = "tile") {
			//let ctxName = ['title']
			if (dataContent[dataContent.length - 1] == '$') {
				dataContent = dataContent.split('$')[0]
			}
			let tips = document.createElement('canvas');
			tips.width = 256;
			tips.height = 256;
			let tipsTexture = tips.getContext('2d');
			tipsTexture.lineWidth = '4px'
			tipsTexture.strokeStyle = '#696969'
			tipsTexture.fillStyle = 'rgba(0,0,0,0.5)';
			tipsTexture.beginPath();

			//第二种面板样式
			tipsTexture.moveTo(0, 20);
			tipsTexture.moveTo(20, 0);
			tipsTexture.lineTo(256, 0);
			tipsTexture.lineTo(256, 200);
			tipsTexture.lineTo(256, 200);
			tipsTexture.lineTo(0, 200);
			tipsTexture.lineTo(0, 40);
			//------
			//			tipsTexture.moveTo(20, 40);
			//			tipsTexture.lineTo(256, 40)

			tipsTexture.closePath();
			tipsTexture.stroke()
			tipsTexture.fill()

			tipsTexture.font = '50px arial';

			tipsTexture.fillStyle = "#ff0000";

			tipsTexture.fillText(ctxName, 10, 90);

			drawText(dataContent, 20, 150, 150, tipsTexture)

			let texture1 = new THREE.Texture(tips)

			texture1.needsUpdate = true;
			return texture1

		}

		function drawText(t, x, y, w, ctx) {

			let chr = t.split('');

			let temp = "";
			let row = [];

			ctx.font = "18px arial";
			ctx.fillStyle = "#00c0ff";
			ctx.textBaseline = "bottom";

			for (let a = 0; a < chr.length; a++) {
				if (ctx.measureText(temp).width < w) {;
				} else {
					row.push(temp);
					temp = "";
				}
				temp += chr[a];
			}

			row.push(temp);

			for (let b = 0; b < row.length; b++) {
				ctx.fillText(row[b], x, y + (b + 1) * 25);
			}
		}

		function redBox(obj, Pass) {
			let a2 = new THREE.Geometry()
			a2.fromBufferGeometry(obj)
			let modifier = new THREE.BufferSubdivisionModifier(2);
			let material = new THREE.MeshBasicMaterial({
				color: 0xff0000,
				wireframe: false,
				opacity: 0.3,
				transparent: true,
				depthTest: Pass
			});

			let ff = new THREE.BoxGeometry(20, 20, 20)
			let createSomething = function(klass, args) {

				let F = function(klass, args) {

					return klass.apply(this, args);

				};

				F.prototype = klass.prototype;

				return new F(klass, args);

			};
			THREE.Suzanne = function() {
				return a2.clone()
			}
			let geometry2 = createSomething(THREE.Suzanne, []);

			let smooth = modifier.modify(geometry2);

			let colors = new TypedArrayHelper(0, 1, THREE.Color, Float32Array, 3, ['r', 'g', 'b']);

			for (let i = 0; i < smooth.attributes.position.array.length / 3; i++) {

				let hue = (smooth.attributes.position.array[(i * 3) + 1] / 200) + 0.5;
				colors.register[0].setHSL(hue, 1, 0.5);
				colors.push_element(colors.register[0]);

			}

			colors.trim_size();
			smooth.addAttribute('color', new THREE.BufferAttribute(colors.buffer, 3));

			let group = new THREE.Group();
			scene.add(group);

			let mesh = new THREE.Mesh(geometry2, material);
			group.add(mesh);
			group.scale.set(50, 50, 50)
			groupsLight.add(group)

			return group
		}

		function repeatGif(clean, url) {//绘制gif螺丝松动方法

			let ox = 0;
			let maps = new THREE.TextureLoader().load(url)
			maps.wrapS = maps.wrapT = THREE.RepeatWrapping;
			maps.repeat.set(0.25, 1);
			maps.needsUpdate = true;
			loosenInfo.material.map = maps

			if (clean) {

				loosenInfo.visible = true

				timer = setInterval(() => {

					ox += 0.25
					loosenInfo.material.map.offset.set(ox, 1);
					if (ox >= 1) ox = 0
				}, 300)
			} else {

				loosenInfo.visible = false

			}

		}

		function sensor(nickArray) {
			nickArray.map((e) => {
				if (e == 'WD_02') {
					moveCamera(scene.getObjectByName(e), [-134, 189, -126], [-139, 172, -229])
				}
				if (e == 'WD_03') {
					moveCamera(scene.getObjectByName(e), [407, 193, 51], [506, 166, 43])
				}
				if (e == 'WD_01') {
					moveCamera(scene.getObjectByName(e), [-158, 188, 112], [-141, 167, 226])
				}
				if (e == 'SQ_01') {
					moveCamera(scene.getObjectByName(e), [-398, 171, -125], [-455, 47, -229])
				}
				if (e == 'SQ_02') {
					moveCamera(scene.getObjectByName(e), [215, 40, 116], [217, 45, 227])
				}
			})


		}

		function moveCamera(target, pos, pos2) {
			new TWEEN.Tween(camera.position).to({
					x: pos[0],
					y: pos[1],
					z: pos[2]
				}, 1500)
				.easing(TWEEN.Easing.Linear.None).start().onUpdate(tweenHandler).onComplete(() => {})

			function tweenHandler() {
				//controls.target.set(...pos2)
				camera.lookAt(new THREE.Vector3(...pos2))
			}
		}

		function toggleWall(distance) {
			if (distance > 400) {
				boliName.map((e) => {

					if (scene.getObjectByName(e)) {
						if (scene.getObjectByName(e).material instanceof Array) {
							scene.getObjectByName(e).material.map((e) => {
								e.transparent = true
								e.opacity = 0.7
							})
						}
						scene.getObjectByName(e).material.transparent = true
						scene.getObjectByName(e).material.opacity = 1
						scene.getObjectByName(e).visible = true
					}

				})

				isLook = true
				scene.getObjectByName('205_1').visible = true
				scene.getObjectByName('205_2').visible = true

				hideComputer('show')

				inHouse()

			}
		}

		function hideComputer(show) {

			let names;

			for (let iz = 9; iz < 17; iz++) {

				if (iz < 10) {
					names = '20' + iz
				} else {
					names = '2' + iz
				}
				if (scene.getObjectByName(names)) {
					if (scene.getObjectByName(names).material && iz != 5) {
						if (show == 'show') {
							scene.getObjectByName(names).material.map((e) => {
								e.transparent = false
								e.opacity = 1
							})
						} else {

							scene.getObjectByName(names).material.map((e) => {
								e.transparent = true
								e.opacity = 0.5
							})
						}

					}
				}

			}

		}

		function hideLine(name) {
			if (lineTargets.includes(name)) {

				scene.getObjectByName(name).material[2] = new THREE.MeshPhongMaterial({
					color: 0xff0000,
					visible: true
				})

				lineTargets.map((e) => {
					if (e != name) {
						scene.getObjectByName(e).material[2] = new THREE.MeshPhongMaterial({
							color: 0xff0000,
							visible: false
						})
					}
				})
				siblingLine(copperRows, 1) //隐藏铜板提示线

			} else if (copperRows.includes(name)) {
				scene.getObjectByName(name).material[1] = new THREE.MeshPhongMaterial({
					color: 0xff0000,
					visible: true
				})

				siblingLine(lineTargets, 2) //隐藏提示线

			} else {

				siblingLine(lineTargets, 2)
				siblingLine(copperRows, 1)
			}

			function siblingLine(arrays, index) {
				arrays.map((e) => {
					scene.getObjectByName(e).material[index] = new THREE.MeshPhongMaterial({
						color: 0xff0000,
						visible: false
					})

				})
			}
		}
