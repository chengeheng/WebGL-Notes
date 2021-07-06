/**
 * @type {HTMLCanvasElement}
 */
const canvas = document.getElementById("canvas");
const gl = getWebGLContext(canvas);

const VSHADER_SOURCE = `
     attribute vec4 a_Position;
     attribute vec4 a_Color;
     uniform mat4 u_MvpMatrix;
     varying vec4 v_Color;
     void main() {
         gl_Position = u_MvpMatrix * a_Position;
         v_Color = a_Color;
     }
 `;

const FSHADER_SOURCE = `
     precision mediump float;
     varying vec4 v_Color;
     void main() {
         gl_FragColor = v_Color;
     }
 `;

const initVertexBuffers = () => {
	// prettier-ignore
	const verticesColors = new Float32Array([
         // 右侧的3个三角形
         0.0, 1.0, -4.0, 0.4, 1.0, 0.4, // 绿色三角形在最后面
         -0.5, -1.0, -4.0, 0.4, 1.0, 0.4, 
         0.5, -1.0, -4.0, 1.0, 0.4, 0.4,
 
         0.0, 1.0, -2.0, 1.0, 1.0, 0.4, // 黄色三角形在中间
         -0.5, -1.0, -2.0, 1.0, 1.0, 0.4,
         0.5, -1.0, -2.0, 1.0, 0.4, 0.4,
 
         0.0, 1.0, 0.0, 0.4, 0.4, 1.0, // 蓝色三角形在最前面
         -0.5, -1.0, 0.0, 0.4, 0.4, 1.0, 
         0.5, -1.0, 0.0, 1.0, 0.4, 0.4,
     ]);
	const n = 9;

	const vertexColorbuffer = gl.createBuffer();

	gl.bindBuffer(gl.ARRAY_BUFFER, vertexColorbuffer);
	gl.bufferData(gl.ARRAY_BUFFER, verticesColors, gl.STATIC_DRAW);

	const FSIZE = verticesColors.BYTES_PER_ELEMENT;

	const a_Position = gl.getAttribLocation(gl.program, "a_Position");
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 6, 0);

	const a_Color = gl.getAttribLocation(gl.program, "a_Color");
	gl.vertexAttribPointer(a_Color, 3, gl.FLOAT, false, FSIZE * 6, FSIZE * 3);

	gl.enableVertexAttribArray(a_Position);
	gl.enableVertexAttribArray(a_Color);

	return n;
};

const main = () => {
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		throw "Failed to intialize shaders.";
	}
	const n = initVertexBuffers();

	const modelMatrix = new Matrix4();
	modelMatrix.setTranslate(0.75, 0, 0); // 平移0.75个单位
	const viewMatrix = new Matrix4();
	viewMatrix.setLookAt(0, 0, 5, 0, 0, -100, 0, 1, 0);
	const projMatrix = new Matrix4();
	projMatrix.setPerspective(30, canvas.width / canvas.height, 1, 100);
	const mvpMatrix = new Matrix4();
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);

	// 获取u_ViewMatirx变量的存储地址
	const u_MvpMatrix = gl.getUniformLocation(gl.program, "u_MvpMatrix");

	// 将视角矩阵传给u_ViewMatirx变量
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.drawArrays(gl.TRIANGLES, 0, n);

	modelMatrix.setTranslate(-0.75, 0, 0); // 平移-0.75个单位
	mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
	gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
	gl.drawArrays(gl.TRIANGLES, 0, n);
};
main();
