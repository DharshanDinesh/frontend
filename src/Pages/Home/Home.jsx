/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import axios from "axios";
import { List, Input, Button, Row, Col, Select, Typography, Modal } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";

export const Home = () => {
  const [isRoomsUpdated, refreshRooms] = useState(false);
  return (
    <Row justify="space-evenly" align="stretch">
      <Col xs={24} sm={24} md={12} lg={8} span={4}>
        <SupportDataCenterCRUD params="source" title="Partner" />
      </Col>
      <Col xs={24} sm={24} md={12} lg={8} span={4}>
        <SupportDataCenterCRUD params="account" title="Bank Accounts" />
      </Col>{" "}
      <Col xs={24} sm={24} md={12} lg={8} span={4}>
        <SupportDataCenterCRUD params="currency" title="Currency" />
      </Col>{" "}
      <Col xs={24} sm={24} md={12} lg={8} span={4}>
        <SupportDataCenterCRUD
          params="hotel"
          title="Stay"
          isRoomsUpdated={isRoomsUpdated}
          refreshRoom={refreshRooms}
        />
      </Col>
      <Col xs={24} sm={24} md={12} lg={8} span={4}>
        <SupportDataCenterCRUD
          params="hotel"
          title="Rooms"
          isRoomsUpdated={isRoomsUpdated}
          refreshRoom={refreshRooms}
        />
      </Col>
    </Row>
  );
};

export const SupportDataCenterCRUD = ({
  params = "",
  title,
  isRoomsUpdated = false,
  refreshRoom = () => {},
}) => {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [select, setSelect] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAdd, setIsLoadingAdd] = useState(false);
  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    title === "Rooms" && fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRoomsUpdated]);

  const fetchTodos = async () => {
    setIsLoading(true);
    const response = await axios.get(
      `${import.meta.env.VITE_API_URL}/${params}`
    );
    setIsLoading(false);
    setTodos(response.data);
  };

  const addTodo = async () => {
    setIsLoadingAdd(true);
    if (title === "Rooms") {
      addRooms();
    } else {
      if (!newTodo) return;
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/${params}`,
        {
          name: newTodo,
        }
      );
      setTodos([...todos, response.data]);
      setNewTodo("");
      setIsLoadingAdd(false);

      title === "Stay" && refreshRoom((prev) => !prev);
    }
  };

  const addRooms = async () => {
    if (!newTodo) return;
    const response = await axios.put(
      `${import.meta.env.VITE_API_URL}/${params}/${select}`,
      {
        room: { name: newTodo },
      }
    );
    setTodos(response.data);
    setNewTodo("");
    setSelect(null);
    setIsLoadingAdd(false);
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${import.meta.env.VITE_API_URL}/${params}/${id}`);
    setTodos(todos.filter((todo) => todo._id !== id));
    title === "Stay" && refreshRoom((prev) => !prev);
  };

  const deleteRooms = async (hotelId, roomId) => {
    await axios.delete(
      `${import.meta.env.VITE_API_URL}/${params}/${hotelId}/rooms/${roomId}`
    );

    setTodos((prev) => {
      const updatedHotelDetails = prev.map((hotel) => ({
        ...hotel,
        rooms:
          hotel._id === hotelId
            ? hotel.rooms.filter((item) => item._id !== roomId)
            : hotel.rooms,
      }));
      return updatedHotelDetails;
    });
  };

  const renameTodo = async (id, text) => {
    const { data } = await axios.put(
      `${import.meta.env.VITE_API_URL}/${params}/${id}`,
      {
        name: text,
      }
    );
    setTodos(data);
  };
  const renameRoom = async (hotelId, roomId, renamedText) => {
    const { data } = await axios.put(
      `${import.meta.env.VITE_API_URL}/${params}/${hotelId}/rooms/${roomId}`,
      {
        name: renamedText,
      }
    );
    setTodos(data);
  };

  return (
    <div
      style={{
        margin: "1rem",
        padding: "0.75rem",
        border: "1px solid #9c9c9c",
        borderRadius: "1rem",
      }}
    >
      <h3
        style={{
          margin: "0.5rem",
        }}
      >{`${title.toUpperCase()} Details`}</h3>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          margin: "0.5rem 0rem",
        }}
      >
        <div
          style={{
            width: "70%",
            display: "flex",
          }}
        >
          <Input
            value={newTodo}
            onChange={(e) => setNewTodo(e.target.value)}
            placeholder={`Enter new ${title}`}
          />
          {title === "Rooms" && (
            <Select
              placeholder="Please select Stay"
              onChange={(val) => setSelect(val)}
              value={select}
              options={todos.map((d) => ({ label: d.name, value: d._id }))}
              style={{
                width: "50%",
              }}
            />
          )}
        </div>
        <div
          style={{
            marginLeft: "2%",
          }}
        >
          <Button onClick={addTodo} type="primary" loading={isLoadingAdd}>
            {`Add ${title}`}
          </Button>
        </div>
      </div>
      {isLoading && <>Loading....</>}
      {!isLoading && (
        <>
          {title !== "Rooms" && (
            <List
              bordered
              dataSource={todos}
              renderItem={(item) => (
                <TodoItem
                  key={item.id}
                  todo={item}
                  onEdit={renameTodo}
                  onDelete={deleteTodo}
                />
              )}
            />
          )}
          {title === "Rooms" &&
            todos.map((hotel) => (
              <>
                {hotel.name}
                <List
                  bordered
                  dataSource={hotel.rooms}
                  renderItem={(item) => (
                    <TodoItem
                      key={item.id}
                      todo={item}
                      onEdit={renameRoom}
                      onDelete={deleteRooms}
                      type={"rooms"}
                      hotel={hotel}
                    />
                  )}
                />
              </>
            ))}
        </>
      )}
    </div>
  );
};

const TodoItem = ({ todo, onEdit, onDelete, type, hotel }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [newText, setNewText] = useState(todo.name);
  const { Text } = Typography;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    type === "rooms"
      ? onEdit(hotel._id, todo._id, newText)
      : onEdit(todo._id, newText);
    setIsEditing(false);
  };

  const handleDelete = () => {
    Modal.confirm({
      title: "Are you sure you want to delete this item?",
      onOk: () => {
        type === "rooms" ? onDelete(hotel._id, todo._id) : onDelete(todo._id);
      },
    });
  };

  return (
    <List.Item
      actions={[
        isEditing ? (
          <Button type="primary" onClick={handleSave}>
            Save
          </Button>
        ) : (
          <Button icon={<EditOutlined />} onClick={handleEdit}>
            Edit
          </Button>
        ),
        // eslint-disable-next-line react/jsx-key
        <Button danger icon={<DeleteOutlined />} onClick={handleDelete}>
          Delete
        </Button>,
      ]}
    >
      {isEditing ? (
        <Input value={newText} onChange={(e) => setNewText(e.target.value)} />
      ) : (
        <Text>{todo.name}</Text>
      )}
    </List.Item>
  );
};

export default TodoItem;
