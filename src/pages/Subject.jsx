import { Router } from "express";
import pool from "../config/pg.js";

const subjectRouter = Router();

// Get all subjects
subjectRouter.get("/get-all-subjects", async (req, res) => {
  try {
    const query = `SELECT * FROM subjects ORDER BY course_id ASC`;
    const result = await pool.query(query);

    res.status(200).json({
      message: "ดึงข้อมูลรายวิชาสำเร็จ",
      total: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการดึงข้อมูลรายวิชา" });
  }
});

// Create subject
subjectRouter.post("/create-subject", async (req, res) => {
  try {
    const { course_name, teacher_id, time_check } = req.body;

    if (!course_name || !teacher_id)
      return res.json({ err: "กรุณากรอกข้อมูลให้ครบถ้วน" });

    const query = `
      INSERT INTO subjects (course_name, teacher_id, time_check)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [course_name, teacher_id, time_check]);

    res.status(201).json({
      message: "เพิ่มรายวิชาสำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการเพิ่มรายวิชา" });
  }
});

// Update subject
subjectRouter.put("/update-subject/:course_id", async (req, res) => {
  try {
    const { course_id } = req.params;
    const { course_name, teacher_id, time_check } = req.body;

    if (!course_name || !teacher_id)
      return res.json({ err: "กรุณากรอกข้อมูลให้ครบถ้วน" });

    const query = `
      UPDATE subjects
      SET course_name = $1, teacher_id = $2, time_check = $3
      WHERE course_id = $4
      RETURNING *
    `;
    const result = await pool.query(query, [course_name, teacher_id, time_check, course_id]);

    res.status(200).json({
      message: "แก้ไขรายวิชาสำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการแก้ไขรายวิชา" });
  }
});

// Delete subject
subjectRouter.delete("/delete-subject/:course_id", async (req, res) => {
  try {
    const { course_id } = req.params;
    const query = `DELETE FROM subjects WHERE course_id = $1 RETURNING *`;
    const result = await pool.query(query, [course_id]);

    if (result.rows.length === 0)
      return res.status(404).json({ error: "ไม่พบรายวิชา" });

    res.status(200).json({
      message: "ลบรายวิชาสำเร็จ",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "เกิดข้อผิดพลาดในการลบรายวิชา" });
  }
});

export default subjectRouter;