// 导入threejs
import * as THREE from 'three';
// 导入gltf模型解析器
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
// 导入draco解压缩gltf模型解析器
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';
// 导入控制器
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
// 通用threejs初始化
export class InitThree {
  /**
   * 实例化时调用
   * @params {option}
   * @option {scene} threejs场景,默认为null
   * @option {camera} threejs相机,默认为null
   * @option {renderer} threejs渲染器,默认为null
   * @option {controls} threejs控制器,默认为null
   * @option {width} 用户自定义threejs场景的宽度,默认为window的宽
   * @option {height} 用户自定义threejs场景的高度,默认为window的高
   * @option {isWindowSize} 是否使用window的尺寸
   * @option {root} threejs绑定的dom元素
   * @option {resizeCallback} 页面尺寸变化回调函数
   */
  constructor(option) {
    let width = option?.width || window.innerWidth;
    let height = option?.height || window.innerHeight;
    // 将配置对象存放到全局中,方便其他地方使用
    this.option = {
      // 如果用户没有配置width和height,就默认设置为window的width和height
      width,
      height,
      // 初始化相机与场景和渲染器与控制器,这里支持用户自定义相机与场景,渲染器与控制器
      scene: option?.scene || new THREE.Scene(),
      camera: option?.camera || new THREE.PerspectiveCamera(45, width / height, 1, 1000),
      renderer: option?.renderer || new THREE.WebGL1Renderer({ antialias: true }),
      isWindowSize: option?.isWindowSize !== undefined ? option.isWindowSize : true,
      root: option?.root || option?.root === undefined ? '#root' : null,
      initFn:
        option?.initFn ||
        function () {
          console.log('callback');
        },
      resizeCallback: option?.resizeCallback,
    };

    // 初始化threejs环境
    this.option.root && this.initThree(this.option.initFn);
  }

  /**
   * 初始化threejs环境
   */
  initThree(callBack) {
    // 设置渲染器尺寸
    this.option.renderer.setSize(this.option.width, this.option.height);

    // 设置渲染器缩放比率
    this.option.renderer.setPixelRatio(window.devicePixelRatio);

    // 定义相机位置
    this.setCameraPosition(5, 2, 8);

    // 定义控制器
    this.option.controls = new OrbitControls(this.option.camera, this.option.renderer.domElement);

    // 开启控制器阻尼效果
    this.option.controls.enableDamping = true;

    // 摄像机添加到场景中
    this.option.scene.add(this.option.camera);

    // 如果有回调就执行
    callBack && callBack.bind(this)(this);

    // 渲染器添加到页面中
    this.option.root && document.querySelector(this.option.root).appendChild(this.option.renderer.domElement);

    // 监听全局的resize,并进行对应的处理
    this.gobalResize(this.option.resizeCallback);
  }

  /**
   * 初始化解析gltf模型
   * @params {modelPath} 解析的gltf模型路径
   * @params {modelSuccess} 文件加载成功后触发
   * @params {modelProgress} 文件加载时触发,可以实时获取进度
   * @params {modelError} 文件加载失败后触发
   */
  initExample(modelPath, modelSuccess, modelProgress, modelError) {
    // 实例化解析器
    const gltfLoader = new GLTFLoader();
    const dracoLoader = new DRACOLoader();

    // 设置draco解压glft模型的解析器路径
    dracoLoader.setDecoderPath('./public/libs/draco/gltf/');

    // 给gltf模型解析器设置解压解析器
    gltfLoader.setDRACOLoader(dracoLoader);

    // 导入模型
    gltfLoader.load(
      modelPath,
      model => modelSuccess && modelSuccess(model),
      xhr => modelProgress && modelProgress(xhr),
      error => modelError && modelError(error)
    );
  }

  /**
   * 设置摄像机的位置
   * @params {x} 摄像机的x位置
   * @params {y} 摄像机的y位置
   * @params {z} 摄像机的z位置
   */
  setCameraPosition(x = 200, y = 100, z = 100) {
    // 设置摄像机的位置
    this.option.camera.position.set(x, y, z);
  }

  /**
   * 渲染器
   * @params {callback} 每次执行时会触发callback,便于用户自定义操作
   */
  render(callback) {
    // 保存this
    let that = this;

    // 再次执行render函数,并且改变this指向,避免this丢失
    callback ? requestAnimationFrame(this.render.bind(that, callback)) : requestAnimationFrame(this.render.bind(that));

    // 更新渲染器
    this.option.renderer && this.option.renderer.render(this.option.scene, this.option.camera);

    // 更新轨道控制器
    this.option.controls && this.option.controls.update();

    // 如果有回调函数就执行回调函数
    callback && typeof callback === 'function' && callback();
  }

  /**
   * 全局的resize处理
   */
  gobalResize(callback) {
    if (this.option.resizeCallback) {
      window.addEventListener('resize', e => {
        // 如果有回调函数就执行回调函数
        callback && typeof callback === 'function' && callback(this, e);
      });
    } else {
      window.addEventListener('resize', () => {
        let size = this.option.isWindowSize ? { width: window.innerWidth, height: window.innerHeight } : { width: this.option.width, height: window.innerHeight };
        // 设置渲染器尺寸
        this.option.renderer.setSize(size.width, size.height);
        // 更新相机宽高比
        this.option.camera.aspect = size.width / size.height;

        // 更新相机投影矩阵
        this.option.camera.updateProjectionMatrix();
      });
    }
  }
}

// 导出
export { THREE, GLTFLoader, DRACOLoader, OrbitControls };
